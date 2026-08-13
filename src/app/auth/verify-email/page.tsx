"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, RefreshCw } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import {
  useSendOtp,
  useVerifyOtp,
  useSendSignupEmailOtp,
  useVerifySignupEmailOtp,
} from "@/hooks/use-auth";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

function getSignupFormDraftRole(): "borrower" | "lender" | null {
  const raw = getCookie("lf_signup_form_draft");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { role?: string };
    return parsed.role === "lender" ? "lender" : "borrower";
  } catch {
    return null;
  }
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [draftId, setDraftId] = useState("");
  const [email, setEmail] = useState(() =>
    decodeURIComponent(getCookie("lf_email") || ""),
  );
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const autoSentRef = useRef(false);

  const { mutate: sendOtp, isPending: isSending } = useSendOtp();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: sendSignupOtp, isPending: isSendingSignup } =
    useSendSignupEmailOtp();
  const { mutate: verifySignupOtp, isPending: isVerifyingSignup } =
    useVerifySignupEmailOtp();

  useEffect(() => {
    const loadDraftStatus = async (draft: string, fallbackEmail: string) => {
      try {
        const status = await api.getSignupDraftStatus(draft);
        const role =
          status.draft?.role || getCookie("lf_signup_role") || "borrower";

        if (status.account_created || status.draft?.is_completed) {
          router.replace(
            role === "lender" ? "/auth/lender-signin" : "/auth/signin",
          );
          return;
        }

        if (status.draft?.next_step === "verify_phone") {
          router.replace("/auth/verify-phone");
          return;
        }

        const nextDraftId = status.draft?.draft_id || draft;
        setDraftId(nextDraftId);
        setEmail(status.draft?.email || fallbackEmail);

        if (!autoSentRef.current) {
          autoSentRef.current = true;
          sendSignupOtp(nextDraftId);
        }
      } catch {
        setDraftId(draft);
        setEmail(fallbackEmail);
        if (!autoSentRef.current) {
          autoSentRef.current = true;
          sendSignupOtp(draft);
        }
      }
    };

    const draft = getCookie("lf_signup_draft") || "";
    const draftEmail = decodeURIComponent(getCookie("lf_signup_email") || "");
    if (draft) {
      void loadDraftStatus(draft, draftEmail);
      return;
    }

    const u = getCookie("lf_username") || "";
    const verified = getCookie("lf_verified");
    const signupRole = getCookie("lf_signup_role");
    const signupFlow = getCookie("lf_signup_flow") === "true";
    const signupEmailCookie = getCookie("lf_signup_email");

    if (!u) {
      if (signupFlow || signupRole || signupEmailCookie) {
        router.replace(
          `/auth/register?portal=${signupRole === "lender" ? "lender" : "borrower"}`,
        );
        return;
      }

      const draftRole = getSignupFormDraftRole();
      if (draftRole) {
        router.replace(`/auth/register?portal=${draftRole}`);
        return;
      }
      router.replace("/auth/signin");
      return;
    }
    if (verified === "true") {
      const phoneVerified = getCookie("lf_phone_verified");
      router.replace(
        phoneVerified === "true" ? "/dashboard" : "/auth/verify-phone",
      );
      return;
    }

    // Auto-send OTP on first mount so the user always has a fresh code
    if (!autoSentRef.current) {
      autoSentRef.current = true;
      sendOtp(u);
    }
  }, [router, sendOtp, sendSignupOtp]);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return;
    if (draftId) {
      verifySignupOtp({ draftId, code: fullCode });
      return;
    }
    const username = getCookie("lf_username") || "";
    verifyOtp({ username, code: fullCode });
  }

  function handleResend() {
    if (draftId) {
      sendSignupOtp(draftId);
      return;
    }
    const username = getCookie("lf_username") || "";
    if (username) sendOtp(username);
  }

  const sending = draftId ? isSendingSignup : isSending;
  const verifying = draftId ? isVerifyingSignup : isVerifying;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8f7] dark:bg-gray-950">
      <div className="h-1 bg-[#2BB5A0]" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-10 dark:border-gray-800 dark:bg-gray-900">
          <Logo />

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-[#E8F8F5] dark:bg-[#2BB5A0]/10 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="w-7 h-7 text-[#2BB5A0]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              Verify your email
            </h1>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed dark:text-gray-400">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-[#1B2B3A] dark:text-white">
                {email || "your registered email"}
              </span>
              . Enter it below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
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
                  className="w-12 h-14 text-center text-xl font-bold tracking-widest"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={verifying || code.join("").length < 6}
              className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying…" : "Verify Email"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6 dark:text-gray-400">
            Didn&apos;t receive it?{" "}
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-[#2BB5A0] font-medium hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              {sending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
