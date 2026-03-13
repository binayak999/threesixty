import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DASHBOARD_PATH = "/dashboard";

/** Read role from cookie: supports JWT (payload.role) or legacy base64 JSON. */
function getRoleFromSessionCookie(cookieValue: string): string | null {
  try {
    // JWT: base64url payload is the second part
    if (cookieValue.startsWith("eyJ")) {
      const parts = cookieValue.split(".");
      if (parts.length >= 2) {
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        base64 += "==".slice(0, (4 - (base64.length % 4)) % 4);
        const decoded = atob(base64);
        const payload = JSON.parse(decoded) as { role?: string };
        return payload?.role ?? null;
      }
    }
    // Legacy: whole cookie is base64url JSON
    let base64 = cookieValue.replace(/-/g, "+").replace(/_/g, "/");
    base64 += "==".slice(0, (4 - (base64.length % 4)) % 4);
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
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
