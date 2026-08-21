import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  ShieldCheck,
  FileCheck,
  Users,
  Wallet,
  Briefcase,
  Heart,
  GraduationCap,
  Landmark,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ComplianceBadge } from "@/components/compliance-badge";
import { MarketplaceFeed } from "@/components/marketplace-feed";
import { api } from "@/lib/api";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import type { MarketplaceListing } from "@/lib/types";

const CATEGORIES = [
  { icon: Briefcase, label: "Business", key: "business" },
  { icon: Users, label: "Personal", key: "personal" },
  { icon: Landmark, label: "Agricultural", key: "agricultural" },
  { icon: Heart, label: "Emergency", key: "emergency" },
  { icon: GraduationCap, label: "Education", key: "education" },
];

const AVATAR_COLORS = ["#163256", "#4e1a6e", "#1a5e42", "#6e3a1a", "#1a2a5e", "#5e1a1a"];

function initialsAvatar(name: string, seed: number) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = AVATAR_COLORS[seed % AVATAR_COLORS.length];
  return (
    <div
      className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials || "?"}
    </div>
  );
}

function parseLoanTypes(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ListingRow({ item, i }: { item: MarketplaceListing; i: number }) {
  const name = item.kind === "offer" ? item.lender_name : item.borrower_name;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
      {initialsAvatar(name, i)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1B2B3A] truncate dark:text-white">{name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
          {item.kind === "offer"
            ? parseLoanTypes(item.loan_types).join(" · ") || "Multiple loan types"
            : `${item.loan_type} · ${formatDuration(item.duration, item.duration_days)}`}
          {item.city ? ` · ${item.city}` : ""}
        </p>
      </div>
      <div className="text-right shrink-0">
        {item.kind === "offer" ? (
          <>
            <p className="font-bold text-[#C4A55A]">{formatRate(item.interest_rate)}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {formatCurrency(item.min_amount)}–{formatCurrency(item.max_amount)}
            </p>
          </>
        ) : (
          <p className="font-bold text-[#2BB5A0]">{formatCurrency(item.amount)}</p>
        )}
      </div>
    </div>
  );
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; type?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const initialSearch = params.q ?? "";
  const initialLoanType = params.type ?? "";

  const preview = await api
    .getMarketplacePreview({
      search: initialSearch || undefined,
      loanType: initialLoanType ? [initialLoanType] : undefined,
      limit: 6,
    })
    .catch(() => ({
      listings: [] as MarketplaceListing[],
      total_matching: 0,
      has_more: false,
      total_offers: 0,
      total_requests: 0,
      category_counts: {} as Record<string, number>,
    }));
  const totalListings = preview.total_offers + preview.total_requests;
  const heroFeed = preview.listings.slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-[#1B2B3A] text-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-[#C4A55A] uppercase tracking-wider mb-5">
              Uganda&apos;s Peer-to-Peer Lending Marketplace
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Where lenders meet the right{" "}
              <span className="text-[#C4A55A] italic">borrowers</span>
            </h1>
            <p className="mt-6 text-gray-300 leading-relaxed max-w-lg">
              Post a lending offer or a borrowing request. Connect directly with
              verified counterparts. Funded via MTN MoMo or Airtel Money —
              real transactions happen once you&apos;re signed in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link
                href="/auth/signin"
                className="bg-[#C4A55A] text-[#1B2B3A] px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-[#d4b56a] transition-colors"
              >
                Start Borrowing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/lender-signin"
                className="text-white px-6 py-3 rounded-lg font-medium text-sm border border-white/20 hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
              >
                Start Lending <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <form action="/" method="GET" className="mt-8 max-w-md">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#C4A55A] transition-colors">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  defaultValue={initialSearch}
                  placeholder="Search offers, rates, loan types…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="text-xs font-bold text-[#C4A55A] hover:text-[#d4b56a] transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Live feed preview */}
          <div id="activity" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-gray-300 ml-2">Live Activity</span>
              <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {totalListings} Active
              </span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4">
              {heroFeed.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  New offers and requests appear here as they&apos;re posted.
                </p>
              ) : (
                heroFeed.map((item, i) => (
                  <ListingRow key={`${item.kind}-${item.id}`} item={item} i={i} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-gray-100 py-6 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 dark:text-gray-500">
            Browse by loan type
          </span>
          {CATEGORIES.map((cat) => {
            const active = initialLoanType === cat.key;
            return (
              <Link
                key={cat.label}
                href={active ? "/#activity-feed" : `/?type=${cat.key}#activity-feed`}
                className={`flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border transition-colors ${
                  active
                    ? "border-[#2BB5A0] bg-[#E8F8F5]/60 dark:bg-[#2BB5A0]/10"
                    : "border-gray-200 hover:border-[#2BB5A0] hover:bg-[#E8F8F5]/40 dark:border-gray-800 dark:hover:bg-gray-800"
                }`}
              >
                <cat.icon className="w-4 h-4 text-[#2BB5A0]" />
                <span className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                  {cat.label}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({preview.category_counts[cat.key] ?? 0})
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Marketplace feed, full width */}
      <section id="activity-feed" className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-[#C4A55A] text-xs font-semibold uppercase tracking-widest mb-3">
              Real Activity, Right Now
            </p>
            <h2 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
              Recent offers &amp; requests
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
              <strong className="text-[#1B2B3A] dark:text-white">{totalListings} listings</strong>{" "}
              — a live preview of what&apos;s happening on Mpola. Sign in to browse
              everything, apply, or respond.
            </p>
          </div>

          {/* Post your listing banner */}
          <div className="mb-6 bg-[#1B2B3A] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-white">Post your listing</p>
              <p className="text-sm text-gray-400">
                Lenders: post your offer · Borrowers: post your need — both are public
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href="/auth/lender-signin"
                className="bg-[#C4A55A] text-[#1B2B3A] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#d4b56a] transition-colors whitespace-nowrap"
              >
                + Post Lending Offer
              </Link>
              <Link
                href="/auth/signin"
                className="bg-[#2BB5A0] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#239E8C] transition-colors whitespace-nowrap"
              >
                + Post Borrowing Request
              </Link>
            </div>
          </div>

          <MarketplaceFeed
            initial={preview}
            initialSearch={initialSearch}
            initialLoanType={initialLoanType}
          />
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-[#F8FAFA] dark:bg-gray-800/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2BB5A0]" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Licensed Money Lender
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#2BB5A0]" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              NIN-Verified Borrowers
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="w-5 h-5 text-[#2BB5A0]" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Guarantors Required
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Wallet className="w-5 h-5 text-[#2BB5A0]" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              MTN MoMo &amp; Airtel
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#C4A55A] text-xs font-bold uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1B2B3A] dark:text-white">
              Simple on both sides of the marketplace
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
              Post once. Connect directly. Get funded — or start earning — in 24 hours.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#C4A55A] mb-5">
                For Lenders
              </p>
              <div className="space-y-5">
                {[
                  { title: "Register & get verified", desc: "as a lender on Mpola before posting any offer." },
                  { title: "Post your lending offer", desc: "publicly — set your rate, amount range, and accepted loan types." },
                  { title: "Review borrower applications.", desc: "See credit scores, docs, and guarantors. Approve in one tap." },
                  { title: "Collect interest payments.", desc: "Track your portfolio and earnings dashboard." },
                ].map((step, i) => (
                  <div key={step.title} className="flex gap-3">
                    <span className="h-7 w-7 rounded-full bg-[#fef9e8] text-[#C4A55A] text-sm font-bold flex items-center justify-center shrink-0 dark:bg-[#C4A55A]/15">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                      <strong className="text-[#1B2B3A] dark:text-white">{step.title}</strong> {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2BB5A0] mb-5">
                For Borrowers
              </p>
              <div className="space-y-5">
                {[
                  { title: "Create your profile", desc: "with your NIN and phone number. Done in under 5 minutes." },
                  { title: "Browse lender offers", desc: "publicly, or post your own request and receive competing offers." },
                  { title: "Apply or accept an offer.", desc: "Upload documents and add guarantors — all on your phone." },
                  { title: "Get funded in 24 hours.", desc: "Money in your MTN MoMo or Airtel wallet after approval." },
                ].map((step, i) => (
                  <div key={step.title} className="flex gap-3">
                    <span className="h-7 w-7 rounded-full bg-[#ecfeff] text-[#2BB5A0] text-sm font-bold flex items-center justify-center shrink-0 dark:bg-[#2BB5A0]/15">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                      <strong className="text-[#1B2B3A] dark:text-white">{step.title}</strong> {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="grid lg:grid-cols-2 border-b border-gray-100 dark:border-gray-800">
        <div className="p-10 lg:p-16 bg-linear-to-br from-[#FFF8ED] to-white dark:from-gray-900 dark:to-gray-900 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
          <p className="text-[#C4A55A] text-xs font-bold uppercase tracking-widest mb-3">
            For Lenders
          </p>
          <h2 className="text-2xl font-bold text-[#1B2B3A] mb-3 dark:text-white">
            Post your offer. Let borrowers apply to you.
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm dark:text-gray-400">
            Set your terms once. Your offer is public. Qualified borrowers apply and
            you review before approving.
          </p>
          <ul className="space-y-2.5 mb-8">
            {[
              "Verified lender approval process",
              "Review credit scores & docs before approving",
              "Earn interest, track repayments",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-[#C4A55A] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/lender-signin"
            className="bg-[#C4A55A] text-white px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#b3944a] transition-colors"
          >
            Post a Lending Offer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-10 lg:p-16 bg-linear-to-br from-[#E8F8F5] to-white dark:from-gray-900 dark:to-gray-900">
          <p className="text-[#2BB5A0] text-xs font-bold uppercase tracking-widest mb-3">
            For Borrowers
          </p>
          <h2 className="text-2xl font-bold text-[#1B2B3A] mb-3 dark:text-white">
            Post your request. Let lenders compete for you.
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm dark:text-gray-400">
            Browse public lender offers and apply directly, or post your need and
            get multiple competing offers.
          </p>
          <ul className="space-y-2.5 mb-8">
            <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#2BB5A0] shrink-0" />
              {preview.total_offers > 0
                ? `${preview.total_offers} live lender offer${preview.total_offers === 1 ? "" : "s"} to choose from`
                : "New lender offers posted regularly"}
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#2BB5A0] shrink-0" />
              Compare rates before accepting
            </li>
            <li className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#2BB5A0] shrink-0" />
              Money in MoMo or Airtel in 24 hours
            </li>
          </ul>
          <Link
            href="/auth/signin"
            className="bg-[#2BB5A0] text-white px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors"
          >
            Post a Borrowing Request <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Mobile App */}
      <section className="bg-[#1B2B3A] py-16 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C4A55A] text-xs font-bold uppercase tracking-widest mb-3">
            Mobile App
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            The full marketplace in your pocket
          </h2>
          <p className="mt-4 text-gray-400">
            Browse listings, post offers or requests, manage applications, and track
            repayments — coming soon on iOS and Android.
          </p>
          {/* The app isn't published to either store yet — these are
              deliberately unclickable "coming soon" badges, not links to
              store pages that don't exist. */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-5 py-3 min-w-45 opacity-60 cursor-not-allowed">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 leading-none">Coming soon on the</p>
                <p className="text-sm font-bold text-white leading-tight mt-0.5">App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-5 py-3 min-w-45 opacity-60 cursor-not-allowed">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white shrink-0">
                <path d="M3 20.53V3.47c0-.55.32-1.03.78-1.26l10.7 9.79-10.7 9.79c-.46-.23-.78-.71-.78-1.26zm14.06-6.53l2.5-1.44c.75-.43.75-1.66 0-2.09l-2.5-1.44-2.61 2.49 2.61 2.48zm-3.55-2.48l-9.19-8.4 9.99 5.76-.8 2.64z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 leading-none">Coming soon on</p>
                <p className="text-sm font-bold text-white leading-tight mt-0.5">Google Play</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">Works on MTN &amp; Airtel Money</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111E29] text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/#activity-feed" className="hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Post a Listing
            </Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/learn-more" className="hover:text-white transition-colors">
              For Lenders
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/platform-terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
          <ComplianceBadge className="text-gray-400" />
          <span className="text-xs">© 2026 Mpola Uganda Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
