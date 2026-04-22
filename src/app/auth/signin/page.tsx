"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "@/hooks/use-auth";
import { signInSchema, type SignInFormData } from "@/lib/schemas";
import { PhoneOtpSigninModal } from "@/components/phone-otp-signin-modal";

export default function SignInPage() {
  const { mutate: signIn, isPending } = useSignIn();
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: true },
  });

  const onSubmit = (data: SignInFormData) => signIn(data);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col p-4">
      {/* Back to home */}
      <div className="w-full max-w-md mx-auto pt-4 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2B3A] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm w-full max-w-md p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#2BB5A0] flex items-center justify-center font-extrabold text-white text-xl">
              L
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#1B2B3A]">WeLend</p>
              <p className="text-xs text-gray-400">Borrower Portal</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1B2B3A] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to borrow from Uganda&apos;s loan marketplace
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#2BB5A0] focus-within:border-[#2BB5A0]">
                <span className="px-4 py-3 bg-[#2BB5A0]/10 text-[#2BB5A0] text-sm font-semibold border-r border-gray-200">
                  +256
                </span>
                <input
                  type="text"
                  placeholder="700 000 000"
                  className="flex-1 px-4 py-3 text-sm text-[#1B2B3A] outline-none bg-white"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password?from=borrower"
                  className="text-[#2BB5A0] text-xs font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-[#1B2B3A] outline-none focus:ring-2 focus:ring-[#2BB5A0] focus:border-[#2BB5A0]"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#2BB5A0] hover:bg-[#239E8C] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#2BB5A0] font-semibold hover:underline"
            >
              Register
            </Link>
          </p>

          <PhoneOtpSigninModal
            open={otpModalOpen}
            onClose={() => setOtpModalOpen(false)}
            portal="borrower"
          />
        </div>
      </div>
    </div>
  );
}
