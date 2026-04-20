import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/auth/signin",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  // Allow static files, api routes, _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Check for auth token (cookie-based in production)
  const token = request.cookies.get("lf_token")?.value;

  // In development / demo mode, allow all access
  // In production, uncomment the redirect below:
  // if (!token) {
  //   const signInUrl = new URL("/auth/signin", request.url);
  //   signInUrl.searchParams.set("redirect", pathname);
  //   return NextResponse.redirect(signInUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
