import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/auth/session/route";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function GET() {
  try {
    const user = await getSessionUser();
    const userId = user?.id ?? null;
    if (!userId) {
      return NextResponse.json({ items: [] });
    }
    const res = await fetch(`${API_URL}/api/media?userId=${encodeURIComponent(userId)}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ items: [] });
    }
    return NextResponse.json({ items: data?.data ?? data?.items ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
