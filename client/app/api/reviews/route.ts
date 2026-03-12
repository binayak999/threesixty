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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const url = listingId
      ? `${API_URL}/api/reviews?listingId=${encodeURIComponent(listingId)}`
      : `${API_URL}/api/reviews`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Reviews fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ message: "Sign in to submit a review." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { listingId, rating, comment, reviewMedias } = body;
    if (!listingId || rating == null || !comment) {
      return NextResponse.json(
        { message: "listingId, rating, and comment are required." },
        { status: 400 }
      );
    }
    const payload: { listing: string; user: string; rating: number; comment: string; reviewMedias?: string[] } = {
      listing: listingId,
      user: userId,
      rating: Number(rating),
      comment: String(comment).trim(),
    };
    if (Array.isArray(reviewMedias) && reviewMedias.length > 0) {
      payload.reviewMedias = reviewMedias.filter((id: unknown) => typeof id === "string" && id);
    }
    const res = await fetch(`${API_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Review create error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 503 }
    );
  }
}
