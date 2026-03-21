import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth.js v5 uses `__Secure-authjs.session-token` on HTTPS and `authjs.session-token` on HTTP.
 * `getToken({ req, secret })` defaults to secureCookie: false, so on Vercel/production it reads the
 * WRONG cookie name → token is always null → every protected route redirects to login forever.
 */
function secureCookiesForRequest(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded === "https") return true;
  if (forwarded === "http") return false;
  return req.nextUrl.protocol === "https:";
}

async function readSessionToken(req: NextRequest, secret: string | undefined) {
  if (!secret) return null;
  const secure = secureCookiesForRequest(req);
  let token = await getToken({ req, secret, secureCookie: secure });
  // If proto headers lie or edge case, try the other cookie name
  if (!token) {
    token = await getToken({ req, secret, secureCookie: !secure });
  }
  return token;
}

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const token = await readSessionToken(req, secret);
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;
  const { nextUrl } = req;

  const isAuthPage =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname === "/setup" ||
    nextUrl.pathname.startsWith("/signup/");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
    return NextResponse.next();
  }

  // Admin login is at /auth/login (public). All /admin/* requires auth; layout enforces ADMIN role.
  const isAuthLogin = nextUrl.pathname === "/auth/login";
  if (isAuthLogin) return NextResponse.next();
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl.origin));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/auth/login?error=forbidden", nextUrl.origin)
      );
    }
    return NextResponse.next();
  }

  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/parent") ||
    nextUrl.pathname.startsWith("/teacher") ||
    nextUrl.pathname.startsWith("/session");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
