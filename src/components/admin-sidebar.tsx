"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Scale,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { SignOutModal } from "@/components/sign-out-modal";
import { SwitchToPortalLink } from "@/components/portal-switch-link";
import { useUser } from "@/hooks/use-dashboard";
import { useAdminStats } from "@/hooks/use-admin";
import { getInitials } from "@/lib/format";

const overviewNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
];

const platformNav = [
  { href: "/admin/users", label: "Users", icon: Users },
  {
    href: "/admin/verification",
    label: "Verification",
    icon: ShieldQuestion,
    badgeKey: "unverifiedUsers" as const,
  },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/loans", label: "Loans", icon: CreditCard },
  {
    href: "/admin/offer-templates",
    label: "Standing Offers",
    icon: ClipboardCheck,
    badgeKey: "pendingOfferTemplates" as const,
  },
  { href: "/admin/payments", label: "Wallet & Payments", icon: Wallet },
  {
    href: "/admin/disputes",
    label: "Disputes",
    icon: Scale,
    badgeKey: "openDisputes" as const,
  },
  {
    href: "/admin/support",
    label: "Support Tickets",
    icon: LifeBuoy,
    badgeKey: "openSupportTickets" as const,
  },
];

const insightsNav = [
  { href: "/admin/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: ShieldCheck },
  { href: "/admin/audit-logs", label: "Audit Log", icon: ShieldAlert },
];

const accountNav = [
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: "pendingOfferTemplates" | "unverifiedUsers" | "openDisputes" | "openSupportTickets";
};

export function AdminSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { data: user } = useUser();
  const { data: stats } = useAdminStats();
  const pendingOfferTemplates = stats?.platform.pending_offer_templates ?? 0;
  // Genuinely awaiting review (has uploaded at least one KYC document) —
  // not everyone who simply hasn't been verified yet, most of whom have
  // never touched the KYC page and have nothing for an admin to review.
  const unverifiedUsers = stats?.users.awaiting_review ?? 0;
  const openDisputes = stats?.platform.open_disputes ?? 0;
  const openSupportTickets = stats?.platform.open_support_tickets ?? 0;

  const navLink = (item: NavItem) => {
    const badge =
      item.badgeKey === "pendingOfferTemplates"
        ? pendingOfferTemplates
        : item.badgeKey === "unverifiedUsers"
          ? unverifiedUsers
          : item.badgeKey === "openDisputes"
            ? openDisputes
            : item.badgeKey === "openSupportTickets"
              ? openSupportTickets
              : undefined;
    const isActive =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
          isActive
            ? "text-[#2BB5A0] bg-white/5 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.75 before:bg-[#2BB5A0] before:rounded-full"
            : "text-gray-300 hover:text-white hover:bg-white/5"
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {!!badge && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#C4A55A] text-white text-[10px] font-bold leading-none">
            {badge}
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
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#2BB5A0] shrink-0">
          <span className="text-white font-black text-base leading-none">
            M
          </span>
        </div>
        <div className="leading-tight">
          <p className="text-white font-bold text-base leading-none">Mpola</p>
          <p className="text-[#2BB5A0] text-[10px] font-semibold tracking-widest uppercase mt-0.5">
            Admin Portal
          </p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {sectionLabel("Overview")}
        <div className="space-y-0.5">{overviewNav.map(navLink)}</div>

        {sectionLabel("Platform")}
        <div className="space-y-0.5">{platformNav.map(navLink)}</div>

        {sectionLabel("Insights")}
        <div className="space-y-0.5">{insightsNav.map(navLink)}</div>

        {sectionLabel("Account")}
        <div className="space-y-0.5">{accountNav.map(navLink)}</div>
      </nav>

      {/* ── User footer ── */}
      <div className="p-3 border-t border-white/10">
        <SwitchToPortalLink
          onNavigate={onNavigate}
          className="flex items-center gap-2 px-2 py-2 mb-1 text-sm text-gray-400 hover:text-white transition-colors"
        />
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2BB5A0] shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.fullName ? getInitials(user.fullName) : "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-tight truncate">
              {user?.fullName ?? "Loading…"}
            </p>
            <p className="text-[#2BB5A0] text-[11px] leading-tight">Admin</p>
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

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col min-h-0 shrink-0">
      <AdminSidebarContent />
    </aside>
  );
}
