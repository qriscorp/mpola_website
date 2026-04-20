"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

export function TopNav() {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-[#1B2B3A] flex items-center px-4 shrink-0">
      <div className="flex items-center gap-3">
        <MobileNav />
        <Logo variant="light" />
        <Badge className="hidden sm:inline-flex bg-[#2BB5A0]/20 text-[#2BB5A0] text-[10px] font-semibold border-0 rounded-md uppercase tracking-wider">
          Borrower Portal
        </Badge>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <button
          className="text-gray-300 hover:text-white transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <Link
          href="/dashboard/notifications"
          className="relative text-gray-300 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2BB5A0] rounded-full" />
        </Link>
        <div className="flex items-center gap-2 ml-1 sm:ml-2">
          <Avatar className="h-8 w-8 bg-[#2BB5A0]">
            <AvatarFallback className="bg-[#2BB5A0] text-white text-xs font-semibold">
              SN
            </AvatarFallback>
          </Avatar>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white leading-tight">
              Sarah Nakato
            </p>
            <p className="text-[10px] text-gray-400">Borrower · Kampala</p>
          </div>
        </div>
      </div>
    </header>
  );
}
