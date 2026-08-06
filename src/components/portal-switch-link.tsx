"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ShieldCheck } from "lucide-react";
import { getCookie } from "@/lib/api";

/**
 * Admin access is orthogonal to the account's borrower/lender portal role —
 * an account can be BOTH (e.g. a lender who also moderates the platform).
 * Cookies are read after mount (not during render) to avoid an SSR/CSR
 * hydration mismatch, since `document.cookie` doesn't exist on the server.
 */
function usePortalAccess() {
  const [access, setAccess] = useState<{ isAdmin: boolean; role?: string }>({
    isAdmin: false,
  });

  useEffect(() => {
    setAccess({
      isAdmin: getCookie("lf_is_admin") === "true",
      role: getCookie("lf_role"),
    });
  }, []);

  return access;
}

/** Shown in the admin sidebar — jumps back to the account's lender/borrower dashboard, if it has one. */
export function SwitchToPortalLink({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const { role } = usePortalAccess();
  if (role !== "lender" && role !== "borrower") return null;

  const dest = role === "lender" ? "/lender" : "/dashboard";
  const label =
    role === "lender" ? "Switch to Lender Dashboard" : "Switch to Borrower Dashboard";

  return (
    <Link
      href={dest}
      onClick={onNavigate}
      className={
        className ??
        "flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
      }
    >
      <ArrowLeftRight className="h-4 w-4" />
      {label}
    </Link>
  );
}

/** Shown in the lender/borrower sidebar — jumps into the admin dashboard, for accounts that also have admin access. */
export function SwitchToAdminLink({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const { isAdmin } = usePortalAccess();
  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className={
        className ??
        "flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
      }
    >
      <ShieldCheck className="h-4 w-4" />
      Switch to Admin Dashboard
    </Link>
  );
}
