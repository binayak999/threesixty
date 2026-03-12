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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    const all = searchParams.get("all");
    if (all === "1" || all === "true") params.set("all", "1");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    if (search) params.set("search", search);
    const qs = params.toString() ? `?${params}` : "";
    const res = await fetch(`${API_URL}/api/videos${qs}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Videos fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch videos" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Video create error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create video" },
      { status: 503 }
    );
  }
}
