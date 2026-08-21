"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { TableSkeleton } from "@/components/skeletons";
import { FadeSwap } from "@/components/motion/fade-swap";
import { RequiredDocumentsChecklist } from "@/components/required-documents-checklist";
import {
  useDisbursementQueue,
  useApproveDisbursement,
  useBatchApproveDisbursement,
} from "@/hooks/use-lender";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
import { calcPlatformFee } from "@/lib/fees";
import type { ActiveLoan } from "@/lib/types";

export default function LenderDisbursementPage() {
  const { data, isLoading } = useDisbursementQueue();
  const approve = useApproveDisbursement();
  const batchApprove = useBatchApproveDisbursement();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [batchConfirming, setBatchConfirming] = useState(false);

  const pending = data?.pending ?? [];
  const selected: ActiveLoan | undefined =
    pending.find((l) => l.id === selectedId) ?? pending[0];

  // Keep the selection valid as the queue changes (a disbursed loan drops
  // out of `pending` — fall back to whatever's now first rather than
  // pointing at a loan that no longer exists in this list).
  useEffect(() => {
    if (selectedId && !pending.some((l) => l.id === selectedId)) {
      setSelectedId(null);
    }
  }, [pending, selectedId]);

  const handleApprove = () => {
    if (!selected) return;
    approve.mutate(selected.id, {
      onSuccess: () => {
        toast.success(`UGX ${formatCurrency(selected.amount)} disbursed to ${selected.borrower_name ?? "the borrower"}'s wallet.`);
        setConfirming(false);
      },
      onError: (err: Error) => toast.error(err.message || "Failed to disburse"),
    });
  };

  const handleBatchApprove = () => {
    batchApprove.mutate(undefined, {
      onSuccess: (res) => {
        setBatchConfirming(false);
        if (res.disbursed.length > 0) {
          toast.success(
            `Disbursed ${res.disbursed.length} loan${res.disbursed.length === 1 ? "" : "s"}` +
              (res.failed.length > 0 ? ` — ${res.failed.length} could not be sent` : ""),
          );
        }
        if (res.disbursed.length === 0 && res.failed.length > 0) {
          toast.error(res.failed[0]?.reason || "Batch disbursement failed");
        }
      },
      onError: (err: Error) => toast.error(err.message || "Batch disbursement failed"),
    });
  };

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <LenderPageHeader title="Disbursement" />
          <TableSkeleton rows={4} />
        </div>
      }
    >
      <div className="space-y-6">
        <LenderPageHeader title="Disbursement" />

        {pending.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-[#1B2B3A] px-5 py-4">
            <div>
              <p className="text-white font-bold">
                {pending.length} loan{pending.length === 1 ? "" : "s"} awaiting disbursement
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {formatCurrency(data?.pending_total ?? 0)} total, from your wallet
              </p>
            </div>
            <button
              onClick={() => setBatchConfirming(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              Disburse All Pending ({pending.length})
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-amber-400 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Disbursement</p>
            <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
              {data?.pending_count ?? 0}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(data?.pending_total ?? 0)} awaiting dispatch
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-emerald-400 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Disbursed Today</p>
            <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
              {data?.disbursed_today_count ?? 0}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(data?.disbursed_today_amount ?? 0)} total out
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 border-t-[#C4A55A] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Balance</p>
            <p className="text-4xl font-bold text-[#1B2B3A] dark:text-white mt-1">
              {formatCurrency(data?.wallet_balance ?? 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {(data?.wallet_balance ?? 0) >= (data?.pending_total ?? 0)
                ? "Sufficient for the current queue"
                : "Not enough for the full queue"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: queue */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <h3 className="font-bold text-[#1B2B3A] dark:text-white mb-4">
              Disbursement Queue
            </h3>

            {pending.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                Nothing awaiting disbursement right now.
              </p>
            ) : (
              <div className="space-y-1">
                {pending.map((loan) => (
                  <button
                    key={loan.id}
                    onClick={() => setSelectedId(loan.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      selected?.id === loan.id
                        ? "bg-[#FFF8ED] dark:bg-[#C4A55A]/10 border border-[#C4A55A]"
                        : "border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#1B2B3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(loan.borrower_name ?? "?")
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1B2B3A] dark:text-white truncate">
                        {loan.borrower_name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        #{loan.id.slice(0, 8)} · {formatRate(loan.interest_rate)}
                      </p>
                    </div>
                    <p className="font-bold text-[#1B2B3A] dark:text-white shrink-0">
                      {formatCurrency(loan.amount)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: selected loan detail */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            {!selected ? (
              <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                Select a loan from the queue to review it.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1B2B3A] dark:text-white">
                    Loan #{selected.id.slice(0, 8)}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:border-emerald-800 dark:text-emerald-400">
                    Ready to Disburse
                  </span>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 p-4 mb-4">
                  <p className="font-bold text-[#1B2B3A] dark:text-white">
                    {selected.borrower_name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {formatDuration(selected.duration, selected.duration_days)} term
                  </p>
                  {selected.required_documents.length > 0 && (
                    <RequiredDocumentsChecklist
                      items={selected.required_documents_status}
                      readOnly
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border-t-2 border-t-[#C4A55A]">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">PRINCIPAL</p>
                    <p className="font-bold text-[#C4A55A]">{formatCurrency(selected.amount)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border-t-2 border-t-gray-200 dark:border-t-gray-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">INTEREST</p>
                    <p className="font-bold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(selected.total_repayable - selected.amount)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border-t-2 border-t-gray-200 dark:border-t-gray-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1">TOTAL REPAYABLE</p>
                    <p className="font-bold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(selected.total_repayable)}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                  Disbursement Method
                </p>
                <div className="flex items-center gap-3 rounded-xl border border-[#C4A55A] bg-[#FFF8ED] dark:bg-[#C4A55A]/10 px-4 py-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#1B2B3A] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">Mpola Wallet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Funds are credited to the borrower&apos;s wallet instantly
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-5">
                  <div className="flex justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Loan principal</span>
                    <span className="font-semibold text-[#1B2B3A] dark:text-white">
                      {formatCurrency(selected.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Platform fee (0.5%)</span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      {formatCurrency(calcPlatformFee(selected.amount))}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/60 text-sm">
                    <span className="font-bold text-[#1B2B3A] dark:text-white">Total from your wallet</span>
                    <span className="font-bold text-[#C4A55A]">
                      {formatCurrency(selected.amount + calcPlatformFee(selected.amount))}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirming(true)}
                    disabled={approve.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {approve.isPending && approve.variables === selected.id
                      ? "Disbursing…"
                      : "Disburse Now"}
                  </button>
                  <Link
                    href={`/lender/loan-detail?loanId=${selected.id}`}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  >
                    Full Loan
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Single-loan confirm */}
      {confirming && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">Disburse this loan?</h2>
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              This sends{" "}
              <strong className="text-[#1B2B3A] dark:text-white">
                {formatCurrency(selected.amount)}
              </strong>{" "}
              from your wallet to{" "}
              <strong className="text-[#1B2B3A] dark:text-white">
                {selected.borrower_name ?? "the borrower"}
              </strong>
              &apos;s Mpola wallet right now. This can&apos;t be undone.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setConfirming(false)}
                disabled={approve.isPending}
                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approve.isPending}
                className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] disabled:opacity-50"
              >
                {approve.isPending ? "Disbursing…" : "Yes, disburse funds"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch confirm */}
      {batchConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
              Disburse all {pending.length} pending loans?
            </h2>
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              This sends a total of{" "}
              <strong className="text-[#1B2B3A] dark:text-white">
                {formatCurrency(data?.pending_total ?? 0)}
              </strong>{" "}
              from your wallet, one loan at a time. If your balance runs out partway through, the
              remaining loans are simply left pending — nothing already sent is reversed.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setBatchConfirming(false)}
                disabled={batchApprove.isPending}
                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchApprove}
                disabled={batchApprove.isPending}
                className="px-5 py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] disabled:opacity-50"
              >
                {batchApprove.isPending ? "Disbursing…" : `Yes, disburse all ${pending.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </FadeSwap>
  );
}
