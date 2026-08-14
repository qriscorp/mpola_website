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
import { LifeBuoy, ArrowRight, MessageCircle } from "lucide-react";
import { useAdminSupportTickets } from "@/hooks/use-admin";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FadeSwap } from "@/components/motion/fade-swap";

const PAGE_SIZE = 20;

type StatusTab = "all" | "open" | "in_progress" | "resolved" | "closed";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];

const statusColor: Record<string, string> = {
  open: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const categoryLabel: Record<string, string> = {
  general: "General",
  wallet: "Wallet",
  loan: "Loan",
  kyc: "KYC",
  bug: "Bug",
  other: "Other",
};

export default function AdminSupportPage() {
  const [tab, setTab] = useState<StatusTab>("open");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminSupportTickets(page, PAGE_SIZE, tab === "all" ? undefined : tab);

  const tickets = data?.tickets ?? [];
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
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Support Tickets</h1>
          <CardSkeleton count={1} height="h-12" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-[#2BB5A0]" />
          Support Tickets
        </h1>
        <p className="text-sm text-muted-foreground">
          Everything borrowers and lenders have filed via Help &amp; Support.
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
            {total} ticket{total === 1 ? "" : "s"}
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">User</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">Subject</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">Status</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">Filed</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nothing here — all caught up.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {t.username ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabel[t.category] ?? t.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs">
                      <p className="line-clamp-2 text-gray-600 dark:text-gray-300">{t.subject}</p>
                      {t.message_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MessageCircle className="h-3 w-3" /> {t.message_count}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`text-xs ${statusColor[t.status] ?? ""}`}>
                        {t.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/support/${t.id}`}
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
