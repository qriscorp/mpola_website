"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LenderPageHeader } from "@/components/lender-top-nav";
import { CardSkeleton } from "@/components/skeletons";
import { useUser, useUpdateProfile } from "@/hooks/use-dashboard";

function Toggle({
  label,
  description,
  defaultOn = true,
  on,
  onToggle,
}: {
  label: string;
  description?: string;
  defaultOn?: boolean;
  on?: boolean;
  onToggle?: () => void;
}) {
  const [localOn, setLocalOn] = useState(defaultOn);
  const isControlled = on !== undefined;
  const isOn = isControlled ? on : localOn;
  const handleClick = isControlled ? onToggle : () => setLocalOn(!localOn);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={handleClick}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none ${
          isOn ? "bg-[#C4A55A]" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isOn ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function LenderSettingsPage() {
  const { data: user, isLoading, error } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl">
        <LenderPageHeader title="Settings" />
        <p className="text-sm text-gray-500">
          Couldn&apos;t load your settings. Please try again.
        </p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6 max-w-3xl">
        <LenderPageHeader title="Settings" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <LenderPageHeader title="Settings" />

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-1">
          Notifications
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Choose which alerts you want to receive — saved to this device only
          for now.
        </p>
        <Toggle
          label="New Application Alerts"
          description="When a borrower applies to your offer"
        />
        <Toggle
          label="Repayment Received"
          description="When a borrower makes a payment"
        />
        <Toggle
          label="Overdue Loan Alerts"
          description="When a repayment is missed"
        />
        <Toggle
          label="Weekly Portfolio Digest"
          description="Summary email every Monday"
          defaultOn={false}
        />
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
        <h3 className="font-semibold text-[#1B2B3A] dark:text-white mb-1">
          Security
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Account protection settings
        </p>
        <Toggle
          label="Two-Factor Authentication"
          description="Require OTP on each sign-in"
          on={!!user.twoFactorEnabled}
          onToggle={() =>
            updateProfile({ twoFactorEnabled: !user.twoFactorEnabled })
          }
        />
        <Toggle
          label="Login Notifications"
          description="Get alerted when someone logs in to your account"
        />
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900 p-5 sm:p-6">
        <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => toast.info("Account deactivation isn't available yet — contact support.")}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Deactivate Account
          </button>
          <button
            onClick={() => toast.info("Data export isn't available yet — contact support.")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:border-gray-400 transition-colors"
          >
            Export My Data
          </button>
        </div>
      </div>
    </div>
  );
}
