"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdjustWalletBalance } from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

interface AdminWalletAdjustModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  currentBalance: number;
}

export function AdminWalletAdjustModal({
  open,
  onClose,
  username,
  currentBalance,
}: AdminWalletAdjustModalProps) {
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const adjust = useAdjustWalletBalance(username);

  // Prefill with the current balance every time the modal opens, so the
  // admin sees where they're starting from instead of a blank field.
  useEffect(() => {
    if (open) setAmount(currentBalance > 0 ? String(currentBalance) : "");
  }, [open, currentBalance]);

  if (!open) return null;

  const numericAmount = Number(amount) || 0;
  const signedAmount = direction === "credit" ? numericAmount : -numericAmount;
  const resultingBalance = currentBalance + signedAmount;
  const valid = numericAmount > 0 && reason.trim().length >= 3;

  const handleClose = () => {
    setAmount("");
    setReason("");
    setDirection("credit");
    onClose();
  };

  const handleConfirm = () => {
    if (!valid) return;
    if (
      !confirm(
        `${direction === "credit" ? "Credit" : "Debit"} ${username}'s wallet by ${formatCurrency(numericAmount)}?\n\nReason: ${reason}\n\nNew balance will be ${formatCurrency(resultingBalance)}. This is logged and cannot be undone automatically.`,
      )
    ) {
      return;
    }
    adjust.mutate(
      { amount: signedAmount, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Wallet balance adjusted");
          handleClose();
        },
        onError: (err: Error) => toast.error(err.message || "Failed to adjust balance"),
      },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
            Adjust Wallet Balance
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {username} — current balance {formatCurrency(currentBalance)}
          </p>
        </div>

        <div className="flex gap-2">
          {(["credit", "debit"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                direction === d
                  ? d === "credit"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-red-500 border-red-500 text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {d} funds
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Amount (UGX)
          </Label>
          <Input
            type="number"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Reason (required — shown to the user and kept in the audit log)
          </Label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Correcting duplicate disbursement from ticket #482"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#2BB5A0] resize-none"
          />
        </div>

        {numericAmount > 0 && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Balance after adjustment</span>
            <span className="font-semibold text-[#1B2B3A] dark:text-white">
              {formatCurrency(resultingBalance)}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={adjust.isPending}
            className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid || adjust.isPending}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 bg-[#1B2B3A] hover:bg-[#243a4d]"
          >
            {adjust.isPending ? "Applying…" : "Apply Adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
}
