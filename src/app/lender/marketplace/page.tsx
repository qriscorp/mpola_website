"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, FileText, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMarketplaceBorrowers } from "@/hooks/use-lender";
import { formatCurrency } from "@/lib/format";

const filters = [
  "All",
  "Personal",
  "Business",
  "Verified KYC",
  "With Collateral",
];
const avatarColors = [
  "bg-[#2BB5A0]",
  "bg-[#1B2B3A]",
  "bg-[#C4A55A]",
  "bg-purple-500",
  "bg-blue-500",
  "bg-orange-500",
];

export default function MarketplacePage() {
  const { data: borrowers = [] } = useMarketplaceBorrowers();
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = borrowers
    .filter((b) => {
      if (activeFilter === "Personal") return b.loanType === "Personal";
      if (activeFilter === "Business") return b.loanType === "Business";
      if (activeFilter === "Verified KYC") return b.kycVerified;
      return true;
    })
    .filter(
      (b) =>
        search === "" ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.location.toLowerCase().includes(search.toLowerCase()),
    );

  const counts: Record<string, number> = {
    All: borrowers.length,
    Personal: borrowers.filter((b) => b.loanType === "Personal").length,
    Business: borrowers.filter((b) => b.loanType === "Business").length,
    "Verified KYC": borrowers.filter((b) => b.kycVerified).length,
    "With Collateral": 32,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B2B3A] dark:text-white">
          Borrower Marketplace
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {borrowers.length} borrowers matching your lending criteria · Updated
          4 min ago
        </p>
      </div>

      {/* Filters Row */}
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All loan types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All loan types</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any amount</SelectItem>
                  <SelectItem value="under5m">Under 5M</SelectItem>
                  <SelectItem value="5to15m">5M – 15M</SelectItem>
                  <SelectItem value="over15m">Over 15M</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any duration</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All documents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All documents</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 lg:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city or purp..."
                  className="pl-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select>
                <SelectTrigger className="w-32 text-sm">
                  <SelectValue placeholder="Newest first" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="amount-desc">Highest amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeFilter === f
                ? "bg-[#2BB5A0] text-white border-[#2BB5A0]"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {f} · {counts[f] ?? 0}
          </button>
        ))}
      </div>

      {/* Borrower Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b, idx) => (
          <Card
            key={b.id}
            className="bg-white dark:bg-gray-900 overflow-hidden"
          >
            <CardContent className="p-5 space-y-4">
              {/* Top Row: KYC + Type */}
              <div className="flex items-center justify-between">
                {b.kycVerified && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ● Verified KYC
                  </span>
                )}
                <Badge variant="outline" className="text-xs">
                  {b.loanType}
                </Badge>
              </div>

              {/* Name + Location */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={`${avatarColors[idx % avatarColors.length]} text-white font-bold`}
                  >
                    {b.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#1B2B3A] dark:text-white">
                    {b.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {b.location}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="text-[10px] font-semibold text-[#2BB5A0] uppercase tracking-wider">
                  Requesting
                </p>
                <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                  <span className="text-xs font-normal text-muted-foreground">
                    UGX{" "}
                  </span>
                  {(b.amount / 1000000).toFixed(0) !== "0"
                    ? `${b.amount.toLocaleString()}`
                    : b.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  over {b.duration} months
                </p>
              </div>

              {/* Purpose */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-[#1B2B3A] dark:text-white">
                  Purpose:
                </span>{" "}
                {b.purpose}
              </p>

              {/* Docs + Guarantors */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" /> {b.documents} docs
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {b.guarantorsConfirmed}{" "}
                  confirmed
                </span>
              </div>

              {/* CTA */}
              <Link href={`/lender/marketplace/${b.id}`}>
                <Button className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
