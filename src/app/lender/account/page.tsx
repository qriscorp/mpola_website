"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LenderPageHeader } from "@/components/lender-top-nav";

export default function LenderAccountPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <LenderPageHeader title="Account & Licence" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#C4A55A] text-white text-xl font-bold">
                JM
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-[#1B2B3A] dark:text-white text-lg">
                James Mugisha
              </h2>
              <p className="text-xs text-gray-400">Licensed since Jan 2023</p>
            </div>
            <button className="ml-auto px-4 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:border-[#C4A55A] hover:text-[#C4A55A] transition-colors">
              Edit Profile
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Full Name", value: "James Mugisha" },
              { label: "Phone", value: "+256 772 100 842" },
              { label: "Email", value: "james@mugisha-capital.ug" },
              { label: "NIN", value: "CM98041234AB7X", disabled: true },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {f.label}
                </Label>
                <Input defaultValue={f.value} disabled={f.disabled} />
              </div>
            ))}
          </div>
          <button className="w-full py-2 rounded-lg bg-[#C4A55A] text-white text-sm font-semibold hover:bg-[#b3944a] transition-colors">
            Save Changes
          </button>
        </div>

        {/* Licence card */}
        <div className="rounded-xl border-2 border-[#C4A55A] bg-[#1B2B3A] text-white p-6 space-y-5">
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              WeLend Lender Licence
            </p>
            <h2 className="text-xl font-bold mt-1">Bank of Uganda Framework</h2>
            <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
              Active
            </span>
          </div>
          <div className="space-y-3 text-sm">
            {[
              ["Licence No", "#TCI-2024-0418"],
              [
                "Valid Until",
                <span key="vu" className="text-[#C4A55A] font-bold">
                  31 Dec 2025
                </span>,
              ],
              ["Max Loan Pool", "UGX 500M"],
              ["Tier", "Tier IV Credit Institution"],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <span className="text-white/50">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
