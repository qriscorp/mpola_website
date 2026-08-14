"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

interface WalletSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  isPending?: boolean;
  accent?: "teal" | "gold";
}

const ACCENT_BUTTON_CLASSES: Record<"teal" | "gold", string> = {
  teal: "bg-[#2BB5A0] hover:bg-[#239E8C]",
  gold: "bg-[#C4A55A] hover:bg-[#b3944a]",
};

export function WalletSetupModal({
  open,
  onClose,
  onSubmit,
  isPending,
  accent = "teal",
}: WalletSetupModalProps) {
  const [pin, setPin] = useState("");

  if (!open) return null;

  const valid = pin.length >= 4 && pin.length <= 6;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
          Set Up Your Wallet
        </h3>
        <p className="text-sm text-gray-500">
          Create a 4–6 digit PIN to secure your deposits and withdrawals.
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Wallet PIN
          </Label>
          <PasswordInput
            inputMode="numeric"
            maxLength={6}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(pin)}
            disabled={!valid || isPending}
            className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 ${ACCENT_BUTTON_CLASSES[accent]}`}
          >
            {isPending ? "Setting up…" : "Confirm PIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
