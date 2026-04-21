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
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-[#2BB5A0]" />

      {/* Top */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Link
          href="/auth/signin"
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Progress bar */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 h-1 rounded-full bg-[#2BB5A0]" />
            <div className="flex-1 h-1 rounded-full bg-gray-200" />
            <div className="flex-1 h-1 rounded-full bg-gray-200" />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Step 1 of 3
          </p>
          <h2 className="text-2xl font-bold text-[#1B2B3A] mb-1">
            Create your borrower account
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            We&apos;ll verify your identity in the next step.
          </p>

          {/* Account type toggle */}
          <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden mb-6">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                accountType === "individual"
                  ? "bg-[#1B2B3A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setAccountType("individual")}
            >
              Individual
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                accountType === "business"
                  ? "bg-[#1B2B3A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
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
                <p className="text-red-500 text-xs mt-1">
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
                    placeholder="e.g. Nakato Hair Studio"
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.nin.message}
                </p>
              )}
            </div>

            <div>
              <Label>Phone Number</Label>
              <div className="mt-1.5 flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                  🇺🇬 +256
                </span>
                <Input
                  placeholder="772 000 000"
                  className="rounded-l-none"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email Address</Label>
              <div className="mt-1.5 relative">
                <Input
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2BB5A0]" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-red-500 text-xs mt-1">
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={watch("agreeToTerms") as boolean}
                onCheckedChange={(checked) =>
                  setValue("agreeToTerms" as never, !!checked as never)
                }
                className="mt-0.5 data-[state=checked]:bg-[#2BB5A0] data-[state=checked]:border-[#2BB5A0]"
              />
              <Label
                htmlFor="terms"
                className="text-xs font-normal text-gray-600 leading-relaxed"
              >
                I agree to the{" "}
                <Link href="#" className="text-[#2BB5A0] hover:underline">
                  Platform Terms
                </Link>
                ,{" "}
                <Link href="#" className="text-[#2BB5A0] hover:underline">
                  Privacy Policy
                </Link>
                , and{" "}
                <Link href="#" className="text-[#2BB5A0] hover:underline">
                  Borrower Code of Conduct
                </Link>
                . I confirm I am 18+ and a resident of Uganda.
              </Label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-[#239E8C] transition-colors disabled:opacity-50 mt-4"
            >
              {isPending ? "Creating account..." : "Continue to Verification"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-[#2BB5A0] font-medium inline-flex items-center gap-1 hover:underline"
            >
              Sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
