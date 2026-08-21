import Link from "next/link";
import {
  ArrowRight,
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
import type { MarketplacePreviewOffer, MarketplacePreviewRequest } from "@/lib/types";

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

function OfferRow({ offer, i }: { offer: MarketplacePreviewOffer; i: number }) {
  const types = parseLoanTypes(offer.loan_types);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
      {initialsAvatar(offer.lender_name, i)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1B2B3A] truncate dark:text-white">
          {offer.lender_name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {types.length > 0 ? types.join(" · ") : "Multiple loan types"}
          {offer.city ? ` · ${offer.city}` : ""}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-[#C4A55A]">{formatRate(offer.interest_rate)}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {formatCurrency(offer.min_amount)}–{formatCurrency(offer.max_amount)}
        </p>
      </div>
    </div>
  );
}

function RequestRow({ request, i }: { request: MarketplacePreviewRequest; i: number }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800">
      {initialsAvatar(request.borrower_name, i)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1B2B3A] truncate dark:text-white">
          {request.borrower_name}
        </p>
        <p className="text-xs text-gray-400 capitalize dark:text-gray-500">
          {request.loan_type} · {formatDuration(request.duration, request.duration_days)}
          {request.city ? ` · ${request.city}` : ""}
        </p>
      </div>
      <p className="font-bold text-[#2BB5A0] shrink-0">{formatCurrency(request.amount)}</p>
    </div>
  );
}

export default async function LandingPage() {
  const preview = await api.getMarketplacePreview().catch(() => ({
    offers: [],
    requests: [],
    total_offers: 0,
    total_requests: 0,
    category_counts: {} as Record<string, number>,
  }));
  const totalListings = preview.total_offers + preview.total_requests;

  // Hero's small "Live Activity" widget mixes both kinds, newest first —
  // a smaller, denser preview than the full feed section further down.
  const heroFeed = [
    ...preview.offers.map((o) => ({ kind: "offer" as const, data: o, createdAt: o.created_at })),
    ...preview.requests.map((r) => ({ kind: "request" as const, data: r, createdAt: r.created_at })),
  ]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 4);

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
            <div className="hidden sm:flex items-center gap-2 mt-8 bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400">
                Search offers, rates, loan types… sign in to browse the full marketplace
              </span>
            </div>
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
                heroFeed.map((item, i) =>
                  item.kind === "offer" ? (
                    <OfferRow key={`offer-${item.data.id}`} offer={item.data} i={i} />
                  ) : (
                    <RequestRow key={`request-${item.data.id}`} request={item.data} i={i} />
                  ),
                )
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
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href="/auth/signin"
              className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border border-gray-200 hover:border-[#2BB5A0] hover:bg-[#E8F8F5]/40 transition-colors dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <cat.icon className="w-4 h-4 text-[#2BB5A0]" />
              <span className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                {cat.label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({preview.category_counts[cat.key] ?? 0})
              </span>
            </Link>
          ))}
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
            offers={preview.offers}
            requests={preview.requests}
            totalOffers={preview.total_offers}
            totalRequests={preview.total_requests}
            categoryCounts={preview.category_counts}
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

      {/* Dual CTA */}
      <section className="grid lg:grid-cols-2 border-b border-gray-100 dark:border-gray-800">
        <div className="p-10 lg:p-16 bg-linear-to-br from-[#FFF8ED] to-white dark:from-gray-900 dark:to-gray-900 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
          <p className="text-[#C4A55A] text-xs font-bold uppercase tracking-widest mb-3">
            For Lenders
          </p>
          <h2 className="text-2xl font-bold text-[#1B2B3A] mb-3 dark:text-white">
            Put your capital to work
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm dark:text-gray-400">
            Set your own rates, review KYC documentation, and fund verified
            borrowers across Uganda.
          </p>
          <Link
            href="/auth/lender-signin"
            className="bg-[#C4A55A] text-white px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#b3944a] transition-colors"
          >
            Become a Lender <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-10 lg:p-16 bg-linear-to-br from-[#E8F8F5] to-white dark:from-gray-900 dark:to-gray-900">
          <p className="text-[#2BB5A0] text-xs font-bold uppercase tracking-widest mb-3">
            For Borrowers
          </p>
          <h2 className="text-2xl font-bold text-[#1B2B3A] mb-3 dark:text-white">
            Fair credit, on your terms
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm dark:text-gray-400">
            Apply once, compare offers from verified lenders, and get funded
            directly to your wallet.
          </p>
          <Link
            href="/auth/signin"
            className="bg-[#2BB5A0] text-white px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 hover:bg-[#239E8C] transition-colors"
          >
            Apply for a Loan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111E29] text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/platform-terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/learn-more" className="hover:text-white transition-colors">
              Help Centre
            </Link>
          </div>
          <ComplianceBadge className="text-gray-400" />
          <span className="text-xs">© 2026 Mpola Uganda Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
