import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("publishedOnly");
    const featuredOnly = searchParams.get("featuredOnly");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const params = new URLSearchParams();
    if (publishedOnly) params.set("publishedOnly", publishedOnly);
    if (featuredOnly) params.set("featuredOnly", "1");
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    const qs = params.toString() ? `?${params}` : "";
    const res = await fetch(`${API_URL}/api/blogs${qs}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Blogs fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blogs" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");
    let userId: string | null = null;
    if (sessionCookie?.value) {
      try {
        const payload = JSON.parse(
          Buffer.from(sessionCookie.value, "base64url").toString("utf8")
        ) as { id?: string };
        userId = payload?.id ?? null;
      } catch {
        // ignore
      }
    }
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, user: userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Blog create error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create blog" },
      { status: 503 }
    );
  }
}
