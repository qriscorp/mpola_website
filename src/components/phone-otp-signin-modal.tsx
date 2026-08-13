"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendLoginPhoneOtp, useVerifyLoginPhoneOtp } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  onClose: () => void;
  portal?: "borrower" | "lender";
}

export function PhoneOtpSigninModal({ open, onClose, portal }: Props) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: sendOtp, isPending: isSending } = useSendLoginPhoneOtp();
  const { mutate: verifyOtp, isPending: isVerifying } =
    useVerifyLoginPhoneOtp(portal);

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setStep("phone");
      setPhone("");
      setCode(["", "", "", "", "", ""]);
    }
  }, [open]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    sendOtp(phone, {
      onSuccess: () => setStep("otp"),
    });
  }

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return;
    verifyOtp({ phoneNumber: phone, code: fullCode });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#1B2B3A] dark:text-white">
            {step === "phone" ? "Sign in with OTP" : "Enter Code"}
          </DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <>
            <p className="text-sm text-gray-500 -mt-2 mb-4 dark:text-gray-400">
              Enter your registered phone number and we&apos;ll send you a
              one-time sign-in code.
            </p>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label htmlFor="otp-phone">Phone number</Label>
                <div className="mt-1.5 flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                    +256
                  </span>
                  <Input
                    id="otp-phone"
                    type="tel"
                    placeholder="772 843 901"
                    className="rounded-l-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-[#2BB5A0] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending…" : "Send Code"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="text-sm text-gray-500 -mt-2 mb-4 dark:text-gray-400">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-[#1B2B3A] dark:text-white">+256 {phone}</span>.
              If you don&apos;t receive a code, the number may not be
              registered.
            </p>
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-11 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-transparent"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifying || code.join("").length < 6}
                className="w-full bg-[#2BB5A0] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying…" : "Sign In"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setCode(["", "", "", "", "", ""]);
                setStep("phone");
              }}
              className="mt-1 w-full text-sm text-gray-500 hover:text-[#2BB5A0] dark:text-gray-400"
            >
              Use a different number
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
