import { NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/countries`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Countries fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch countries" },
      { status: 503 }
    );
  }
}
