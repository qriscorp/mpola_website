"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      toast.success("Account created successfully!");
      router.push("/lender");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="h-1 bg-[#2BB5A0]" />

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back + Logo */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-[#1B2B3A] dark:hover:text-white inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Logo />
          <div className="w-16" />
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? "bg-[#2BB5A0]" : "bg-gray-200 dark:bg-gray-800"}`}
            />
          ))}
        </div>

        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-6 sm:p-8">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Step {step} of 3
            </p>
            <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white mb-1">
              {step === 1
                ? "Create your lender account"
                : step === 2
                  ? "Verify your identity"
                  : "Set up your wallet"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {step === 1
                ? "We'll verify your identity in the next step."
                : step === 2
                  ? "Upload your KYC documents for verification."
                  : "Connect a payment method to start lending."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <>
                  {/* Account Type Toggle */}
                  <div className="flex border rounded-lg overflow-hidden w-fit">
                    <button
                      type="button"
                      onClick={() => setAccountType("individual")}
                      className={`px-6 py-2 text-sm font-medium transition-colors ${accountType === "individual" ? "bg-[#1B2B3A] text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("company")}
                      className={`px-6 py-2 text-sm font-medium transition-colors ${accountType === "company" ? "bg-[#1B2B3A] text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
                    >
                      Company
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label>Full Legal Name</Label>
                    <Input placeholder="David Mugisha" />
                  </div>

                  {accountType === "company" && (
                    <>
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input placeholder="e.g. Mugisha Capital Ltd." />
                      </div>
                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input placeholder="URSB Registration Number" />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>National ID Number (NIN)</Label>
                    <Input placeholder="CM98041234AB7X" />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        🇺🇬 +256
                      </span>
                      <Input
                        placeholder="772 000 000"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="you@example.com" />
                  </div>

                  {accountType === "company" && (
                    <div className="space-y-2">
                      <Label>TIN (Tax Identification Number)</Label>
                      <Input placeholder="10-digit URA TIN" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" placeholder="8+ characters" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" placeholder="Re-enter" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(c) => setAgreed(!!c)}
                      className="mt-1 data-[state=checked]:bg-[#2BB5A0] data-[state=checked]:border-[#2BB5A0]"
                    />
                    <p className="text-xs text-muted-foreground">
                      I agree to the{" "}
                      <Link
                        href="/platform-terms"
                        className="text-[#2BB5A0] hover:underline cursor-pointer"
                      >
                        Platform Terms
                      </Link>
                      ,{" "}
                      <Link
                        href="/privacy-policy"
                        className="text-[#2BB5A0] hover:underline cursor-pointer"
                      >
                        Privacy Policy
                      </Link>
                      , and{" "}
                      <Link
                        href="/lender-code-of-conduct"
                        className="text-[#2BB5A0] hover:underline cursor-pointer"
                      >
                        Lender Code of Conduct
                      </Link>
                      . I confirm I am 18+ and a resident of Uganda.
                    </p>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>National ID (front)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      Click to upload or drag and drop
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>National ID (back)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      Click to upload or drag and drop
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Selfie with ID</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      Click to upload or drag and drop
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Primary Payment Method</Label>
                    <div className="flex gap-2">
                      {["MTN MoMo", "Airtel Money", "Bank Transfer"].map(
                        (m) => (
                          <button
                            key={m}
                            type="button"
                            className="flex-1 py-3 rounded-lg text-sm font-medium border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#2BB5A0] transition-colors"
                          >
                            {m}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone / Account Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                        🇺🇬 +256
                      </span>
                      <Input
                        placeholder="772 000 000"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-[#C4A55A] hover:bg-[#b3944a] text-white gap-2"
              >
                {step === 3
                  ? "Create Account"
                  : step === 1
                    ? "Continue to Wallet Setup"
                    : "Continue to Verification"}{" "}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {step === 1 && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link
                  href="/auth/lender-signin"
                  className="text-[#2BB5A0] font-medium hover:underline inline-flex items-center gap-1"
                >
                  Sign in <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
