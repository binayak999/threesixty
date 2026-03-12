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
    const blogId = searchParams.get("blogId") ?? "";
    const approvedOnly = searchParams.get("approvedOnly") ?? "";
    const query = new URLSearchParams();
    if (blogId) query.set("blogId", blogId);
    if (approvedOnly) query.set("approvedOnly", approvedOnly);
    const qs = query.toString();
    const res = await fetch(`${API_URL}/api/blog-comments${qs ? `?${qs}` : ""}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Blog comments fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch comments" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = await getUserId();
    const res = await fetch(`${API_URL}/api/blog-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, user: userId || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Blog comment create error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to post comment" },
      { status: 503 }
    );
  }
}
