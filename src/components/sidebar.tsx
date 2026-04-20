"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  Wallet,
  PlusCircle,
  Clock,
  UserCircle,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SignOutModal } from "@/components/sign-out-modal";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/offers", label: "My Offers", icon: Sparkles, badge: 3 },
  { href: "/dashboard/repayments", label: "Repayments", icon: Calendar },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const applicationNav = [
  { href: "/dashboard/apply", label: "New Application", icon: PlusCircle },
  { href: "/dashboard/status", label: "Status", icon: Clock },
];

const accountNav = [
  { href: "/dashboard/profile", label: "Profile & KYC", icon: UserCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const navLink = (item: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
        )}
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
            Application
          </p>
          <div className="space-y-1">{applicationNav.map(navLink)}</div>
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

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-col min-h-0 shrink-0">
      <SidebarContent />
    </aside>
  );
}
