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
  "/guarantor",
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
  // Admin access is orthogonal to the borrower/lender portal role — an
  // account can be BOTH (e.g. a lender who also moderates the platform),
  // via the is_admin flag, or a legacy pure-admin account (role itself is
  // "admin"/"super_admin", with no portal identity of its own).
  const isAdmin =
    role === "admin" ||
    role === "super_admin" ||
    request.cookies.get("lf_is_admin")?.value === "true";
  const isLenderRole = role === "lender";
  const isBorrowerRole = role === "borrower";
  // Default landing for this account — admin takes priority since that's
  // the more privileged view; the sidebar switcher gets them to their
  // portal dashboard from there.
  const dest = isAdmin ? "/admin" : isLenderRole ? "/lender" : "/dashboard";

  // Redirect logged-in users away from sign-in/register pages to their portal
  if (
    token &&
    AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
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
    signInUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based path protection. Each portal is normally confined to its own
  // area, but a dual-role account (admin + lender, or admin + borrower) is
  // allowed into BOTH its admin area and its own portal area — never into a
  // portal that doesn't match its actual borrower/lender role, though.
  const canAdmin = isAdmin;
  const canLender = isLenderRole;
  const canBorrower = isBorrowerRole || (!isLenderRole && !isAdmin); // default bucket for unset/legacy roles

  if (pathname.startsWith("/admin") && !canAdmin) {
    return NextResponse.redirect(new URL(dest, request.url));
  }
  if (pathname.startsWith("/lender") && !canLender) {
    return NextResponse.redirect(new URL(dest, request.url));
  }
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/apply")) &&
    !canBorrower
  ) {
    return NextResponse.redirect(new URL(dest, request.url));
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
