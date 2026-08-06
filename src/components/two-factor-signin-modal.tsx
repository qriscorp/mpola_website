"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVerifyLogin2FA } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  username: string;
  onClose: () => void;
}

/** Shown right after a correct password when the account has 2FA enabled —
 * the code was already sent by the login attempt that triggered this modal. */
export function TwoFactorSignInModal({ open, username, onClose }: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { mutate: verify, isPending } = useVerifyLogin2FA();

  useEffect(() => {
    if (open) {
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputs.current[0]?.focus(), 0);
    }
  }, [open]);

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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return;
    verify({ username, code: fullCode });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[#1B2B3A]">
            Two-Factor Verification
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 -mt-2 mb-4">
          Enter the 6-digit code we just texted to your phone to finish
          signing in.
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
            disabled={isPending || code.join("").length < 6}
            className="w-full bg-[#2BB5A0] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Verifying…" : "Verify & Sign In"}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-gray-400">
          Didn&apos;t get a code? Close this and sign in again to resend it.
        </p>
      </DialogContent>
    </Dialog>
  );
}
