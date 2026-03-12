import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const parentOnly = searchParams.get("parentOnly");
    const publishedOnly = searchParams.get("publishedOnly");
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (parentOnly) params.set("parentOnly", parentOnly);
    if (publishedOnly) params.set("publishedOnly", publishedOnly);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_URL}/api/categories${query}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Categories fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Category create error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 503 }
    );
  }
}
