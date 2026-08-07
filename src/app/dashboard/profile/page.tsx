"use client";

import { useEffect, useState } from "react";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useUser, useUpdateProfile } from "@/hooks/use-dashboard";
import { getInitials } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { KYCUploadSection } from "@/components/kyc-upload-section";

const kycBadge: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-teal-50 text-[#2BB5A0]" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600" },
};

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", nin: "" });

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName, phone: user.phone, nin: user.nin });
    }
  }, [user]);

  if (error) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Profile & KYC" />
        <p className="text-sm text-gray-500">
          Couldn&apos;t load your profile. Please try again.
        </p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Profile & KYC" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  const badge = kycBadge[user.kycStatus] ?? kycBadge.pending;

  function handleSave() {
    updateProfile(form, { onSuccess: () => setEditing(false) });
  }

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Profile & KYC" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl sm:text-2xl leading-tight font-black text-[#1B2B3A] mb-5">
            Personal Information
          </h2>

          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2BB5A0] flex items-center justify-center font-bold text-white text-xl">
              {getInitials(user.fullName)}
            </div>
            <div>
              <p className="text-xl sm:text-2xl leading-tight font-black text-[#1B2B3A]">
                {user.fullName}
              </p>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="ml-auto px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Full Name
              </label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                readOnly={!editing}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-[#1B2B3A] outline-none disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                readOnly={!editing}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-[#1B2B3A] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Email
              </label>
              <input
                value={user.email}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-[#1B2B3A] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                NIN
              </label>
              <input
                value={form.nin}
                onChange={(e) => setForm({ ...form, nin: e.target.value })}
                readOnly={!editing}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-[#1B2B3A] outline-none"
              />
            </div>
          </div>

          {editing && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>

        {/* KYC Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 self-start">
          <h2 className="text-xl sm:text-2xl leading-tight font-black text-[#1B2B3A] mb-5">
            KYC Status
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#1B2B3A]">Identity Verification</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
          {user.kycStatus !== "verified" && (
            <p className="mt-3 text-xs text-gray-400">
              Upload the documents below — an admin reviews them and you&apos;ll
              be notified once your account is verified.
            </p>
          )}
          <div className="mt-4">
            <KYCUploadSection accent="teal" />
          </div>
        </div>
      </div>
    </div>
  );
}
