"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useUser, useUpdateProfile } from "@/hooks/use-dashboard";
import { getInitials } from "@/lib/format";

const statusBadge: Record<string, { label: string; className: string }> = {
  verified: {
    label: "Active",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  pending: {
    label: "Pending Review",
    className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

export default function LenderAccountPage() {
  const { data: user, isLoading } = useUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", nin: "" });

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName, phone: user.phone, nin: user.nin });
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="space-y-6 max-w-5xl">
        <LenderPageHeader title="Account & Licence" />
        <CardSkeleton count={2} />
      </div>
    );
  }

  const badge = statusBadge[user.kycStatus] ?? statusBadge.pending;

  function handleSave() {
    updateProfile(form, { onSuccess: () => setEditing(false) });
  }

  return (
    <div className="space-y-6 max-w-5xl">
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
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
              />
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
                Pending Mpola&apos;s licensing framework
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Licence No.
              </p>
              <p className="font-bold text-white mt-0.5">
                LND-{user.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Valid Until
              </p>
              <p className="font-bold text-[#C4A55A] mt-0.5">
                Not yet issued
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
        </div>
      </div>
    </div>
  );
}
