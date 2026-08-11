"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTransactionDetail } from "@/hooks/use-wallet";
import { formatCurrency, formatDuration, formatRate } from "@/lib/format";
import type { WalletTransactionType } from "@/lib/types";

const TYPE_LABEL: Record<WalletTransactionType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  repayment: "Loan Repayment",
  disbursement: "Loan Disbursement",
  top_up: "Top-up",
};

const CREDIT_TYPES = new Set<WalletTransactionType>(["deposit", "disbursement", "top_up"]);

const FEE_CATEGORY_LABEL: Record<string, string> = {
  mobile_money_withdrawal: "Mobile money withdrawal fee",
  bank_withdrawal: "Bank transfer fee",
  loan_disbursement: "Disbursement fee",
  loan_repayment: "Repayment fee",
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Row({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-[#1B2B3A] dark:text-white text-right ${mono ? "font-mono text-xs break-all" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{title}</p>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">{children}</div>
    </div>
  );
}

export function TransactionDetailModal({
  transactionId,
  onClose,
}: {
  transactionId: string | null;
  onClose: () => void;
}) {
  const { data: tx, isLoading } = useTransactionDetail(transactionId);

  return (
    <Dialog open={!!transactionId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1B2B3A] dark:text-white">
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        {isLoading || !tx ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Amount hero */}
            <div className="text-center py-3">
              <p
                className={`text-3xl font-black ${
                  CREDIT_TYPES.has(tx.type) ? "text-emerald-600" : "text-orange-500"
                }`}
              >
                {CREDIT_TYPES.has(tx.type) ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {tx.description || TYPE_LABEL[tx.type]}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline">{TYPE_LABEL[tx.type]}</Badge>
                <Badge
                  variant="outline"
                  className={
                    tx.status === "completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : tx.status === "pending"
                        ? "bg-gray-100 text-gray-500 border-gray-200"
                        : "bg-red-50 text-red-500 border-red-200"
                  }
                >
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </Badge>
              </div>
            </div>

            <Section title="Transaction Info">
              <Row label="Transaction ID" value={tx.id} mono />
              {tx.reference && <Row label="Reference" value={tx.reference} mono />}
              <Row label="Date &amp; Time" value={formatDateTime(tx.created_at)} />
              {tx.counterparty && !tx.loan && (
                <Row label="Counterparty" value={tx.counterparty} />
              )}
            </Section>

            <Section title="Charges">
              {tx.total_fee != null ? (
                <>
                  {tx.fee_category && (
                    <Row label="Fee type" value={FEE_CATEGORY_LABEL[tx.fee_category] ?? tx.fee_category} />
                  )}
                  {tx.platform_fee != null && tx.platform_fee > 0 && (
                    <Row label="Platform fee" value={formatCurrency(tx.platform_fee)} />
                  )}
                  {tx.provider_fee != null && tx.provider_fee > 0 && (
                    <Row label="Provider fee" value={formatCurrency(tx.provider_fee)} />
                  )}
                  <Row
                    label="Total charged"
                    value={<span className="text-[#149D8E]">{formatCurrency(tx.total_fee)}</span>}
                  />
                </>
              ) : (
                <Row label="Platform fee" value="No fee on this transaction" />
              )}
            </Section>

            {tx.loan && (
              <Section title="Loan Details">
                <Row label="Loan ID" value={tx.loan.id} mono />
                <Row label="Principal" value={formatCurrency(tx.loan.amount)} />
                <Row label="Interest Rate" value={formatRate(tx.loan.interest_rate)} />
                <Row label="Duration" value={formatDuration(tx.loan.duration, tx.loan.duration_days)} />
                <Row
                  label="Status"
                  value={tx.loan.status.charAt(0).toUpperCase() + tx.loan.status.slice(1)}
                />
                {tx.loan.borrower_name && (
                  <Row label="Borrower" value={tx.loan.borrower_name} />
                )}
                {tx.loan.lender_name && <Row label="Lender" value={tx.loan.lender_name} />}
                {tx.repayment && (
                  <Row
                    label="Instalment"
                    value={`#${tx.repayment.instalment_number} of ${tx.loan.total_instalments}`}
                  />
                )}
                <Row
                  label="Repaid so far"
                  value={`${formatCurrency(tx.loan.total_paid)} of ${formatCurrency(tx.loan.total_repayable)}`}
                />
              </Section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
