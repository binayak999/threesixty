import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_ROLES = ["admin", "superadmin"] as const;

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      user?: { id: string; email: string; name: string; role: string };
      token?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Sign in failed. Please try again." },
        { status: res.status }
      );
    }

    const user = data.user;
    if (!user?.email || !user?.role) {
      return NextResponse.json(
        { message: "Invalid response from server." },
        { status: 502 }
      );
    }

    const sessionValue =
      typeof data.token === "string"
        ? data.token
        : Buffer.from(
            JSON.stringify({
              id: user.id,
              email: user.email,
              name: user.name ?? user.email,
              role: user.role,
            }),
            "utf8"
          ).toString("base64url");

    const cookieStore = await cookies();
    cookieStore.set("auth_session", sessionValue, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    const redirectTo =
      ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])
        ? "/dashboard"
        : "/";

    return NextResponse.json({ redirectTo });
  } catch (err) {
    console.error("Sign-in proxy error:", err);
    return NextResponse.json(
      {
        message:
          "Unable to reach the server. Make sure the backend is running on port 4000.",
      },
      { status: 503 }
    );
  }
}
