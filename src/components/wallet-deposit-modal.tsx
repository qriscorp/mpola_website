"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/phone-input";
import { CarrierSelect } from "@/components/carrier-select";
import { detectCarrier } from "@/lib/fees";
import { useUser } from "@/hooks/use-dashboard";
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
  const { data: user } = useUser();
  const [method, setMethod] = useState<"mobile_money" | "card">(
    "mobile_money",
  );
  const [amount, setAmount] = useState("1000");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [carrierOverride, setCarrierOverride] = useState<"MTN" | "AIRTEL" | null>(null);

  // Auto-fill from the account's saved phone number and auto-select the
  // matching network — same as kumpi. Only runs before the user has typed
  // or picked anything themselves, so it never clobbers a manual choice.
  useEffect(() => {
    if (!phoneTouched && !phone && user?.phone) {
      const digits = user.phone.replace(/\D/g, "").slice(-9);
      if (digits.length === 9) {
        setPhone(digits);
        setCarrierOverride(detectCarrier(`0${digits}`));
      }
    }
  }, [user, phone, phoneTouched]);

  const mobileMoney = useDepositMobileMoney();
  const cardDeposit = useCardDeposit();

  if (!open) return null;

  const isPending = mobileMoney.isPending || cardDeposit.isPending;
  const carrier = carrierOverride ?? detectCarrier(phone ? `0${phone}` : "");
  const phoneError =
    method === "mobile_money" && phone.length > 0 && phone.length !== 9
      ? "Enter a full 9-digit number after +256"
      : null;

  const handleConfirm = () => {
    const numericAmount = Number(amount);
    if (method === "mobile_money") {
      mobileMoney.mutate(
        { amount: numericAmount, phone: `+256${phone}`, carrier },
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
            placeholder="e.g. 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {method === "mobile_money" && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Phone Number
              </Label>
              <PhoneInput
                value={phone}
                onChange={(v) => {
                  setPhoneTouched(true);
                  setPhone(v);
                }}
              />
              {phoneError && (
                <p className="text-xs text-red-500">{phoneError}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Network
              </Label>
              <CarrierSelect
                value={carrier}
                onChange={(c) => {
                  setPhoneTouched(true);
                  setCarrierOverride(c);
                }}
              />
            </div>
          </>
        )}

        {method === "card" && (
          <p className="text-sm text-gray-500">
            You&apos;ll complete your card payment in a new tab. Come back
            here once you&apos;re done — we&apos;ll confirm it automatically.
          </p>
        )}

        {Number(amount) > 0 && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>You&apos;re depositing</span>
              <span className="font-medium text-[#1B2B3A] dark:text-white">
                UGX {Number(amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Via</span>
              <span className="font-medium text-[#1B2B3A] dark:text-white">
                {method === "mobile_money"
                  ? `${carrier === "MTN" ? "MTN Mobile Money" : "Airtel Money"}${phone.length === 9 ? ` · +256${phone}` : ""}`
                  : "Card"}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-[#1B2B3A] dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>Deposit fee</span>
              <span>Free</span>
            </div>
          </div>
        )}

        {cardDeposit.isPending && (
          <p className="text-sm text-amber-600">
            Waiting for payment confirmation…
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={mobileMoney.isPending}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            {cardDeposit.isPending ? "Close (keeps waiting)" : "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              isPending ||
              !amount ||
              (method === "mobile_money" && phone.length !== 9)
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
