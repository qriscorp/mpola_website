"use client";

import { BorrowerPageHeader } from "@/components/top-nav";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Profile & KYC" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-2xl sm:text-3xl leading-tight font-black text-[#1B2B3A] mb-5">
            Personal Information
          </h2>

          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-[#2BB5A0] flex items-center justify-center font-bold text-white text-xl">
              AK
            </div>
            <div>
              <p className="text-2xl sm:text-4xl leading-tight font-black text-[#1B2B3A]">
                Agnes Kyomuhendo
              </p>
              <p className="text-sm text-gray-400">Borrower since Feb 2024</p>
            </div>
            <button className="ml-auto px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors">
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: "Agnes Kyomuhendo" },
              { label: "Phone", value: "+256 700 123 456" },
              { label: "Email", value: "agnes@example.com" },
              { label: "NIN", value: "CF12345678" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {field.label}
                </label>
                <input
                  defaultValue={field.value}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-[#1B2B3A] outline-none"
                />
              </div>
            ))}
          </div>

          <button className="mt-5 px-5 py-2.5 rounded-xl bg-[#2BB5A0] text-white text-sm font-semibold hover:bg-[#239E8C] transition-colors">
            Save Changes
          </button>
        </div>

        {/* KYC Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 self-start">
          <h2 className="text-2xl sm:text-3xl leading-tight font-black text-[#1B2B3A] mb-5">
            KYC Status
          </h2>
          <div className="space-y-4">
            {[
              { label: "National ID", status: "Verified" },
              { label: "Phone Number", status: "Verified" },
              { label: "Bank Statement", status: "Pending" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-[#1B2B3A]">{item.label}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "Verified"
                      ? "bg-teal-50 text-[#2BB5A0]"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
