"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, Search, Shield, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebarContent } from "@/components/admin-sidebar";

export function AdminTopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white dark:bg-gray-950 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <AdminSidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 lg:hidden">
          <Shield className="h-5 w-5 text-[#2BB5A0]" />
          <span className="font-bold text-[#1B2B3A] dark:text-white text-sm">
            Mpola Admin
          </span>
        </div>
        <div className="hidden sm:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, loans, applications..."
            className="pl-9 w-64 lg:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/admin"
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            5
          </span>
        </Link>
        <Badge className="bg-[#C4A55A]/10 text-[#C4A55A] border border-[#C4A55A]/30 hidden sm:inline-flex">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      </div>
    </header>
  );
}
