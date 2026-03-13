import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/auth/session/route";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const userId = user?.id ?? null;
    if (!userId) {
      return NextResponse.json({ message: "Sign in to import media.", item: null }, { status: 401 });
    }
    const body = await request.json();
    const { url } = body ?? {};
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { message: "URL is required.", item: null },
        { status: 400 }
      );
    }
    const res = await fetch(`${API_URL}/api/media/import-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: (data as { message?: string }).message || "Import failed", item: null },
        { status: res.status }
      );
    }
    const item = (data as { data?: unknown }).data ?? null;
    return NextResponse.json({ item });
  } catch (err) {
    console.error("Media import-url proxy error:", err);
    return NextResponse.json(
      { message: "Import failed", item: null },
      { status: 503 }
    );
  }
}
