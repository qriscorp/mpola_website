"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Activity,
  User,
  Briefcase,
  FileSearch,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { SignOutModal } from "@/components/sign-out-modal";

// ─── Nav structure matching new design ───────────────────
const overviewNav = [
  { href: "/lender", label: "Dashboard", icon: LayoutDashboard },
];

const lendingNav = [
  { href: "/lender/post-offer", label: "Post an Offer", icon: PlusCircle },
  { href: "/lender/offers", label: "My Offers", icon: FileText, badge: 3 },
  {
    href: "/lender/applications",
    label: "Applications",
    icon: Activity,
    badge: 7,
  },
  { href: "/lender/applicant", label: "Applicant Profile", icon: User },
  { href: "/lender/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/lender/loan-detail", label: "Loan Detail", icon: FileSearch },
];

const financeNav = [
  { href: "/lender/wallet", label: "Wallet", icon: Wallet },
  { href: "/lender/earnings", label: "Earnings", icon: TrendingUp },
];

const accountNav = [
  { href: "/lender/account", label: "Account & Licence", icon: ShieldCheck },
  { href: "/lender/settings", label: "Settings", icon: Settings },
];

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

export function LenderSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const navLink = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/lender" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
          isActive
            ? "text-[#C4A55A] bg-white/5 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.75 before:bg-[#C4A55A] before:rounded-full"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#C4A55A] text-white text-[10px] font-bold leading-none">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const sectionLabel = (label: string) => (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest select-none">
      {label}
    </p>
  );

  return (
    <div className="flex flex-col h-full bg-[#1B2B3A]">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#C4A55A] shrink-0">
          <span className="text-white font-black text-base leading-none">
            L
          </span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-base leading-none">WeLend</p>
          <p className="text-[#C4A55A] text-[10px] font-semibold tracking-widest uppercase mt-0.5">
            Lender Portal
          </p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sectionLabel("Overview")}
        <div className="space-y-0.5">{overviewNav.map(navLink)}</div>

        {sectionLabel("My Lending")}
        <div className="space-y-0.5">{lendingNav.map(navLink)}</div>

        {sectionLabel("Finance")}
        <div className="space-y-0.5">{financeNav.map(navLink)}</div>

        {sectionLabel("Account")}
        <div className="space-y-0.5">{accountNav.map(navLink)}</div>
      </nav>

      {/* ── User footer ── */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C4A55A] shrink-0">
            <span className="text-white text-xs font-bold">JM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate">
              James Mugisha
            </p>
            <p className="text-[#C4A55A] text-[11px] leading-tight">
              Licensed Lender
            </p>
          </div>
          <button
            onClick={() => setSignOutOpen(true)}
            title="Sign out"
            className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SignOutModal open={signOutOpen} onOpenChange={setSignOutOpen} />
    </div>
  );
}

export function LenderSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col min-h-0 shrink-0">
      <LenderSidebarContent />
    </aside>
  );
}
