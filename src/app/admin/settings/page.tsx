"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import {
  useAdminSettings,
  useUpdateAdminSetting,
  useOfferTemplatesForReview,
  useReviewOfferTemplate,
} from "@/hooks/use-admin";
import { useUser, useUpdateProfile } from "@/hooks/use-dashboard";
import { api } from "@/lib/api";
import { formatCurrency, formatRate } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { FadeSwap } from "@/components/motion/fade-swap";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-[#2BB5A0]" : "bg-gray-300 dark:bg-gray-700"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-4.5" : "translate-x-1"}`}
      />
    </button>
  );
}

// Overdue/default events aren't per-loan admin alerts — the lender on each
// loan is notified directly, and admins see the weekly totals instead (see
// notif_weekly_digest below) so a busy platform doesn't flood the admin team.
const NOTIFICATION_ITEMS = [
  { key: "notif_new_applications", label: "Notify admins of new applications" },
  { key: "notif_weekly_digest", label: "Weekly performance digest (includes overdue/default totals)" },
];

const DEFAULTS: Record<string, string> = {
  platform_name: "Mpola Uganda",
  support_email: "support@mpola.ug",
  licence_number: "",
  min_loan_amount: "500000",
  max_loan_amount: "100000000",
  max_interest_rate: "25",
  // These four map directly to the keys the collections engine (scheduler.py)
  // actually reads — see its module docstring for the exact semantics.
  reminder_days_before_due: "3",
  grace_period_days: "3",
  default_after_days: "60",
  late_fee_rate: "2", // stored as a fraction (0.02) — shown here as a percentage
};

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateAdminSetting();
  const { data: user } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const { data: pendingTemplates } = useOfferTemplatesForReview("pending_review");
  const reviewTemplate = useReviewOfferTemplate();

  const [form, setForm] = useState<Record<string, string>>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (settings) {
      const next = { ...DEFAULTS };
      for (const key of Object.keys(DEFAULTS)) {
        if (settings[key]) next[key] = settings[key].value;
      }
      // The collections engine stores late_fee_rate as a fraction (0.02) —
      // shown here as a percentage (2) for a human to actually read.
      if (settings.late_fee_rate) {
        next.late_fee_rate = String(parseFloat(settings.late_fee_rate.value) * 100);
      }
      setForm(next);
    }
  }, [settings]);

  const isNotifOn = (key: string) => (settings?.[key]?.value ?? "true") === "true";
  const isMaintenanceOn = (settings?.maintenance_mode?.value ?? "false") === "true";

  async function handleSaveAll() {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) =>
          api.updateAdminSetting(
            key,
            key === "late_fee_rate" ? String(Number(value) / 100) : value,
          ),
        ),
      );
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      toast.success("Password changed");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              Platform Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure Mpola platform settings
            </p>
          </div>
          <CardSkeleton count={4} height="h-48" />
        </div>
      }
    >
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
          Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure Mpola platform settings
        </p>
      </div>

      {/* General */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#2BB5A0]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              General
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Platform Name</Label>
              <Input
                value={form.platform_name}
                onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue="UGX" disabled />
            </div>
            <div className="space-y-2">
              <Label>Licence Number</Label>
              <Input
                value={form.licence_number}
                onChange={(e) => setForm({ ...form, licence_number: e.target.value })}
                placeholder="Not yet issued"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Configuration */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#C4A55A]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Loan Configuration
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Tightens what borrowers and lenders can submit platform-wide.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Loan Amount (UGX)</Label>
              <Input
                type="number"
                value={form.min_loan_amount}
                onChange={(e) => setForm({ ...form, min_loan_amount: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Loan Amount (UGX)</Label>
              <Input
                type="number"
                value={form.max_loan_amount}
                onChange={(e) => setForm({ ...form, max_loan_amount: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Interest Rate (% p.a.)</Label>
              <Input
                type="number"
                value={form.max_interest_rate}
                onChange={(e) => setForm({ ...form, max_interest_rate: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#C4A55A]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Collections
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Controls the daily job that sends payment reminders and moves
            loans through active → overdue → defaulted.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Payment Reminder (days before due)</Label>
              <Input
                type="number"
                value={form.reminder_days_before_due}
                onChange={(e) =>
                  setForm({ ...form, reminder_days_before_due: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Grace Period (days past due)</Label>
              <Input
                type="number"
                value={form.grace_period_days}
                onChange={(e) => setForm({ ...form, grace_period_days: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                A loan flips to &quot;overdue&quot; once it&apos;s this many days past
                its due date.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Default After (days overdue)</Label>
              <Input
                type="number"
                value={form.default_after_days}
                onChange={(e) => setForm({ ...form, default_after_days: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Late Fee (%)</Label>
              <Input
                type="number"
                value={form.late_fee_rate}
                onChange={(e) => setForm({ ...form, late_fee_rate: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                One-time fee added to the loan the moment it goes overdue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Notification Settings
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
            >
              <span className="text-sm">{item.label}</span>
              <Toggle
                on={isNotifOn(item.key)}
                onToggle={() =>
                  updateSetting.mutate({
                    key: item.key,
                    value: isNotifOn(item.key) ? "false" : "true",
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#2BB5A0]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Security
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleChangePassword}
            disabled={changingPassword || !oldPassword || !newPassword}
          >
            {changingPassword ? "Changing…" : "Change Password"}
          </Button>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-muted-foreground">
                Require OTP on each admin sign-in
              </p>
            </div>
            {user && (
              <Toggle
                on={!!user.twoFactorEnabled}
                onToggle={() =>
                  updateProfile({ twoFactorEnabled: !user.twoFactorEnabled })
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Standing Offers Review */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-[#C4A55A]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Standing Offers Awaiting Review
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Lenders submit these from &quot;Post an Offer&quot; — approve before they
            go live.
          </p>
        </CardHeader>
        <CardContent>
          {!pendingTemplates || pendingTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nothing waiting for review.
            </p>
          ) : (
            <StaggerList className="space-y-3">
              {pendingTemplates.map((t) => (
                <StaggerItem
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
                      {t.lender_name ?? "Unknown lender"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(t.min_amount)} – {formatCurrency(t.max_amount)} ·{" "}
                      {formatRate(t.interest_rate)} · Max {t.max_duration} months
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() =>
                        reviewTemplate.mutate(
                          { id: t.id, action: "approve" },
                          { onSuccess: () => toast.success("Offer approved") },
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        reviewTemplate.mutate(
                          { id: t.id, action: "reject" },
                          { onSuccess: () => toast.success("Offer rejected") },
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-red-600 dark:text-red-400">
              Danger Zone
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                Export All Data
              </p>
              <p className="text-xs text-muted-foreground">
                Download complete platform data as CSV
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Full data export isn't available yet")}
            >
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                Maintenance Mode
              </p>
              <p className="text-xs text-muted-foreground">
                Blocks borrower and lender sign-ins until you turn it off
              </p>
            </div>
            <Button
              variant={isMaintenanceOn ? "outline" : "destructive"}
              size="sm"
              onClick={() => {
                const next = !isMaintenanceOn;
                if (next && !confirm("Block all borrower and lender sign-ins now?")) {
                  return;
                }
                updateSetting.mutate(
                  { key: "maintenance_mode", value: next ? "true" : "false" },
                  {
                    onSuccess: () =>
                      toast.success(next ? "Maintenance mode enabled" : "Maintenance mode disabled"),
                  },
                );
              }}
            >
              {isMaintenanceOn ? "Disable" : "Enable"}
            </Button>
          </div>
          {isMaintenanceOn && (
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <Key className="h-3 w-3 mr-1" />
              Maintenance mode is currently active
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-[#2BB5A0] hover:bg-[#239E8C] text-white"
          onClick={handleSaveAll}
          disabled={saving || isLoading}
        >
          {saving ? "Saving…" : "Save All Settings"}
        </Button>
      </div>
    </div>
    </FadeSwap>
  );
}
