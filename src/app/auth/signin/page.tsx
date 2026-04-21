"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, ShieldCheck, Zap, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSignIn } from "@/hooks/use-auth";
import { signInSchema, type SignInFormData } from "@/lib/schemas";

export default function SignInPage() {
  const { mutate: signIn, isPending } = useSignIn();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: true },
  });

  const onSubmit = (data: SignInFormData) => signIn(data);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-1 bg-[#2BB5A0]" />
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className="lg:w-[45%] bg-[#E8F8F5] flex flex-col justify-between p-8 lg:p-16">
          <Logo />

          <div className="mt-12 lg:mt-0">
            <p className="text-[#2BB5A0] text-xs font-semibold uppercase tracking-wider mb-4">
              Welcome Back
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#1B2B3A] leading-tight">
              Fair credit,{" "}
              <span className="text-[#2BB5A0] italic">on your terms</span>.
            </h1>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Sign in to check your offers, track repayments, or start a new
              loan application.
            </p>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">BoU Licensed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4" />
                <span className="font-medium">256-bit encryption</span>
              </div>
            </div>
          </div>

          <p className="mt-8 lg:mt-0 text-xs text-gray-400">
            © 2026 Welend Uganda Ltd. · Tier IV Credit Licence #TCI-2024-0418
          </p>
        </div>

        {/* Right panel - Form */}
        <div className="lg:w-[55%] bg-white dark:bg-gray-950 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Choose a different portal
            </Link>

            <div className="inline-block border border-gray-200 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-6">
              Borrower Sign-In
            </div>

            <h2 className="text-3xl font-bold text-[#1B2B3A] mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Enter your phone or email and password to continue.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="phoneOrEmail">Phone number or email</Label>
                <div className="mt-1.5 relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                    +256
                  </span>
                  <Input
                    id="phoneOrEmail"
                    placeholder="772 843 901 or email"
                    className="rounded-l-none"
                    aria-invalid={!!errors.phoneOrEmail}
                    {...register("phoneOrEmail")}
                  />
                </div>
                {errors.phoneOrEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneOrEmail.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[#2BB5A0] text-xs font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="mt-1.5"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={watch("rememberMe")}
                  onCheckedChange={(checked) =>
                    setValue("rememberMe", !!checked)
                  }
                  className="data-[state=checked]:bg-[#2BB5A0] data-[state=checked]:border-[#2BB5A0]"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal text-gray-600"
                >
                  Keep me signed in on this device
                </Label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#2BB5A0] text-white py-3 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-[#239E8C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Signing in..." : "Sign in"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-gray-400 uppercase">
                  or
                </span>
              </div>
            </div>

            <Link
              href="/auth/verify"
              className="w-full border border-gray-200 dark:border-gray-700 py-3 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Phone className="w-4 h-4" /> Sign in with OTP (SMS)
            </Link>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to Welend?{" "}
              <Link
                href="/auth/register"
                className="text-[#2BB5A0] font-medium inline-flex items-center gap-1 hover:underline"
              >
                Create an account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
