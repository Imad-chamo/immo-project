import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/", "/tarifs", "/a-propos", "/contact", "/auth"];
const CLIENT_ROUTES = ["/dashboard/client"];
const INSPECTOR_ROUTES = ["/dashboard/inspector"];
const ADMIN_ROUTES = ["/dashboard/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role;

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }

  if (
    INSPECTOR_ROUTES.some((r) => pathname.startsWith(r)) &&
    role !== "INSPECTOR" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }

  if (
    CLIENT_ROUTES.some((r) => pathname.startsWith(r)) &&
    role !== "CLIENT" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
