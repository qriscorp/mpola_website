import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/** Shared header for every public marketing page (home, how-it-works,
 * learn-more) — previously each page hand-rolled its own nav, which drifted
 * out of sync (different links, different styling). One component now, so
 * they can never disagree again.
 *
 * The search box is a plain GET form to "/" — no client JS needed here.
 * Submitting from ANY page (not just home) lands on the home page with
 * ?q=... set, which the feed there reads as its initial search term (see
 * src/app/page.tsx + MarketplaceFeed's initialSearch prop). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#1B2B3A] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">
        <Logo variant="light" />
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300 shrink-0">
          <Link href="/#activity-feed" className="hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/learn-more" className="hover:text-white transition-colors">
            For Lenders
          </Link>
        </nav>
        <form action="/" method="GET" className="hidden md:flex flex-1 max-w-sm ml-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Search offers, rates, loan types…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#C4A55A]"
            />
          </div>
        </form>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <ThemeToggle onDark />
          <Link
            href="/auth/signin"
            className="bg-[#2BB5A0] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#239E8C] transition-colors"
          >
            Borrower Sign In
          </Link>
          <Link
            href="/auth/lender-signin"
            className="bg-[#C4A55A] text-[#1B2B3A] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b56a] transition-colors"
          >
            Lender Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
