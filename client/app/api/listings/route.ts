import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") ?? "";
    const featuredOnly = searchParams.get("featuredOnly") ?? "";
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const params = new URLSearchParams();
    if (all) params.set("all", "1");
    if (featuredOnly) params.set("featuredOnly", "1");
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    const query = params.toString() ? `?${params}` : "";
    const res = await fetch(`${API_URL}/api/listings${query}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Listings fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch listings" },
      { status: 503 }
    );
  }
}
