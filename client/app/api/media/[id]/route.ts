import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/api/auth/session/route";

const API_URL = process.env.API_URL || "http://localhost:4000";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  const userId = user?.id ?? null;
  if (!userId) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    const res = await fetch(`${API_URL}/api/media/${id}?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Media delete error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete media" },
      { status: 503 }
    );
  }
}
