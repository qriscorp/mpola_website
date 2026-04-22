"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function LenderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<"individual" | "company">(
    "individual",
  );
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }

    toast.success("Lender account created successfully.");
    router.push("/lender");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F9F6EE_0%,#F8FAFB_42%,#FFFFFF_100%)]">
      <div className="h-1 bg-[#C4A55A]" />

      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <Link
          href="/auth/lender-signin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-2xl border border-[#E5D6AF] bg-[#F5F0E0] p-6 sm:p-8">
          <Logo asLink={false} />
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#9F7F34]">
            Lender Onboarding
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#1B2B3A]">
            Create your lender account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Register your profile, complete identity verification, and set up
            your wallet to begin posting offers.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Step 1: Account details",
              "Step 2: KYC verification",
              "Step 3: Wallet setup",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-[#1B2B3A]"
              >
                <span className="h-2 w-2 rounded-full bg-[#C4A55A]" />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-3 flex gap-2">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-[#C4A55A]" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Step {step} of 3
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#1B2B3A]">
              {step === 1
                ? "Registration Details"
                : step === 2
                  ? "Identity Verification"
                  : "Wallet Setup"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {step === 1
                ? "Tell us about you and your lender profile."
                : step === 2
                  ? "Upload required KYC documents for review."
                  : "Choose where disbursements and repayments should settle."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="mb-1 inline-flex rounded-lg border border-gray-200 p-1">
                  <button
                    type="button"
                    onClick={() => setAccountType("individual")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      accountType === "individual"
                        ? "bg-[#C4A55A] text-white"
                        : "text-gray-600 hover:text-[#1B2B3A]"
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("company")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      accountType === "company"
                        ? "bg-[#C4A55A] text-white"
                        : "text-gray-600 hover:text-[#1B2B3A]"
                    }`}
                  >
                    Company
                  </button>
                </div>

                <div>
                  <Label>Full Legal Name</Label>
                  <Input className="mt-1.5" placeholder="David Mugisha" />
                </div>

                {accountType === "company" && (
                  <>
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="Mugisha Capital Ltd"
                      />
                    </div>
                    <div>
                      <Label>Registration Number</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="URSB Registration Number"
                      />
                    </div>
                    <div>
                      <Label>TIN (Tax Identification Number)</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="10-digit URA TIN"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>National ID Number (NIN)</Label>
                  <Input className="mt-1.5" placeholder="CM98041234AB7X" />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <div className="mt-1.5 flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-[#FCF8EE] px-3 text-sm font-semibold text-[#9F7F34]">
                      +256
                    </span>
                    <Input
                      className="rounded-l-none"
                      placeholder="772 000 000"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input
                    className="mt-1.5"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Password</Label>
                    <Input
                      className="mt-1.5"
                      type="password"
                      placeholder="8+ characters"
                    />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input
                      className="mt-1.5"
                      type="password"
                      placeholder="Re-enter"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-[#E7D9B7] bg-[#FCF8EE] p-3.5">
                  <Checkbox
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(!!checked)}
                    className="mt-0.5 data-[state=checked]:border-[#C4A55A] data-[state=checked]:bg-[#C4A55A]"
                  />
                  <p className="text-xs leading-relaxed text-gray-600">
                    I agree to the{" "}
                    <Link
                      href="/platform-terms"
                      className="font-semibold text-[#9F7F34] hover:underline"
                    >
                      Platform Terms
                    </Link>
                    ,{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-semibold text-[#9F7F34] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link
                      href="/lender-code-of-conduct"
                      className="font-semibold text-[#9F7F34] hover:underline"
                    >
                      Lender Code of Conduct
                    </Link>
                    .
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {[
                  "National ID (front)",
                  "National ID (back)",
                  "Selfie with ID",
                ].map((label) => (
                  <div key={label}>
                    <Label>{label}</Label>
                    <div className="mt-1.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                      Click to upload or drag and drop
                    </div>
                  </div>
                ))}
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label>Primary Payment Method</Label>
                  <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {["MTN MoMo", "Airtel Money", "Bank Transfer"].map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm font-semibold text-[#1B2B3A] transition-colors hover:border-[#C4A55A]"
                        >
                          {method}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <Label>Phone / Account Number</Label>
                  <div className="mt-1.5 flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-[#FCF8EE] px-3 text-sm font-semibold text-[#9F7F34]">
                      +256
                    </span>
                    <Input
                      className="rounded-l-none"
                      placeholder="772 000 000"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C4A55A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b3944a]"
            >
              {step === 3
                ? "Create Account"
                : step === 2
                  ? "Continue to Wallet Setup"
                  : "Continue to Verification"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {step === 1 && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/auth/lender-signin"
                className="font-semibold text-[#9F7F34] hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
