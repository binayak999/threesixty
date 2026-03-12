import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    let userId: string;
    try {
      const payload = JSON.parse(
        Buffer.from(sessionCookie.value, "base64url").toString("utf8")
      ) as { id?: string };
      userId = payload?.id ?? "";
    } catch {
      return NextResponse.json({ message: "Invalid session." }, { status: 401 });
    }
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const res = await fetch(`${API_URL}/api/listings/create-full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: (data as { message?: string }).message || "Failed to create listing." },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("Listings create error:", e);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
