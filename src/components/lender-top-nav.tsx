"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { LenderSidebarContent } from "@/components/lender-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function LenderTopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-[#1B2B3A]">
      {/* Left: Logo + badge */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-lg p-1.5 text-white hover:bg-white/10 transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <LenderSidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <Logo variant="light" />
        <Badge className="bg-[#2BB5A0] text-white text-[10px] font-bold hidden sm:inline-flex">
          LENDER PORTAL
        </Badge>
      </div>

      {/* Right: search + bell + user */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-9 h-9 w-48 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        <ThemeToggle />

        <Link
          href="/lender"
          className="relative text-gray-300 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#2BB5A0] text-white text-xs font-bold">
              DM
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">
              David Mugisha
            </p>
            <p className="text-[10px] text-gray-400">Lender · Premium</p>
          </div>
        </div>
      </div>
    </header>
  );
}
