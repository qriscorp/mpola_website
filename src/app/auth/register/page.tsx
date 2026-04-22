"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks/use-auth";
import {
  registerIndividualSchema,
  registerBusinessSchema,
  type RegisterIndividualFormData,
  type RegisterBusinessFormData,
} from "@/lib/schemas";

type AccountType = "individual" | "business";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const { mutate: registerUser, isPending } = useRegister();

  const individualForm = useForm<RegisterIndividualFormData>({
    resolver: zodResolver(registerIndividualSchema),
    defaultValues: {
      accountType: "individual",
      agreeToTerms: true as unknown as true,
    },
  });

  const businessForm = useForm<RegisterBusinessFormData>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      accountType: "business",
      agreeToTerms: true as unknown as true,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = (
    accountType === "individual" ? individualForm : businessForm
  ) as any;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const onSubmit = (
    data: RegisterIndividualFormData | RegisterBusinessFormData,
  ) => {
    registerUser(data);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#EEF8F6_0%,#F8FBFB_38%,#FFFFFF_100%)]">
      <div className="h-1 bg-[#2BB5A0]" />

      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-2xl border border-[#CBEAE4] bg-[#E8F8F5] p-6 sm:p-8">
          <Logo asLink={false} />
          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#149D8E]">
            Borrower Onboarding
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#1B2B3A]">
            Create your borrower account
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Complete registration in a few minutes and proceed to ID
            verification so lenders can start reviewing your profile.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Step 1: Account details",
              "Step 2: Identity verification",
              "Step 3: Start your first request",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-[#1B2B3A]"
              >
                <span className="h-2 w-2 rounded-full bg-[#2BB5A0]" />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-3 flex gap-2">
              <span className="h-1.5 flex-1 rounded-full bg-[#2BB5A0]" />
              <span className="h-1.5 flex-1 rounded-full bg-gray-200" />
              <span className="h-1.5 flex-1 rounded-full bg-gray-200" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Step 1 of 3
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#1B2B3A]">
              Registration Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose your account type and fill in your legal information.
            </p>
          </div>

          <div className="mb-5 inline-flex rounded-lg border border-gray-200 p-1">
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                accountType === "individual"
                  ? "bg-[#2BB5A0] text-white"
                  : "text-gray-600 hover:text-[#1B2B3A]"
              }`}
              onClick={() => setAccountType("individual")}
            >
              Individual
            </button>
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                accountType === "business"
                  ? "bg-[#2BB5A0] text-white"
                  : "text-gray-600 hover:text-[#1B2B3A]"
              }`}
              onClick={() => setAccountType("business")}
            >
              Business Owner
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Full Legal Name</Label>
              <Input
                className="mt-1.5"
                placeholder="Sarah Nakato"
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {accountType === "business" && (
              <>
                <div>
                  <Label>Business Name</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="Nakato Enterprises Ltd"
                    {...register("businessName" as never)}
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="URSB Registration Number"
                    {...register("registrationNumber" as never)}
                  />
                </div>
              </>
            )}

            <div>
              <Label>National ID Number (NIN)</Label>
              <Input
                className="mt-1.5"
                placeholder="CM98041234AB7X"
                aria-invalid={!!errors.nin}
                {...register("nin")}
              />
              {errors.nin && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nin.message}
                </p>
              )}
            </div>

            <div>
              <Label>Phone Number</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-[#E8F8F5] px-3 text-sm font-semibold text-[#149D8E]">
                  +256
                </span>
                <Input
                  placeholder="772 000 000"
                  className="rounded-l-none"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email Address</Label>
              <div className="relative mt-1.5">
                <Input
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2BB5A0]" />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  className="mt-1.5"
                  placeholder="8+ characters"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  className="mt-1.5"
                  placeholder="Re-enter"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-[#D5ECE8] bg-[#F2FBF9] p-3.5">
              <Checkbox
                id="terms"
                checked={watch("agreeToTerms") as boolean}
                onCheckedChange={(checked) =>
                  setValue("agreeToTerms" as never, !!checked as never)
                }
                className="mt-0.5 data-[state=checked]:border-[#2BB5A0] data-[state=checked]:bg-[#2BB5A0]"
              />
              <p className="text-xs leading-relaxed text-gray-600">
                I agree to the{" "}
                <Link
                  href="/platform-terms"
                  className="font-semibold text-[#149D8E] hover:underline"
                >
                  Platform Terms
                </Link>
                ,{" "}
                <Link
                  href="/privacy-policy"
                  className="font-semibold text-[#149D8E] hover:underline"
                >
                  Privacy Policy
                </Link>
                , and{" "}
                <Link
                  href="/borrower-code-of-conduct"
                  className="font-semibold text-[#149D8E] hover:underline"
                >
                  Borrower Code of Conduct
                </Link>
                . I confirm I am 18+ and a resident of Uganda.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2BB5A0] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#239E8C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Creating account..." : "Continue to Verification"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold text-[#149D8E] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
