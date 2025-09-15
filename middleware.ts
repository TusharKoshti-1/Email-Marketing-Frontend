import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // JWT from HttpOnly cookie
  const { pathname } = req.nextUrl;

  const isPublicPath =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api"); // allow API

  // Not logged in and not in public path → redirect
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Logged in and tries to access signin → redirect to dashboard
  if (token && pathname.startsWith("/signin")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};