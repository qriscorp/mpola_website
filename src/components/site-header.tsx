import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/** Shared header for every public marketing page (home, how-it-works,
 * learn-more) — previously each page hand-rolled its own nav, which drifted
 * out of sync (different links, different styling). One component now, so
 * they can never disagree again. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#1B2B3A] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-6">
        <Logo variant="light" />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
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
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle onDark />
          <Link
            href="/auth/signin"
            className="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signin"
            className="bg-[#C4A55A] text-[#1B2B3A] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4b56a] transition-colors"
          >
            Join Free
          </Link>
        </div>
      </div>
    </header>
  );
}
