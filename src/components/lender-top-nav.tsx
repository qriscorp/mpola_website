"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LenderSidebarContent } from "@/components/lender-sidebar";

/**
 * Slim top bar shown ONLY on mobile (lg+ uses the sidebar's own logo area).
 * On desktop the page header is rendered per-page via <LenderPageHeader>.
 */
export function LenderTopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#1B2B3A] border-b border-white/10">
      {/* Left: hamburger + logo */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-1.5 text-white hover:bg-white/10 transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-64 bg-[#1B2B3A] border-r-0"
          >
            <LenderSidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-[#C4A55A]">
            <span className="text-white font-black text-xs leading-none">
              L
            </span>
          </div>
          <span className="text-white font-bold text-sm">WeLend</span>
        </div>
      </div>

      {/* Right: bell */}
      <Link
        href="/lender/notifications"
        className="relative p-1.5 text-gray-300 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full" />
      </Link>
    </header>
  );
}

/**
 * Per-page header row used inside the main content area on desktop.
 * Renders the page title + notification bell + "+ Post an Offer" CTA.
 */
export function LenderPageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2B3A] dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <Link
          href="/lender/notifications"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Link>
        <Link
          href="/lender/post-offer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C4A55A] hover:bg-[#b3944a] text-white text-sm font-semibold transition-colors"
        >
          + Post an Offer
        </Link>
      </div>
    </div>
  );
}
