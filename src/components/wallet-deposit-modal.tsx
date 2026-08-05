"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useDepositMobileMoney,
  useCardDeposit,
} from "@/hooks/use-wallet";

interface WalletDepositModalProps {
  open: boolean;
  onClose: () => void;
  accent?: "teal" | "gold";
}

const ACCENT_BUTTON_CLASSES: Record<"teal" | "gold", string> = {
  teal: "bg-[#2BB5A0] hover:bg-[#239E8C]",
  gold: "bg-[#C4A55A] hover:bg-[#b3944a]",
};

const ACCENT_TAB_CLASSES: Record<"teal" | "gold", string> = {
  teal: "bg-[#1B2B3A] text-white border-[#1B2B3A]",
  gold: "bg-[#1B2B3A] text-white border-[#1B2B3A]",
};

export function WalletDepositModal({
  open,
  onClose,
  accent = "teal",
}: WalletDepositModalProps) {
  const [method, setMethod] = useState<"mobile_money" | "card">(
    "mobile_money",
  );
  const [amount, setAmount] = useState("500000");
  const [phone, setPhone] = useState("");

  const mobileMoney = useDepositMobileMoney();
  const cardDeposit = useCardDeposit();

  if (!open) return null;

  const isPending = mobileMoney.isPending || cardDeposit.isPending;

  const handleConfirm = () => {
    const numericAmount = Number(amount);
    if (method === "mobile_money") {
      mobileMoney.mutate(
        { amount: numericAmount, phone },
        { onSuccess: onClose },
      );
    } else {
      cardDeposit.mutate(
        { amount: numericAmount, redirect_url: window.location.href },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
          Deposit Funds
        </h3>

        <div className="flex gap-2">
          {(["mobile_money", "card"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                method === m
                  ? ACCENT_TAB_CLASSES[accent]
                  : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              {m === "mobile_money" ? "Mobile Money" : "Card"}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Amount (UGX)
          </Label>
          <Input
            type="number"
            placeholder="e.g. 500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {method === "mobile_money" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Phone Number
            </Label>
            <Input
              placeholder="+256 7XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}

        {method === "card" && (
          <p className="text-sm text-gray-500">
            You&apos;ll complete your card payment in a new tab. Come back
            here once you&apos;re done — we&apos;ll confirm it automatically.
          </p>
        )}

        {cardDeposit.isPending && (
          <p className="text-sm text-amber-600">
            Waiting for payment confirmation…
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              isPending ||
              !amount ||
              (method === "mobile_money" && !phone)
            }
            className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 ${ACCENT_BUTTON_CLASSES[accent]}`}
          >
            {isPending ? "Processing…" : "Confirm Deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}
