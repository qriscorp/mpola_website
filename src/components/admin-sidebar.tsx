"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Wallet,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { SignOutModal } from "@/components/sign-out-modal";

const adminNav = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: FileText, label: "Applications", href: "/admin/applications" },
  { icon: CreditCard, label: "Loans", href: "/admin/loans" },
  { icon: Wallet, label: "Wallet & Payments", href: "/admin/payments" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#1B2B3A] text-white">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Logo variant="light" />
          <Badge className="bg-[#C4A55A] text-[#1B2B3A] text-[10px] font-bold">
            ADMIN
          </Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {adminNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#2BB5A0] text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-[#2BB5A0] flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">System Admin</p>
            <p className="text-[10px] text-gray-400">admin@lendflow.ug</p>
          </div>
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Portal
        </Link>
        <button
          onClick={() => setSignOutOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>

        <SignOutModal open={signOutOpen} onOpenChange={setSignOutOpen} />
      </div>
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
