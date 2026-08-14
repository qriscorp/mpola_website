"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import Link from "next/link";
import { useUser, useUpdateProfile, useSignLenderAgreement } from "@/hooks/use-dashboard";
import { getInitials } from "@/lib/format";
import { KYCUploadSection } from "@/components/kyc-upload-section";

const licenceStatusBadge: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  not_issued: {
    label: "Not Yet Issued",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  expired: {
    label: "Expired",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

export default function LenderAccountPage() {
  const { data: user, isLoading, error } = useUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const signAgreement = useSignLenderAgreement();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", nin: "" });
  const [agreeChecked, setAgreeChecked] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName, nin: user.nin });
    }
  }, [user]);

  if (error) {
    return (
      <div className="space-y-6">
        <LenderPageHeader title="Account & Licence" />
        <p className="text-sm text-gray-500">
          Couldn&apos;t load your account. Please try again.
        </p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <LenderPageHeader title="Account & Licence" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  const licenceStatus = user.licenceStatus ?? "not_issued";
  const badge = licenceStatusBadge[licenceStatus] ?? licenceStatusBadge.not_issued;
  const canSign = user.kycStatus === "verified";

  function handleSave() {
    updateProfile(form, { onSuccess: () => setEditing(false) });
  }

  function handleSignAgreement() {
    if (!agreeChecked) return;
    signAgreement.mutate(undefined, { onSuccess: () => setAgreeChecked(false) });
  }

  return (
    <div className="space-y-6">
      <LenderPageHeader title="Account & Licence" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#C4A55A] text-white text-xl font-bold">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-[#1B2B3A] dark:text-white text-lg">
                {user.fullName}
              </h2>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="ml-auto px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phone
              </Label>
              <Input value={user.phone} disabled title="Phone number can't be changed — it's used for verification" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </Label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                NIN
              </Label>
              <Input
                value={form.nin}
                onChange={(e) => setForm({ ...form, nin: e.target.value })}
                disabled={!editing}
              />
            </div>
          </div>
          {editing && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="w-full py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>

        {/* Licence card */}
        <div className="rounded-xl border-2 border-[#C4A55A] bg-[#1B2B3A] text-white p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#C4A55A] flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg leading-tight">
                Mpola Lender Licence
              </h2>
              <p className="text-sm text-white/50 mt-0.5">
                {licenceStatus === "active"
                  ? "Issued under Mpola's licensing framework"
                  : licenceStatus === "expired"
                    ? "Expired — sign the agreement again to renew"
                    : canSign
                      ? "Sign the agreement below to issue your licence"
                      : "Issued once your KYC is verified"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Licence No.
              </p>
              <p className="font-bold text-white mt-0.5">
                {user.licenceNumber ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Valid Until
              </p>
              <p className="font-bold text-[#C4A55A] mt-0.5">
                {user.licenceValidUntil
                  ? new Date(user.licenceValidUntil).toLocaleDateString()
                  : "Not yet issued"}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Max Pool
              </p>
              <p className="font-bold text-white mt-0.5">—</p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Status
              </p>
              <div className="mt-0.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Sign / renew — only relevant once KYC is verified; the licence
              itself is gated on that (see repository/user_repo.py) so
              there's nothing to sign before then. */}
          {canSign && (licenceStatus === "not_issued" || licenceStatus === "expired") && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              <label className="flex items-start gap-2.5 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeChecked}
                  onChange={(e) => setAgreeChecked(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  I agree to the{" "}
                  <Link href="/platform-terms" target="_blank" className="text-[#C4A55A] underline">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-[#C4A55A] underline">
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link href="/lender-code-of-conduct" target="_blank" className="text-[#C4A55A] underline">
                    Lender Code of Conduct
                  </Link>
                  .
                </span>
              </label>
              <button
                onClick={handleSignAgreement}
                disabled={!agreeChecked || signAgreement.isPending}
                className="w-full py-2 rounded-lg bg-[#C4A55A] text-[#1B2B3A] text-sm font-semibold hover:bg-[#d9bb6f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {signAgreement.isPending
                  ? "Signing…"
                  : licenceStatus === "expired"
                    ? "Sign & Renew Licence"
                    : "Sign Agreement"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KYC documents */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-bold text-[#1B2B3A] dark:text-white text-lg mb-1">
          KYC Documents
        </h2>
        {user.kycStatus !== "verified" && (
          <p className="text-xs text-gray-400 mb-2">
            Upload the documents below — an admin reviews them and you&apos;ll
            be notified once your account is verified.
          </p>
        )}
        <KYCUploadSection accent="gold" />
      </div>
    </div>
  );
}
