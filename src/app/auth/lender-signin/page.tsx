"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLenderSignIn } from "@/hooks/use-auth";
import { signInSchema, type SignInFormData } from "@/lib/schemas";

export default function LenderSignInPage() {
  const { mutate: signIn, isPending } = useLenderSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = (data: SignInFormData) =>
    signIn({ phoneOrEmail: data.phoneOrEmail, password: data.password });

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
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#C4A55A] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <p className="font-bold text-[#1B2B3A] text-xl leading-none">
                Mpola
              </p>
              <p className="text-gray-400 text-sm mt-0.5">Lender Portal</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-[#1B2B3A] mb-1">
            Welcome back
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your lender account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone number */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center px-4 rounded-lg bg-[#FFF8EC] border border-[#E8D5A3] text-[#C4A55A] font-semibold text-sm shrink-0 h-12">
                  +256
                </div>
                <input
                  id="phoneOrEmail"
                  placeholder="700 000 000"
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 text-[#1B2B3A] text-sm placeholder:text-gray-400 outline-none focus:border-[#C4A55A] focus:ring-2 focus:ring-[#C4A55A]/20 transition-colors"
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 text-[#1B2B3A] text-sm placeholder:text-gray-400 outline-none focus:border-[#C4A55A] focus:ring-2 focus:ring-[#C4A55A]/20 transition-colors"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password?from=lender"
                className="text-sm text-[#C4A55A] font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-[#C4A55A] hover:bg-[#b3944a] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/lender-register"
              className="text-[#C4A55A] font-semibold hover:underline"
            >
              Register as Lender
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
