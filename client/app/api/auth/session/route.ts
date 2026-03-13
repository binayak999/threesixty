import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type UserRole = "user" | "admin" | "superadmin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
};

function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.sub || !decoded?.email || !decoded?.role) return null;
    const role = decoded.role as UserRole;
    if (!["user", "admin", "superadmin"].includes(role)) return null;
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? decoded.email,
      role,
    };
  } catch {
    return null;
  }
}

function parseLegacyPayload(value: string): SessionUser | null {
  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    ) as SessionUser;
    if (!payload?.email || !payload?.role) return null;
    if (!["user", "admin", "superadmin"].includes(payload.role as UserRole))
      return null;
    return {
      id: payload.id ?? "",
      email: payload.email,
      name: payload.name ?? payload.email,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }
    const value = sessionCookie.value;
    const user =
      value.startsWith("eyJ") // JWT format
        ? verifySessionToken(value)
        : parseLegacyPayload(value);
    if (user) {
      return NextResponse.json({ user });
    }
    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
