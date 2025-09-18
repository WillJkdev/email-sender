import { SESSION_COOKIE_NAME } from "@/auth.config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isLogin = nextUrl.pathname === "/login";
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isLoggedIn = !!sessionCookie;

  if (!isLoggedIn && !isLogin)
    return NextResponse.redirect(new URL("/login", nextUrl));
  if (isLoggedIn && isLogin)
    return NextResponse.redirect(new URL("/", nextUrl));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|ico|svg|jpg|jpeg|webp)$).*)",
  ],
};
