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
      return NextResponse.json({ message: "Sign in to upload media.", items: [] }, { status: 401 });
    }
    const formData = await request.formData();
    formData.set("userId", userId);
    const res = await fetch(`${API_URL}/api/media/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Upload failed", items: [] },
        { status: res.status }
      );
    }
    const items = data?.data ?? data?.items ?? [];
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Media upload proxy error:", err);
    return NextResponse.json(
      { message: "Upload failed", items: [] },
      { status: 503 }
    );
  }
}
