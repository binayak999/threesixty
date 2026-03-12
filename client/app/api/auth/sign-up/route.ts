import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body ?? {};
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }
    if (typeof password === "string" && password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    // TODO: Create user via your backend (e.g. server API or DB).
    return NextResponse.json(
      { message: "Sign up is not yet connected to a backend. Configure your auth API." },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      { message: "Invalid request." },
      { status: 400 }
    );
  }
}
