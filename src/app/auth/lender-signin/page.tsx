"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, ShieldCheck, Zap, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function LenderSignInPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success("Signed in successfully!");
      router.push("/lender");
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-1 bg-[#2BB5A0]" />
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel — Navy (matches PDF p2) */}
        <div className="lg:w-[45%] bg-[#1B2B3A] text-white flex flex-col justify-between p-8 lg:p-16">
          <Logo variant="light" />

          <div className="mt-12 lg:mt-0">
            <p className="text-[#C4A55A] text-xs font-semibold uppercase tracking-wider mb-4">
              Welcome Back
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Your capital,{" "}
              <span className="text-[#C4A55A] italic">at work</span>.
            </h1>
            <p className="mt-6 text-gray-300 leading-relaxed">
              Sign in to manage your portfolio, review new applications, and
              track returns across your active loans.
            </p>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">BoU Licensed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className="w-4 h-4" />
                <span className="font-medium">256-bit encryption</span>
              </div>
            </div>
          </div>

          <p className="mt-8 lg:mt-0 text-xs text-gray-500">
            © 2026 LendFlow Uganda Ltd. · Tier IV Credit Licence #TCI-2024-0418
          </p>
        </div>

        {/* Right panel — Form (matches PDF p2) */}
        <div className="lg:w-[55%] bg-white dark:bg-gray-950 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Choose a different portal
            </Link>

            <div className="inline-block border border-gray-200 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-6">
              Lender Sign-In
            </div>

            <h2 className="text-3xl font-bold text-[#1B2B3A] dark:text-white mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Enter your phone or email and password to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="phoneOrEmail">Phone number or email</Label>
                <div className="mt-1.5 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                    🇺🇬
                  </span>
                  <Input
                    id="phoneOrEmail"
                    placeholder="+256772 100 842"
                    className="pl-10"
                  />
                </div>
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
                  placeholder="••••••••••"
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  defaultChecked
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
                className="w-full bg-[#C4A55A] text-white py-3 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-[#b3944a] transition-colors disabled:opacity-50"
              >
                {isPending ? "Signing in…" : "Sign in"}{" "}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-gray-950 px-4 text-xs text-gray-400 uppercase">
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
              New to LendFlow?{" "}
              <Link
                href="/auth/lender-register"
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
