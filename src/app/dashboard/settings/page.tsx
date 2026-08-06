"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useUser, useUpdateProfile } from "@/hooks/use-dashboard";
import { CardSkeleton } from "@/components/skeletons";
import { SessionsSection } from "@/components/sessions-section";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? "bg-[#2BB5A0]" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

const notificationItems = [
  {
    id: "new_offer",
    label: "New Lender Offer",
    desc: "When a lender responds to your request",
    defaultOn: true,
  },
  {
    id: "payment_reminder",
    label: "Payment Reminders",
    desc: "3 days before each instalment",
    defaultOn: true,
  },
  {
    id: "app_status",
    label: "Application Status",
    desc: "When lender approves or declines",
    defaultOn: true,
  },
  { id: "marketing", label: "Marketing Emails", desc: "", defaultOn: false },
];

export default function SettingsPage() {
  const { data: user, isLoading, error } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();

  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = { login_notif: true };
    notificationItems.forEach((i) => {
      init[i.id] = i.defaultOn;
    });
    return init;
  });

  const toggle = (id: string) =>
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));

  if (error) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Settings" />
        <p className="text-sm text-gray-500">
          Couldn&apos;t load your settings. Please try again.
        </p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <BorrowerPageHeader title="Settings" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BorrowerPageHeader title="Settings" />

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white mb-1">
          Notifications
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Saved to this device only for now.
        </p>
        <div className="space-y-5 divide-y divide-gray-100 dark:divide-gray-800">
          {notificationItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between pt-5 first:pt-0"
            >
              <div>
                <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                  {item.label}
                </p>
                {item.desc && (
                  <p className="text-xs text-gray-400">{item.desc}</p>
                )}
              </div>
              <Toggle on={toggles[item.id]} onChange={() => toggle(item.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white mb-5">
          Security
        </h2>
        <div className="space-y-5 divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-center justify-between pt-0">
            <div>
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-gray-400">SMS code on login</p>
            </div>
            <Toggle
              on={!!user.twoFactorEnabled}
              onChange={() =>
                updateProfile({ twoFactorEnabled: !user.twoFactorEnabled })
              }
            />
          </div>
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                Login Notifications
              </p>
              <p className="text-xs text-gray-400">Alert on new device login</p>
            </div>
            <Toggle
              on={toggles.login_notif}
              onChange={() => toggle("login_notif")}
            />
          </div>
        </div>
      </div>

      <SessionsSection />

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 p-6">
        <h2 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toast.info("Account deactivation isn't available yet — contact support.")}
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Deactivate Account
          </button>
          <button
            onClick={() => toast.info("Data export isn't available yet — contact support.")}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:border-gray-400 transition-colors"
          >
            Export My Data
          </button>
        </div>
      </div>
    </div>
  );
}
