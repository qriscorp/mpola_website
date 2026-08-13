"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Scale, ArrowRight, MessageCircle } from "lucide-react";
import { useAdminDisputes } from "@/hooks/use-admin";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FadeSwap } from "@/components/motion/fade-swap";

const PAGE_SIZE = 20;

type StatusTab = "all" | "open" | "investigating" | "resolved" | "rejected";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "investigating", label: "Needs Review" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const statusColor: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  investigating: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
};

const categoryLabel: Record<string, string> = {
  payment: "Payment",
  loan_terms: "Loan Terms",
  fraud: "Fraud",
  disbursement: "Disbursement",
  other: "Other",
};

export default function AdminDisputesPage() {
  const [tab, setTab] = useState<StatusTab>("investigating");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminDisputes(page, PAGE_SIZE, tab === "all" ? undefined : tab);

  const disputes = data?.disputes ?? [];
  const total = data?.total ?? 0;

  const handleTab = (t: StatusTab) => {
    setTab(t);
    setPage(1);
  };

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Disputes</h1>
          <CardSkeleton count={1} height="h-12" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
          <Scale className="h-6 w-6 text-[#2BB5A0]" />
          Disputes
        </h1>
        <p className="text-sm text-muted-foreground">
          Borrowers and lenders are expected to try resolving disputes directly with each other
          first — this queue is what they've escalated, plus everything else for context.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTab(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              tab === t.key
                ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-[#2BB5A0] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            {total} dispute{total === 1 ? "" : "s"}
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">Parties</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">Description</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">Status</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">Filed</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nothing here — all caught up.
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-sm">
                      <p className="font-medium text-[#1B2B3A] dark:text-white">{d.filer_name ?? "—"}</p>
                      {d.respondent_name && (
                        <p className="text-xs text-muted-foreground">vs {d.respondent_name}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabel[d.category] ?? d.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs">
                      <p className="line-clamp-2 text-gray-600 dark:text-gray-300">{d.description}</p>
                      {d.message_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MessageCircle className="h-3 w-3" /> {d.message_count}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`text-xs ${statusColor[d.status] ?? ""}`}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/disputes/${d.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239385] transition-colors"
                      >
                        Review
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
    </FadeSwap>
  );
}
