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
  const isLender = from === "lender";

  const backHref = isLender ? "/auth/lender-signin" : "/auth/signin";
  const portalLabel = isLender ? "Lender" : "Borrower";

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
          toast.success("Password reset. Please sign in.");
          window.location.href = backHref;
        },
      },
    );
  }

  const stepIndex = (["request", "verify", "reset"] as Step[]).indexOf(step);

  return (
    <div
      className={`min-h-screen ${
        isLender
          ? "bg-[linear-gradient(180deg,#F9F6EE_0%,#F8FAFB_46%,#FFFFFF_100%)]"
          : "bg-[linear-gradient(180deg,#EEF8F6_0%,#F8FBFB_46%,#FFFFFF_100%)]"
      }`}
    >
      <div className={`h-1 ${isLender ? "bg-[#C4A55A]" : "bg-[#2BB5A0]"}`} />

      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 pb-2 pt-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <Logo asLink={false} />

          <p
            className={`mt-5 text-[11px] font-semibold uppercase tracking-wider ${
              isLender ? "text-[#9F7F34]" : "text-[#149D8E]"
            }`}
          >
            {portalLabel} Password Recovery
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#1B2B3A]">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete the steps below to securely update your credentials.
          </p>

          <div className="my-6 flex items-center">
            {(["request", "verify", "reset"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i <= stepIndex
                      ? isLender
                        ? "bg-[#C4A55A] text-white"
                        : "bg-[#2BB5A0] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`h-px w-10 transition-colors ${
                      i < stepIndex
                        ? isLender
                          ? "bg-[#C4A55A]"
                          : "bg-[#2BB5A0]"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === "request" && (
            <>
              <p className="mb-5 text-sm text-gray-500">
                Choose where you want to receive your one-time reset code.
              </p>

              <div className="mb-5 flex rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors ${
                    method === "email"
                      ? isLender
                        ? "bg-[#C4A55A] text-white"
                        : "bg-[#2BB5A0] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-semibold transition-colors ${
                    method === "phone"
                      ? isLender
                        ? "bg-[#C4A55A] text-white"
                        : "bg-[#2BB5A0] text-white"
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
                      <span
                        className={`inline-flex items-center rounded-l-lg border border-r-0 px-3 text-sm font-semibold ${
                          isLender
                            ? "border-[#E7D9B7] bg-[#FCF8EE] text-[#9F7F34]"
                            : "border-[#D5ECE8] bg-[#F2FBF9] text-[#149D8E]"
                        }`}
                      >
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
                  className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLender
                      ? "bg-[#C4A55A] hover:bg-[#b3944a]"
                      : "bg-[#2BB5A0] hover:bg-[#239E8C]"
                  }`}
                >
                  {isSending ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <p className="mb-5 text-sm text-gray-500">
                Enter the 6-digit verification code sent to your{" "}
                {method === "email" ? "email" : "phone"}.
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <div
                  className="flex justify-center gap-2"
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
                      className={`h-12 w-11 rounded-lg border text-center text-xl font-bold outline-none ${
                        isLender
                          ? "focus:border-[#C4A55A] focus:ring-2 focus:ring-[#C4A55A]/30"
                          : "focus:border-[#2BB5A0] focus:ring-2 focus:ring-[#2BB5A0]/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || code.join("").length < 6}
                  className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLender
                      ? "bg-[#C4A55A] hover:bg-[#b3944a]"
                      : "bg-[#2BB5A0] hover:bg-[#239E8C]"
                  }`}
                >
                  {isVerifying ? "Verifying..." : "Verify Code"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setCode(["", "", "", "", "", ""]);
                  setStep("request");
                }}
                className={`mt-4 w-full text-sm font-medium ${
                  isLender
                    ? "text-[#9F7F34] hover:text-[#876B2E]"
                    : "text-[#149D8E] hover:text-[#108477]"
                }`}
              >
                Did not receive it? Go back and resend
              </button>
            </>
          )}

          {step === "reset" && (
            <>
              <p className="mb-5 text-sm text-gray-500">
                Set a new password with at least 8 characters.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="newPassword"
                      type={showPw ? "text" : "password"}
                      placeholder="........"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPw ? "text" : "password"}
                    placeholder="........"
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
                  className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLender
                      ? "bg-[#C4A55A] hover:bg-[#b3944a]"
                      : "bg-[#2BB5A0] hover:bg-[#239E8C]"
                  }`}
                >
                  {isResetting ? "Saving..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
