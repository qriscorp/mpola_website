"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const OTP_LENGTH = 6;

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtp(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete code");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    // Accept any 6-digit code for demo
    setLoading(false);
    router.push("/dashboard");
  }, [otp, router]);

  const handleResend = () => {
    setCountdown(59);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B2B3A] via-[#1B2B3A] to-[#239E8C] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link
            href="/auth/signin"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F8F5] dark:bg-[#2BB5A0]/10">
            <ShieldCheck className="h-7 w-7 text-[#2BB5A0]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Verify Your Identity
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your phone number ending in ***456
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
                className={`h-12 w-10 sm:h-14 sm:w-12 rounded-lg border-2 text-center text-xl font-bold transition-colors
                  focus:border-[#2BB5A0] focus:outline-none focus:ring-2 focus:ring-[#2BB5A0]/20
                  ${error ? "border-red-500" : digit ? "border-[#2BB5A0]" : "border-gray-300 dark:border-gray-600"}
                  bg-white dark:bg-gray-900 text-[#1B2B3A] dark:text-white`}
              />
            ))}
          </div>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <Button
            className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
            disabled={loading || otp.join("").length < OTP_LENGTH}
            onClick={handleVerify}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </Button>

          {/* Resend */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Didn&apos;t get the code?{" "}
            </span>
            {countdown > 0 ? (
              <span className="text-muted-foreground">
                Resend in{" "}
                <span className="font-semibold text-[#2BB5A0]">
                  0:{countdown.toString().padStart(2, "0")}
                </span>
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="font-semibold text-[#2BB5A0] hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
