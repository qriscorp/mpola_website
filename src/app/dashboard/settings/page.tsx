"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BorrowerPageHeader } from "@/components/top-nav";
import { useUser, useUpdateProfile, useChangePassword, useExportMyData } from "@/hooks/use-dashboard";
import { CardSkeleton } from "@/components/skeletons";
import { SessionsSection } from "@/components/sessions-section";
import { DeactivateAccountDialog } from "@/components/deactivate-account-dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { downloadJsonFile } from "@/lib/format";
import { passwordRequirementErrors, PASSWORD_REQUIREMENTS_HINT } from "@/lib/password";

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

export default function SettingsPage() {
  const { data: user, isLoading, error } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const changePassword = useChangePassword();
  const exportData = useExportMyData();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeactivate, setShowDeactivate] = useState(false);

  function handleChangePassword() {
    const errors = passwordRequirementErrors(newPassword);
    if (errors.length) {
      toast.error(`New password needs: ${errors.join(", ").toLowerCase()}`);
      return;
    }
    changePassword.mutate(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          setOldPassword("");
          setNewPassword("");
        },
      },
    );
  }

  function handleExport() {
    exportData.mutate(undefined, {
      onSuccess: (data) => downloadJsonFile(data, `mpola-my-data-${new Date().toISOString().slice(0, 10)}.json`),
    });
  }

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
          Choose which alerts you want to receive.
        </p>
        <div className="space-y-5 divide-y divide-gray-100 dark:divide-gray-800">
          <div className="flex items-center justify-between pt-0">
            <div>
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                New Lender Offer
              </p>
              <p className="text-xs text-gray-400">When a lender responds to your request</p>
            </div>
            <Toggle
              on={user.notifOfferReceived ?? true}
              onChange={() => updateProfile({ notifOfferReceived: !user.notifOfferReceived })}
            />
          </div>
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                Payment Reminders
              </p>
              <p className="text-xs text-gray-400">A few days before each instalment</p>
            </div>
            <Toggle
              on={user.notifPaymentReminder ?? true}
              onChange={() => updateProfile({ notifPaymentReminder: !user.notifPaymentReminder })}
            />
          </div>
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                Application Status
              </p>
              <p className="text-xs text-gray-400">When your loan request expires or changes status</p>
            </div>
            <Toggle
              on={user.notifApplicationStatus ?? true}
              onChange={() => updateProfile({ notifApplicationStatus: !user.notifApplicationStatus })}
            />
          </div>
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
              on={user.notifLoginAlerts ?? true}
              onChange={() => updateProfile({ notifLoginAlerts: !user.notifLoginAlerts })}
            />
          </div>
          <div className="pt-5">
            <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white mb-3">
              Change Password
            </p>
            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              <PasswordInput
                placeholder="Current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <PasswordInput
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-400 mb-3">{PASSWORD_REQUIREMENTS_HINT}</p>
            <button
              onClick={handleChangePassword}
              disabled={changePassword.isPending || !oldPassword || !newPassword}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold text-[#1B2B3A] dark:text-white hover:border-[#2BB5A0] transition-colors disabled:opacity-50"
            >
              {changePassword.isPending ? "Changing…" : "Change Password"}
            </button>
          </div>
        </div>
      </div>

      <SessionsSection />

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-red-200 dark:border-red-900 p-6">
        <h2 className="text-lg font-bold text-red-500 dark:text-red-400 mb-4">Danger Zone</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowDeactivate(true)}
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Deactivate Account
          </button>
          <button
            onClick={handleExport}
            disabled={exportData.isPending}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:border-gray-400 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 disabled:opacity-50"
          >
            {exportData.isPending ? "Preparing…" : "Export My Data"}
          </button>
        </div>
      </div>

      <DeactivateAccountDialog open={showDeactivate} onOpenChange={setShowDeactivate} />
    </div>
  );
}
