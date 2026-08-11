import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/cookies";

// Coarse gate at the edge: bounce guests off protected pages and signed-in
// users off the auth pages. Real token verification still happens in the API
// layer — this only avoids flashing a page you can't use.
const PROTECTED = ["/dashboard", "/profile", "/accounts", "/security", "/privacy", "/activity", "/devices", "/admin"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession =
    req.cookies.has(ACCESS_COOKIE) || req.cookies.has(REFRESH_COOKIE);

  const onProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const onAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (onProtected && !hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (onAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/accounts/:path*",
    "/security/:path*",
    "/privacy/:path*",
    "/activity/:path*",
    "/devices/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
