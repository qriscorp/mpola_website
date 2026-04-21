import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/auth/signin",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify",
  "/auth/verify-email",
  "/auth/verify-phone",
  "/auth/lender-signin",
  "/auth/lender-register",
  "/how-it-works",
  "/learn-more",
  "/platform-terms",
  "/privacy-policy",
  "/borrower-code-of-conduct",
  "/lender-code-of-conduct",
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

  // Check for auth token (cookie-based)
  const token = request.cookies.get("lf_token")?.value;

  if (!token) {
    // Determine redirect: lender paths → lender sign-in, else borrower sign-in
    const isLenderPath = pathname.startsWith("/lender");
    const signInPath = isLenderPath ? "/auth/lender-signin" : "/auth/signin";
    const signInUrl = new URL(signInPath, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Enforce email verification
  const verified = request.cookies.get("lf_verified")?.value;
  if (verified === "false") {
    return NextResponse.redirect(new URL("/auth/verify-email", request.url));
  }

  // Enforce phone verification (only if email is already verified)
  const phoneVerified = request.cookies.get("lf_phone_verified")?.value;
  if (verified === "true" && phoneVerified === "false") {
    return NextResponse.redirect(new URL("/auth/verify-phone", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
