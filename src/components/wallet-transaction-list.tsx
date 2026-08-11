"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/lib/format";
import type { WalletTransaction, WalletTransactionType } from "@/lib/types";

const TYPE_LABEL: Record<WalletTransactionType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  repayment: "Repayment",
  disbursement: "Disbursement",
  top_up: "Top-up",
};

// Money moving into the wallet vs out of it, for the +/- and color treatment.
const CREDIT_TYPES = new Set<WalletTransactionType>([
  "deposit",
  "disbursement",
  "top_up",
]);

function TransactionTypeBadge({ type }: { type: WalletTransactionType }) {
  const isCredit = CREDIT_TYPES.has(type);
  return (
    <Badge
      variant="outline"
      className={
        isCredit
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-amber-50 text-amber-600 border-amber-200"
      }
    >
      {TYPE_LABEL[type]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: WalletTransaction["status"] }) {
  if (status === "pending") {
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-500 border-gray-200"
      >
        Pending
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-500 border-red-200"
      >
        Failed
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-emerald-50 text-emerald-600 border-emerald-200"
    >
      Completed
    </Badge>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-UG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function WalletTransactionList({
  transactions,
  isLoading,
  emptyMessage = "No transactions yet.",
}: {
  transactions: WalletTransaction[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => {
          const isCredit = CREDIT_TYPES.has(tx.type);
          const expanded = expandedId === tx.id;
          return (
            <Fragment key={tx.id}>
              <TableRow
                onClick={() => setExpandedId(expanded ? null : tx.id)}
                className="cursor-pointer"
              >
                <TableCell className="text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(tx.created_at)}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-[#1B2B3A] dark:text-white">
                    {tx.description || TYPE_LABEL[tx.type]}
                  </div>
                  {tx.counterparty && (
                    <div className="text-xs text-gray-500">
                      {tx.counterparty}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TransactionTypeBadge type={tx.type} />
                    <StatusBadge status={tx.status} />
                  </div>
                </TableCell>
                <TableCell
                  className={`text-right font-semibold whitespace-nowrap ${
                    isCredit ? "text-emerald-600" : "text-orange-500"
                  }`}
                >
                  {isCredit ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </TableCell>
              </TableRow>
              {expanded && (
                <TableRow className="bg-gray-50 dark:bg-gray-950">
                  <TableCell colSpan={4} className="py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-400">Transaction ID</span>
                        <span className="sm:block font-medium text-[#1B2B3A] dark:text-white break-all">
                          {tx.id}
                        </span>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-400">Reference</span>
                        <span className="sm:block font-medium text-[#1B2B3A] dark:text-white break-all">
                          {tx.reference || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-400">Date &amp; Time</span>
                        <span className="sm:block font-medium text-[#1B2B3A] dark:text-white">
                          {formatDateTime(tx.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between sm:block">
                        <span className="text-gray-400">Status</span>
                        <span className="sm:block font-medium text-[#1B2B3A] dark:text-white capitalize">
                          {tx.status}
                        </span>
                      </div>
                      {tx.counterparty && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-400">Counterparty</span>
                          <span className="sm:block font-medium text-[#1B2B3A] dark:text-white">
                            {tx.counterparty}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
