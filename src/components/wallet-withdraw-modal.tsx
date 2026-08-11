"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/phone-input";
import { CarrierSelect } from "@/components/carrier-select";
import { useUser } from "@/hooks/use-dashboard";
import {
  useWithdrawMobileMoney,
  useBankWithdraw,
  useBanks,
} from "@/hooks/use-wallet";
import {
  calcMobileMoneyWithdrawalCharges,
  calcBankWithdrawalCharges,
  detectCarrier,
} from "@/lib/fees";

interface WalletWithdrawModalProps {
  open: boolean;
  onClose: () => void;
  accent?: "teal" | "gold";
}

const ACCENT_BUTTON_CLASSES: Record<"teal" | "gold", string> = {
  teal: "bg-[#2BB5A0] hover:bg-[#239E8C]",
  gold: "bg-[#C4A55A] hover:bg-[#b3944a]",
};

export function WalletWithdrawModal({
  open,
  onClose,
  accent = "teal",
}: WalletWithdrawModalProps) {
  const [method, setMethod] = useState<"mobile_money" | "bank">(
    "mobile_money",
  );
  const { data: user } = useUser();
  const [amount, setAmount] = useState("1000");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [carrierOverride, setCarrierOverride] = useState<"MTN" | "AIRTEL" | null>(null);
  const [accountBank, setAccountBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");

  const mobileMoney = useWithdrawMobileMoney();
  const bankWithdraw = useBankWithdraw();
  const { data: bankList, isLoading: banksLoading } = useBanks("UG");

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

  const carrier = carrierOverride ?? detectCarrier(phone ? `0${phone}` : "");
  const numericAmount = Number(amount) || 0;
  const charges = useMemo(() => {
    if (numericAmount <= 0) return null;
    return method === "mobile_money"
      ? calcMobileMoneyWithdrawalCharges(numericAmount, carrier)
      : calcBankWithdrawalCharges(numericAmount);
  }, [method, numericAmount, carrier]);

  if (!open) return null;

  const isPending = mobileMoney.isPending || bankWithdraw.isPending;
  const phoneError =
    method === "mobile_money" && phone.length > 0 && phone.length !== 9
      ? "Enter a full 9-digit number after +256"
      : null;

  const handleConfirm = () => {
    if (method === "mobile_money") {
      mobileMoney.mutate(
        { amount: numericAmount, phone: `+256${phone}`, carrier },
        { onSuccess: onClose },
      );
    } else {
      bankWithdraw.mutate(
        {
          amount: numericAmount,
          account_bank: accountBank,
          account_number: accountNumber,
          beneficiary_name: beneficiaryName,
        },
        { onSuccess: onClose },
      );
    }
  };

  const bankValid = accountBank && accountNumber && beneficiaryName;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
          Withdraw Funds
        </h3>

        <div className="flex gap-2">
          {(["mobile_money", "bank"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                method === m
                  ? "bg-[#1B2B3A] text-white border-[#1B2B3A]"
                  : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              {m === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
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

        {method === "mobile_money" ? (
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
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Bank
              </Label>
              <select
                value={accountBank}
                onChange={(e) => setAccountBank(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#2BB5A0]"
              >
                <option value="">
                  {banksLoading ? "Loading banks…" : "Select a bank"}
                </option>
                {bankList?.banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Account Number
              </Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Account Holder Name
              </Label>
              <Input
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
              />
            </div>
          </>
        )}

        {charges && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 space-y-1 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Recipient receives</span>
              <span className="font-medium text-[#1B2B3A] dark:text-white">
                UGX {numericAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Platform fee (0.5%)</span>
              <span>UGX {charges.platform_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>
                {method === "mobile_money" ? "Network fee" : "Flutterwave fee (3%)"}
              </span>
              <span>UGX {charges.provider_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-[#1B2B3A] dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>Total debited from wallet</span>
              <span>
                UGX {(numericAmount + charges.total_fee).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {bankWithdraw.isPending && (
          <p className="text-sm text-amber-600">
            Processing your transfer…
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={mobileMoney.isPending}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-50"
          >
            {bankWithdraw.isPending ? "Close (keeps waiting)" : "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              isPending ||
              !amount ||
              (method === "mobile_money" ? phone.length !== 9 : !bankValid)
            }
            className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 ${ACCENT_BUTTON_CLASSES[accent]}`}
          >
            {isPending ? "Processing…" : "Confirm Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
