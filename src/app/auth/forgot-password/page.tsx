"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useSendPasswordResetCode,
  useVerifyPasswordResetCode,
  useResetPassword,
} from "@/hooks/use-auth";

type Step = "request" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const backHref = from === "lender" ? "/auth/lender-signin" : "/auth/signin";

  const [step, setStep] = useState<Step>("request");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: sendCode, isPending: isSending } = useSendPasswordResetCode();
  const { mutate: verifyCode, isPending: isVerifying } =
    useVerifyPasswordResetCode();
  const { mutate: resetPw, isPending: isResetting } = useResetPassword();

  function getIdentifierValue() {
    if (method === "phone") {
      const digits = identifier.replace(/\D/g, "");
      if (digits.length === 9) return `256${digits}`;
      if (digits.startsWith("0") && digits.length === 10)
        return `256${digits.slice(1)}`;
      if (digits.startsWith("256") && digits.length === 12) return digits;
      return digits;
    }
    return identifier.trim();
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return;
    sendCode(getIdentifierValue(), {
      onSuccess: () => {
        toast.success(
          method === "email"
            ? "Reset code sent to your email."
            : "Reset code sent via SMS.",
        );
        setStep("verify");
      },
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
    verifyCode(
      { identifier: getIdentifierValue(), code: fullCode },
      {
        onSuccess: (res) => {
          setResetToken(res.access_token);
          setStep("reset");
        },
      },
    );
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    resetPw(
      { newPassword, accessToken: resetToken },
      {
        onSuccess: () => {
          toast.success("Password reset! Please sign in.");
          window.location.href = backHref;
        },
      },
    );
  }

  const stepIndex = (["request", "verify", "reset"] as Step[]).indexOf(step);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8f7]">
      <div className="h-1 bg-[#2BB5A0]" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-10">
          <Logo />

          <Link
            href={backHref}
            className="mt-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>

          {/* Step indicators */}
          <div className="flex items-center mt-6 mb-8">
            {(["request", "verify", "reset"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i <= stepIndex
                      ? "bg-[#2BB5A0] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`h-px w-10 transition-colors ${i < stepIndex ? "bg-[#2BB5A0]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: enter identifier ── */}
          {step === "request" && (
            <>
              <h1 className="text-2xl font-bold text-[#1B2B3A]">
                Forgot Password?
              </h1>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                We&apos;ll send a one-time code to reset your password.
              </p>

              <div className="flex rounded-lg border p-1 mb-5">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                    method === "email"
                      ? "bg-[#2BB5A0] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                    method === "phone"
                      ? "bg-[#2BB5A0] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Phone className="h-4 w-4" /> Phone
                </button>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <Label htmlFor="identifier">
                    {method === "email" ? "Email address" : "Phone number"}
                  </Label>
                  {method === "phone" ? (
                    <div className="mt-1.5 flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        +256
                      </span>
                      <Input
                        id="identifier"
                        type="tel"
                        placeholder="772 843 901"
                        className="rounded-l-none"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <Input
                      id="identifier"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1.5"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? "Sending…" : "Send Reset Code"}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: enter OTP ── */}
          {step === "verify" && (
            <>
              <h1 className="text-2xl font-bold text-[#1B2B3A]">Enter Code</h1>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Enter the 6-digit code sent to your{" "}
                <span className="font-medium text-[#1B2B3A]">
                  {method === "email" ? "email" : "phone"}
                </span>
                .
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <div
                  className="flex gap-2 justify-center"
                  onPaste={handlePaste}
                >
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
                      className="w-11 h-12 text-center text-xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-transparent"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || code.join("").length < 6}
                  className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? "Verifying…" : "Verify Code"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setCode(["", "", "", "", "", ""]);
                  setStep("request");
                }}
                className="mt-4 w-full text-sm text-gray-500 hover:text-[#2BB5A0]"
              >
                Didn&apos;t receive it? Go back and resend
              </button>
            </>
          )}

          {/* ── Step 3: new password ── */}
          {step === "reset" && (
            <>
              <h1 className="text-2xl font-bold text-[#1B2B3A]">
                Set New Password
              </h1>
              <p className="text-sm text-gray-500 mt-1 mb-6">
                Choose a strong password (min. 8 characters).
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="newPassword"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="mt-1.5"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? "Saving…" : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
