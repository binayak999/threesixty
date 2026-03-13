import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/sessionUser";

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({ user: user ?? null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
