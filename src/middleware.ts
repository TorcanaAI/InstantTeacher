import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname === "/setup" ||
    nextUrl.pathname.startsWith("/signup/");

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl.origin));
    }
    return;
  }

  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/parent") ||
    nextUrl.pathname.startsWith("/teacher") ||
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/session");

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl.origin));
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
