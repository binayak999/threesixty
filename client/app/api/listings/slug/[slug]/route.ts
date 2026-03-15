import { NextResponse } from "next/server";

const rawUrl = process.env.API_URL || "http://localhost:4000";
const API_BASE = rawUrl.replace(/\/api\/?$/, "");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/listings/slug/${encodeURIComponent(slug)}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Listing by slug fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch listing" },
      { status: 503 }
    );
  }
}
