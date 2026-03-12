import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_PATH = "/dashboard";

function getRoleFromSessionCookie(cookieValue: string): string | null {
  try {
    const base64 = cookieValue.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    const payload = JSON.parse(decoded) as { role?: string };
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith(DASHBOARD_PATH)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("auth_session")?.value;
  if (!sessionCookie) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signIn);
  }

  const role = getRoleFromSessionCookie(sessionCookie);
  const allowedRoles = ["admin", "superadmin"];
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
