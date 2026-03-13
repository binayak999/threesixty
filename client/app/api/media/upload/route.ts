import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/sessionUser";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    const userId = user?.id ?? null;
    if (!userId) {
      return NextResponse.json({ message: "Sign in to upload media.", items: [] }, { status: 401 });
    }
    const formData = await request.formData();
    formData.set("userId", userId);
    const uploadUrl = `${API_URL}/api/media/upload?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(uploadUrl, {
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
