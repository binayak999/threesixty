import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:4000";

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  if (!sessionCookie?.value) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, "base64url").toString("utf8")
    ) as { id?: string };
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}/limits`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Profile limits fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load limits" },
      { status: 503 }
    );
  }
}
