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

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
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
