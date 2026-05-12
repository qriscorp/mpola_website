"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";

export function TopNav() {
  return (
    <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#1B2B3A] flex items-center px-4 shrink-0">
      <MobileNav />
      <div className="flex items-center gap-2 ml-2">
        <div className="h-7 w-7 rounded-lg bg-[#2BB5A0] flex items-center justify-center font-extrabold text-white text-sm leading-none">
          L
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-none">
            Mpola
          </p>
          <p className="text-[#2BB5A0] text-[9px] font-bold uppercase tracking-widest">
            Borrower
          </p>
        </div>
      </div>
      <div className="flex-1" />
      <Link
        href="/dashboard/notifications"
        className="relative text-white/60 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2BB5A0] rounded-full" />
      </Link>
    </header>
  );
}

export function BorrowerPageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-gray-500 hover:text-[#2BB5A0] hover:bg-teal-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2BB5A0] rounded-full" />
        </Link>
        <Link
          href="/dashboard/offers"
          className="px-4 py-2 rounded-lg bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors"
        >
          Browse Offers
        </Link>
        <Link
          href="/dashboard/post-request"
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
        >
          + Post Request
        </Link>
      </div>
    </div>
  );
}
