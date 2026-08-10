"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ListOrdered,
  Activity,
  Calendar,
  CreditCard,
  Receipt,
  Wallet,
  User,
  Settings,
  LogOut,
  Gift,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutModal } from "@/components/sign-out-modal";
import { SwitchToAdminLink } from "@/components/portal-switch-link";
import { useUser, useDashboardStats } from "@/hooks/use-dashboard";
import { useGuarantorRequests } from "@/hooks/use-guarantors";
import { getInitials } from "@/lib/format";

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/dashboard/approvals",
        label: "Approvals",
        icon: CheckCircle2,
        badgeKey: "pendingApprovals" as const,
      },
    ],
  },
  {
    label: "BORROW",
    items: [
      { href: "/dashboard/apply", label: "Apply for a Loan", icon: FileText },
      {
        href: "/dashboard/my-requests",
        label: "My Requests",
        icon: ListOrdered,
        badgeKey: "applicationsPending" as const,
      },
      {
        href: "/dashboard/offers-received",
        label: "Offers Received",
        icon: Activity,
        badgeKey: "newOffers" as const,
      },
    ],
  },
  {
    label: "MY LOANS",
    items: [
      {
        href: "/dashboard/repayments",
        label: "Repayment Schedule",
        icon: Calendar,
      },
      {
        href: "/dashboard/repayments/pay",
        label: "Make a Payment",
        icon: CreditCard,
      },
      { href: "/dashboard/receipts", label: "Payment Receipts", icon: Receipt },
    ],
  },
  {
    label: "FINANCE",
    items: [{ href: "/dashboard/wallet", label: "Wallet", icon: Wallet }],
  },
  {
    label: "SUPPORT",
    items: [
      { href: "/dashboard/referrals", label: "Invite Friends", icon: Gift },
      { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
      { href: "/dashboard/disputes", label: "Disputes", icon: AlertTriangle },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/dashboard/profile", label: "Profile & KYC", icon: User },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { data: user } = useUser();
  const { data: stats } = useDashboardStats();
  const { data: guarantorRequests } = useGuarantorRequests("pending");
  const badgeValues = {
    ...stats,
    pendingApprovals: guarantorRequests?.requests.length ?? 0,
  };

  const navLink = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
    badgeKey?: "applicationsPending" | "newOffers" | "pendingApprovals";
  }) => {
    const badge = item.badgeKey ? badgeValues[item.badgeKey] : undefined;
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
          isActive
            ? "text-[#2BB5A0] bg-white/5 border-l-2 border-[#2BB5A0] pl-2.5"
            : "text-white/60 hover:text-white hover:bg-white/5",
        )}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {!!badge && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#2BB5A0] text-white text-[10px] font-bold">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1B2B3A]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-[#2BB5A0] flex items-center justify-center font-extrabold text-white text-xl leading-none">
          M
        </div>
        <div>
          <p className="text-white font-extrabold text-lg leading-none">
            Mpola
          </p>
          <p className="text-[#2BB5A0] text-[10px] font-bold uppercase tracking-widest">
            Borrower Portal
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 py-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-0.5">{group.items.map(navLink)}</div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <SwitchToAdminLink
          onNavigate={onNavigate}
          className="flex items-center gap-2 px-2 py-2 mb-1 text-sm text-white/60 hover:text-white transition-colors"
        />
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-[#2BB5A0] flex items-center justify-center font-bold text-white text-sm shrink-0">
            {user?.fullName ? getInitials(user.fullName) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {user?.fullName ?? "Loading…"}
            </p>
            <p className="text-[#2BB5A0] text-[11px] font-medium">Borrower</p>
          </div>
          <button
            onClick={() => setSignOutOpen(true)}
            className="text-white/40 hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SignOutModal open={signOutOpen} onOpenChange={setSignOutOpen} />
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col min-h-0 shrink-0">
      <SidebarContent />
    </aside>
  );
}
