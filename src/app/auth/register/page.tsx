"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks/use-auth";
import { api, type SignupDraftPayload } from "@/lib/api";
import {
  registerIndividualSchema,
  registerBusinessSchema,
  type RegisterIndividualFormData,
  type RegisterBusinessFormData,
} from "@/lib/schemas";

type AccountType = "individual" | "business";

function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

function clearSignupDraftCookies() {
  document.cookie = "lf_signup_flow=; path=/; max-age=0";
  document.cookie = "lf_signup_draft=; path=/; max-age=0";
  document.cookie = "lf_signup_role=; path=/; max-age=0";
  document.cookie = "lf_signup_email=; path=/; max-age=0";
  document.cookie = "lf_signup_phone=; path=/; max-age=0";
  document.cookie = "lf_signup_email_verified=; path=/; max-age=0";
  document.cookie = "lf_signup_phone_verified=; path=/; max-age=0";
  document.cookie = "lf_signup_account_type=; path=/; max-age=0";
  document.cookie = "lf_signup_full_name=; path=/; max-age=0";
  document.cookie = "lf_signup_nin=; path=/; max-age=0";
  document.cookie = "lf_signup_business_name=; path=/; max-age=0";
  document.cookie = "lf_signup_registration_number=; path=/; max-age=0";
  document.cookie = "lf_signup_form_draft=; path=/; max-age=0";
}

function getSignupDraftResumeRoute(draft?: SignupDraftPayload) {
  if (draft?.next_step === "verify_phone") {
    return {
      href: "/auth/verify-phone",
      label: "Continue phone verification",
    };
  }

  if (draft?.next_step === "verify_email") {
    return {
      href: "/auth/verify-email",
      label: "Continue email verification",
    };
  }

  if (draft?.email_verified === true && draft?.phone_verified !== true) {
    return {
      href: "/auth/verify-phone",
      label: "Continue phone verification",
    };
  }

  if (draft?.is_completed) {
    return {
      href: draft.role === "lender" ? "/auth/lender-signin" : "/auth/signin",
      label: "Sign in",
    };
  }

  const emailVerified = getCookie("lf_signup_email_verified") === "true";
  const phoneVerified = getCookie("lf_signup_phone_verified") === "true";

  if (!emailVerified) {
    return {
      href: "/auth/verify-email",
      label: "Continue email verification",
    };
  }

  if (!phoneVerified) {
    return {
      href: "/auth/verify-phone",
      label: "Continue phone verification",
    };
  }

  // Defensive default: keep active signup users in email verification path.
  return {
    href: "/auth/verify-email",
    label: "Continue email verification",
  };
}

function readSignupFormDraftCookie(): Record<string, unknown> | null {
  const raw = getCookie("lf_signup_form_draft");
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function writeSignupFormDraftCookie(data: Record<string, unknown>) {
  const maxAge = 24 * 60 * 60;
  document.cookie = `lf_signup_form_draft=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function hasMeaningfulLocalDraft(
  data: Record<string, unknown> | null,
): boolean {
  if (!data) return false;
  return Boolean(
    data.fullName ||
    data.nin ||
    data.phone ||
    data.email ||
    data.password ||
    data.confirmPassword ||
    data.businessName ||
    data.registrationNumber,
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<"borrower" | "lender">("borrower");
  const [referralCode, setReferralCode] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("portal") === "lender") {
      setPortal("lender");
    }
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref.trim());
    }
  }, []);
  const isLender = portal === "lender";
  const accentBgClass = isLender ? "bg-[#C4A55A]" : "bg-[#2BB5A0]";
  const accentHoverBgClass = isLender
    ? "hover:bg-[#b3944a]"
    : "hover:bg-[#239E8C]";
  const accentTextClass = isLender ? "text-[#C4A55A]" : "text-[#149D8E] dark:text-[#5EEAD4]";
  const accentSoftBgClass = isLender ? "bg-[#FFF8EC] dark:bg-[#C4A55A]/10" : "bg-[#F2FBF9] dark:bg-[#2BB5A0]/10";
  const accentSoftBorderClass = isLender
    ? "border-[#E8D5A3] dark:border-[#C4A55A]/30"
    : "border-[#D5ECE8] dark:border-[#2BB5A0]/30";
  const accentPrefixBgClass = isLender ? "bg-[#FFF8EC] dark:bg-[#C4A55A]/10" : "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10";
  const accentPrefixTextClass = isLender ? "text-[#C4A55A]" : "text-[#149D8E] dark:text-[#5EEAD4]";
  // Solid dark-gray to match the form card's own dark treatment exactly
  // (not just a translucent brand tint) — keeps both halves of the split
  // layout reading as the same "depth" once the page itself goes dark.
  const accentAsideClass = isLender
    ? "border-[#E8D5A3] bg-[#FFF8EC] dark:border-[#C4A55A]/40 dark:bg-gray-900"
    : "border-[#CBEAE4] bg-[#E8F8F5] dark:border-[#2BB5A0]/40 dark:bg-gray-900";
  const accentCheckboxClass = isLender
    ? "data-[state=checked]:border-[#C4A55A] data-[state=checked]:bg-[#C4A55A]"
    : "data-[state=checked]:border-[#2BB5A0] data-[state=checked]:bg-[#2BB5A0]";
  const signInHref = isLender ? "/auth/lender-signin" : "/auth/signin";
  const [hasDraft, setHasDraft] = useState(false);
  const [draftEmail, setDraftEmail] = useState("");
  const [resumeHref, setResumeHref] = useState("/auth/verify-email");
  const [resumeLabel, setResumeLabel] = useState("Continue email verification");
  const [isResolvingResume, setIsResolvingResume] = useState(false);
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

  useEffect(() => {
    const draftId = getCookie("lf_signup_draft") || "";
    const draftRole = getCookie("lf_signup_role") || "borrower";
    if (!draftId || draftRole !== portal) {
      setHasDraft(false);
      const localDraft = readSignupFormDraftCookie();
      if (localDraft?.role === portal && hasMeaningfulLocalDraft(localDraft)) {
        const localAccountType =
          localDraft.accountType === "business" ? "business" : "individual";
        setAccountType(localAccountType);
        if (localAccountType === "business") {
          businessForm.setValue("accountType", "business");
        } else {
          individualForm.setValue("accountType", "individual");
        }

        const fullName = String(localDraft.fullName || "");
        const nin = String(localDraft.nin || "");
        const phone = String(localDraft.phone || "");
        const email = String(localDraft.email || "");
        const password = String(localDraft.password || "");
        const confirmPassword = String(localDraft.confirmPassword || "");
        const businessName = String(localDraft.businessName || "");
        const registrationNumber = String(localDraft.registrationNumber || "");
        const agreeToTerms = localDraft.agreeToTerms !== false;

        individualForm.setValue("fullName", fullName);
        individualForm.setValue("nin", nin);
        individualForm.setValue("phone", phone);
        individualForm.setValue("email", email);
        individualForm.setValue("password", password);
        individualForm.setValue("confirmPassword", confirmPassword);
        individualForm.setValue("agreeToTerms", agreeToTerms as true);

        businessForm.setValue("fullName", fullName);
        businessForm.setValue("nin", nin);
        businessForm.setValue("phone", phone);
        businessForm.setValue("email", email);
        businessForm.setValue("password", password);
        businessForm.setValue("confirmPassword", confirmPassword);
        businessForm.setValue("businessName", businessName);
        businessForm.setValue("registrationNumber", registrationNumber);
        businessForm.setValue("agreeToTerms", agreeToTerms as true);
      } else {
        document.cookie = "lf_signup_form_draft=; path=/; max-age=0";
      }
      return;
    }

    setHasDraft(true);
    setDraftEmail(decodeURIComponent(getCookie("lf_signup_email") || ""));

    const loadDraftStatus = async () => {
      try {
        const status = await api.getSignupDraftStatus(draftId);
        if (status.account_created || status.draft?.is_completed) {
          clearSignupDraftCookies();
          setHasDraft(false);
          return;
        }

        if (status.draft?.email) {
          setDraftEmail(status.draft.email);
        }

        const fromStatus = getSignupDraftResumeRoute(status.draft);
        setResumeHref(fromStatus.href);
        setResumeLabel(fromStatus.label);
      } catch {
        const fallback = getSignupDraftResumeRoute();
        if (fallback.href === "/auth/signin") {
          clearSignupDraftCookies();
          setHasDraft(false);
          return;
        }
        setResumeHref(fallback.href);
        setResumeLabel(fallback.label);
      }
    };

    void loadDraftStatus();

    const accountTypeCookie = getCookie("lf_signup_account_type");
    if (accountTypeCookie === "business") {
      setAccountType("business");
      businessForm.setValue("accountType", "business");
    } else {
      setAccountType("individual");
      individualForm.setValue("accountType", "individual");
    }

    const fullName = decodeURIComponent(getCookie("lf_signup_full_name") || "");
    const nin = decodeURIComponent(getCookie("lf_signup_nin") || "");
    const phone = (getCookie("lf_signup_phone") || "").replace(/^256/, "");
    const email = decodeURIComponent(getCookie("lf_signup_email") || "");
    const businessName = decodeURIComponent(
      getCookie("lf_signup_business_name") || "",
    );
    const registrationNumber = decodeURIComponent(
      getCookie("lf_signup_registration_number") || "",
    );

    if (fullName) {
      individualForm.setValue("fullName", fullName);
      businessForm.setValue("fullName", fullName);
    }
    if (nin) {
      individualForm.setValue("nin", nin);
      businessForm.setValue("nin", nin);
    }
    if (phone) {
      individualForm.setValue("phone", phone);
      businessForm.setValue("phone", phone);
    }
    if (email) {
      individualForm.setValue("email", email);
      businessForm.setValue("email", email);
    }
    if (businessName) {
      businessForm.setValue("businessName", businessName);
    }
    if (registrationNumber) {
      businessForm.setValue("registrationNumber", registrationNumber);
    }
  }, [portal, individualForm, businessForm]);

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

  const watchedFullName = String(watch("fullName") || "");
  const watchedNin = String(watch("nin") || "");
  const watchedPhone = String(watch("phone") || "");
  const watchedEmail = String(watch("email") || "");
  const watchedPassword = String(watch("password") || "");
  const watchedConfirmPassword = String(watch("confirmPassword") || "");
  const watchedAgreeToTerms = Boolean(watch("agreeToTerms"));
  const watchedBusinessName = String(watch("businessName" as never) || "");
  const watchedRegistrationNumber = String(
    watch("registrationNumber" as never) || "",
  );

  useEffect(() => {
    if (hasDraft) {
      return;
    }

    const hasAnyValue =
      !!watchedFullName ||
      !!watchedNin ||
      !!watchedPhone ||
      !!watchedEmail ||
      !!watchedPassword ||
      !!watchedConfirmPassword ||
      (accountType === "business" &&
        (!!watchedBusinessName || !!watchedRegistrationNumber));

    if (!hasAnyValue) {
      document.cookie = "lf_signup_form_draft=; path=/; max-age=0";
      return;
    }

    writeSignupFormDraftCookie({
      role: portal,
      accountType,
      fullName: watchedFullName,
      nin: watchedNin,
      phone: watchedPhone,
      email: watchedEmail,
      password: watchedPassword,
      confirmPassword: watchedConfirmPassword,
      agreeToTerms: watchedAgreeToTerms,
      businessName: watchedBusinessName,
      registrationNumber: watchedRegistrationNumber,
    });
  }, [
    hasDraft,
    portal,
    accountType,
    watchedFullName,
    watchedNin,
    watchedPhone,
    watchedEmail,
    watchedPassword,
    watchedConfirmPassword,
    watchedAgreeToTerms,
    watchedBusinessName,
    watchedRegistrationNumber,
  ]);

  const onSubmit = (
    data: RegisterIndividualFormData | RegisterBusinessFormData,
  ) => {
    registerUser({ ...data, role: portal, referredByCode: referralCode.trim() || undefined });
  };

  const handleResumeDraft = async () => {
    const draftId = getCookie("lf_signup_draft") || "";
    if (!draftId) {
      setHasDraft(false);
      return;
    }

    setIsResolvingResume(true);
    try {
      const status = await api.getSignupDraftStatus(draftId);
      if (status.account_created || status.draft?.is_completed) {
        clearSignupDraftCookies();
        setHasDraft(false);
        router.push(
          portal === "lender" ? "/auth/lender-signin" : "/auth/signin",
        );
        return;
      }

      const next = getSignupDraftResumeRoute(status.draft);
      setResumeHref(next.href);
      setResumeLabel(next.label);
      router.push(next.href);
    } catch {
      router.push(resumeHref);
    } finally {
      setIsResolvingResume(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#EEF8F6_0%,#F8FBFB_38%,#FFFFFF_100%)] dark:bg-none dark:bg-gray-950">
      <div className={`h-1 ${accentBgClass}`} />

      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <Link
          href={signInHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-[#1B2B3A] dark:hover:text-white dark:text-gray-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className={`rounded-2xl border p-6 sm:p-8 ${accentAsideClass}`}>
          <Logo asLink={false} />
          <p
            className={`mt-6 text-xs font-semibold uppercase tracking-wider ${accentTextClass}`}
          >
            {isLender ? "Lender Onboarding" : "Borrower Onboarding"}
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#1B2B3A] dark:text-white">
            {isLender
              ? "Create your lender account"
              : "Create your borrower account"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Complete registration in a few minutes and proceed to email and
            phone verification.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Step 1: Account details",
              "Step 2: Identity verification",
              "Step 3: Start your first request",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-[#1B2B3A] dark:text-white"
              >
                <span className={`h-2 w-2 rounded-full ${accentBgClass}`} />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <div className="mb-3 flex gap-2">
              <span className={`h-1.5 flex-1 rounded-full ${accentBgClass}`} />
              <span className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Step 1 of 3
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#1B2B3A] dark:text-white">
              Registration Details
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose your account type and fill in your legal information.
            </p>
          </div>

          <div className="mb-5 inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-800">
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                accountType === "individual"
                  ? `${accentBgClass} text-white`
                  : "text-gray-600 hover:text-[#1B2B3A] dark:hover:text-white dark:text-gray-300"
              }`}
              onClick={() => setAccountType("individual")}
            >
              Individual
            </button>
            <button
              type="button"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                accountType === "business"
                  ? `${accentBgClass} text-white`
                  : "text-gray-600 hover:text-[#1B2B3A] dark:hover:text-white dark:text-gray-300"
              }`}
              onClick={() => setAccountType("business")}
            >
              Business Owner
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {hasDraft && (
              <div
                className={`rounded-lg border p-3.5 ${accentSoftBorderClass} ${accentSoftBgClass}`}
              >
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Resume signup draft for{" "}
                  <span className="font-semibold text-[#1B2B3A] dark:text-white">
                    {draftEmail || "this account"}
                  </span>
                  .
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleResumeDraft();
                    }}
                    className={`text-xs font-semibold hover:underline ${accentTextClass}`}
                  >
                    {isResolvingResume ? "Checking status..." : resumeLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearSignupDraftCookies();
                      setHasDraft(false);
                    }}
                    className="text-xs font-semibold text-gray-500 hover:underline dark:text-gray-400"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}

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
                <span
                  className={`inline-flex items-center rounded-l-lg border border-r-0 border-input px-3 text-sm font-semibold ${accentPrefixBgClass} ${accentPrefixTextClass}`}
                >
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
                <Mail
                  className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${accentTextClass}`}
                />
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
                <PasswordInput
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
                <PasswordInput
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

            <div>
              <Label>Referral Code (optional)</Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. AB12CD3"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
              {referralCode && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Whoever invited you gets a UGX 20 bonus once you finish signing up.
                </p>
              )}
            </div>

            <div
              className={`flex items-start gap-2.5 rounded-lg border p-3.5 ${accentSoftBorderClass} ${accentSoftBgClass}`}
            >
              <Checkbox
                id="terms"
                checked={watch("agreeToTerms") as boolean}
                onCheckedChange={(checked) =>
                  setValue("agreeToTerms" as never, !!checked as never)
                }
                className={`mt-0.5 ${accentCheckboxClass}`}
              />
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                I agree to the{" "}
                <Link
                  href="/platform-terms"
                  className={`font-semibold hover:underline ${accentTextClass}`}
                >
                  Platform Terms
                </Link>
                ,{" "}
                <Link
                  href="/privacy-policy"
                  className={`font-semibold hover:underline ${accentTextClass}`}
                >
                  Privacy Policy
                </Link>
                , and{" "}
                <Link
                  href={
                    isLender
                      ? "/lender-code-of-conduct"
                      : "/borrower-code-of-conduct"
                  }
                  className={`font-semibold hover:underline ${accentTextClass}`}
                >
                  {isLender
                    ? "Lender Code of Conduct"
                    : "Borrower Code of Conduct"}
                </Link>
                . I confirm I am 18+ and a resident of Uganda.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${accentBgClass} ${accentHoverBgClass}`}
            >
              {isPending ? "Creating account..." : "Continue to Verification"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href={signInHref}
              className={`font-semibold hover:underline ${accentTextClass}`}
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
