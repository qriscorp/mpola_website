import { NextResponse, type NextRequest } from "next/server";

// Pages that should redirect logged-in users away to their portal
const AUTH_ONLY_PATHS = [
  "/auth/signin",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/lender-signin",
  "/auth/lender-register",
];

// Pages accessible without login (and without logged-in redirect)
const PUBLIC_PATHS = [
  "/",
  "/auth/verify",
  "/auth/verify-email",
  "/auth/verify-phone",
  "/how-it-works",
  "/learn-more",
  "/platform-terms",
  "/privacy-policy",
  "/borrower-code-of-conduct",
  "/lender-code-of-conduct",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through static files, API routes, _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("lf_token")?.value;
  const role = request.cookies.get("lf_role")?.value || "borrower";
  const isAdmin = role === "admin" || role === "super_admin";
  const isLenderRole = role === "lender";

  // Redirect logged-in users away from sign-in/register pages to their portal
  if (
    token &&
    AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    const dest = isAdmin ? "/admin" : isLenderRole ? "/lender" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Allow auth-only and other public paths for guests
  if (
    [...AUTH_ONLY_PATHS, ...PUBLIC_PATHS].some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    )
  ) {
    return NextResponse.next();
  }

  // Require token for all other paths
  if (!token) {
    const signInPath = pathname.startsWith("/lender")
      ? "/auth/lender-signin"
      : "/auth/signin";
    const signInUrl = new URL(signInPath, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Strict role-based path protection — each role is confined to its own portal
  if (isAdmin) {
    // Admins → /admin only
    if (
      pathname.startsWith("/lender") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/apply")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else if (isLenderRole) {
    // Lenders → /lender only
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/apply")
    ) {
      return NextResponse.redirect(new URL("/lender", request.url));
    }
  } else {
    // Borrowers → /dashboard and /apply only
    if (pathname.startsWith("/admin") || pathname.startsWith("/lender")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Enforce email verification
  const verified = request.cookies.get("lf_verified")?.value;
  if (verified === "false") {
    return NextResponse.redirect(new URL("/auth/verify-email", request.url));
  }

  // Enforce phone verification (only after email is verified)
  const phoneVerified = request.cookies.get("lf_phone_verified")?.value;
  if (verified === "true" && phoneVerified === "false") {
    return NextResponse.redirect(new URL("/auth/verify-phone", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
