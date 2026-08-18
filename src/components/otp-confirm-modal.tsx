"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";

interface OtpConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
  loading?: boolean;
  resending?: boolean;
  error?: string | null;
  accentClassName?: string; // e.g. "bg-[#2BB5A0] hover:bg-[#239E8C]"
}

/** A 6-digit SMS code confirmation — same shell as ConfirmModal, but for
 * step-up verification flows (wallet withdrawal, etc.) that need an actual
 * code instead of a yes/no choice. Mirrors the digit-box UX already used
 * on the email/phone verify pages. */
export function OtpConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onResend,
  loading = false,
  resending = false,
  error,
  accentClassName = "bg-[#2BB5A0] hover:bg-[#239E8C]",
}: OtpConfirmModalProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) setCode(["", "", "", "", "", ""]);
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

  const full = code.join("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-[#E8F8F5] dark:bg-[#2BB5A0]/10">
            <KeyRound className="h-6 w-6 text-[#2BB5A0]" />
          </div>
          <DialogTitle className="text-center text-[#1B2B3A] dark:text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 justify-center mt-2" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <Input
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
              disabled={loading}
              className="w-11 h-13 text-center text-xl font-bold tracking-widest"
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 mt-2">{error}</p>
        )}

        <button
          type="button"
          onClick={onResend}
          disabled={resending || loading}
          className="text-center text-sm font-medium text-[#2BB5A0] hover:underline mt-3 disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => onConfirm(full)}
            disabled={loading || full.length < 6}
            className={`w-full ${accentClassName}`}
          >
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
