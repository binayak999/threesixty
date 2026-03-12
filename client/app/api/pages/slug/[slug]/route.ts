import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/pages/slug/${encodeURIComponent(slug)}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Page by slug fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch page" },
      { status: 503 }
    );
  }
}
