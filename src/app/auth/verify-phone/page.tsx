"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, RefreshCw } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSendPhoneOtp,
  useVerifyPhoneOtp,
  useSendSignupPhoneOtp,
  useVerifySignupPhoneOtp,
} from "@/hooks/use-auth";

function getCookie(name: string): string | undefined {
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

/** Strip 256 prefix for display in +256 | [input] UI */
function toLocalDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("256") && digits.length === 12) return digits.slice(3);
  if (digits.startsWith("0") && digits.length === 10) return digits.slice(1);
  return digits;
}

export default function VerifyPhonePage() {
  const router = useRouter();
  const [draftId, setDraftId] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: sendPhoneOtp, isPending: isSending } = useSendPhoneOtp();
  const { mutate: verifyPhoneOtp, isPending: isVerifying } =
    useVerifyPhoneOtp();
  const { mutate: sendSignupPhoneOtp, isPending: isSendingSignup } =
    useSendSignupPhoneOtp();
  const { mutate: verifySignupPhoneOtp, isPending: isVerifyingSignup } =
    useVerifySignupPhoneOtp();

  useEffect(() => {
    const draft = getCookie("lf_signup_draft") || "";
    if (draft) {
      const phoneVerified = getCookie("lf_signup_phone_verified") === "true";
      if (phoneVerified) {
        const role = getCookie("lf_signup_role") || "borrower";
        router.replace(
          role === "lender" ? "/auth/lender-signin" : "/auth/signin",
        );
        return;
      }

      const rawPhone = getCookie("lf_signup_phone") || "";
      const emailVerified = getCookie("lf_signup_email_verified");

      if (emailVerified !== "true") {
        router.replace("/auth/verify-email");
        return;
      }

      queueMicrotask(() => {
        setDraftId(draft);
        setPhone(toLocalDisplay(rawPhone));
      });
      return;
    }

    const u = getCookie("lf_username") || "";
    const rawPhone = getCookie("lf_phone") || "";
    const phoneVerified = getCookie("lf_phone_verified");
    const verified = getCookie("lf_verified");

    if (!u) {
      const draftRole = getSignupFormDraftRole();
      if (draftRole) {
        router.replace(`/auth/register?portal=${draftRole}`);
        return;
      }
      router.replace("/auth/signin");
      return;
    }
    if (verified !== "true") {
      router.replace("/auth/verify-email");
      return;
    }
    if (phoneVerified === "true") {
      const role = getCookie("lf_role") || "borrower";
      router.replace(role === "lender" ? "/lender" : "/dashboard");
      return;
    }

    setUsername(u);
    setPhone(toLocalDisplay(rawPhone));
  }, [router]);

  function handleSend() {
    if (!phone) return;
    if (draftId) {
      sendSignupPhoneOtp(
        { draftId, phoneNumber: phone },
        { onSuccess: () => setCodeSent(true) },
      );
      return;
    }
    sendPhoneOtp(
      { username, phoneNumber: phone },
      { onSuccess: () => setCodeSent(true) },
    );
  }

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputs.current[5]?.focus();
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = otp.join("");
    if (fullCode.length < 6) return;
    if (draftId) {
      verifySignupPhoneOtp({ draftId, phoneNumber: phone, code: fullCode });
      return;
    }
    verifyPhoneOtp({ username, phoneNumber: phone, code: fullCode });
  }

  const sending = draftId ? isSendingSignup : isSending;
  const verifying = draftId ? isVerifyingSignup : isVerifying;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8f7]">
      <div className="h-1 bg-[#2BB5A0]" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-10">
          <Logo />

          <div className="mt-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-[#E8F8F5] rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-7 h-7 text-[#2BB5A0]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B2B3A]">
              Verify your phone
            </h1>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              We&apos;ll send a verification code via SMS to confirm your
              Ugandan phone number.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {/* Phone input */}
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                  +256
                </span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="704 690 012"
                  className="rounded-l-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  disabled={codeSent}
                />
              </div>
            </div>

            {!codeSent ? (
              <button
                onClick={handleSend}
                disabled={sending || !phone}
                className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending…" : "Send Verification Code"}
              </button>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <Label className="mb-2 block text-center text-sm text-gray-500">
                    Enter the 6-digit code sent to +256{phone}
                  </Label>
                  <div
                    className="flex gap-2 justify-center"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, i) => (
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
                        className="w-12 h-14 text-center text-xl font-bold"
                        aria-label={`Digit ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifying || otp.join("").length < 6}
                  className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? "Verifying…" : "Confirm Phone"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="text-[#2BB5A0] font-medium hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {sending ? "Sending…" : "Resend"}
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
