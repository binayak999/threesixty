import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export type UserRole = "user" | "admin" | "superadmin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }
    // TODO: Decode JWT or lookup session from your backend.
    // For now we accept a base64 JSON payload for development: { id, email, name, role }.
    try {
      const payload = JSON.parse(
        Buffer.from(sessionCookie.value, "base64url").toString("utf8")
      ) as SessionUser;
      if (payload?.email && payload?.role) {
        const role = payload.role as UserRole;
        if (!["user", "admin", "superadmin"].includes(role)) {
          return NextResponse.json({ user: null });
        }
        return NextResponse.json({
          user: {
            id: payload.id ?? "",
            email: payload.email,
            name: payload.name ?? payload.email,
            role,
          },
        });
      }
    } catch {
      // Invalid or missing payload
    }
    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
