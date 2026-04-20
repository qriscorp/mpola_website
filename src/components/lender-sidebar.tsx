"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Briefcase,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { SignOutModal } from "@/components/sign-out-modal";

const mainNav = [
  { href: "/lender", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/lender/marketplace",
    label: "Marketplace",
    icon: Store,
    badge: 128,
  },
  { href: "/lender/portfolio", label: "My Portfolio", icon: Briefcase },
  { href: "/lender/wallet", label: "Wallet", icon: Wallet },
];

const analyticsNav = [
  { href: "/lender/earnings", label: "Earnings", icon: TrendingUp },
];

const accountNav = [
  { href: "/lender/account", label: "Account & Licence", icon: ShieldCheck },
  { href: "/lender/settings", label: "Settings", icon: Settings },
];

export function LenderSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const navLink = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/lender" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        }`}
      >
        <item.icon className="w-4 h-4" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <Badge className="bg-[#2BB5A0] text-white text-[10px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div className="space-y-1">{mainNav.map(navLink)}</div>
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Analytics
          </p>
          <div className="space-y-1">{analyticsNav.map(navLink)}</div>
        </div>
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Account
          </p>
          <div className="space-y-1">{accountNav.map(navLink)}</div>
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setSignOutOpen(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <SignOutModal open={signOutOpen} onOpenChange={setSignOutOpen} />
    </div>
  );
}

export function LenderSidebar() {
  return (
    <aside className="hidden lg:flex w-56 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-col min-h-0 shrink-0">
      <LenderSidebarContent />
    </aside>
  );
}
