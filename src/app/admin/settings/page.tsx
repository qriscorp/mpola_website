"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { passwordRequirementErrors, PASSWORD_REQUIREMENTS_HINT } from "@/lib/password";
import { useConfirm } from "@/hooks/use-confirm";
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
  useExportAllPlatformData,
} from "@/hooks/use-admin";
import { useUser, useUpdateProfile } from "@/hooks/use-dashboard";
import { api } from "@/lib/api";
import { formatCurrency, formatRate, formatDuration } from "@/lib/format";
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
  min_loan_amount: "1000",
  max_loan_amount: "100000000",
  max_interest_rate: "10",
  // These four map directly to the keys the collections engine (scheduler.py)
  // actually reads — see its module docstring for the exact semantics.
  reminder_days_before_due: "3",
  grace_period_days: "3",
  default_after_days: "60",
  late_fee_rate: "2", // stored as a fraction (0.02) — shown here as a percentage
  // Timing knobs the scheduler already reads (with these same fallbacks)
  // but that had no admin UI at all until now.
  guarantor_reminder_after_hours: "24",
  guarantor_reminder_cooldown_hours: "24",
  low_balance_lookback_days: "30",
  low_balance_notify_cooldown_days: "5",
  matched_offer_expiry_days: "14",
  payment_pending_expiry_hours: "48",
};

// Mirrors NUMERIC_SETTING_BOUNDS in routers/admin.py — kept in sync so a bad
// value gets caught here, before a network round trip, not just server-side.
const NUMERIC_BOUNDS: Record<string, { min: number; max: number; label: string }> = {
  min_loan_amount: { min: 100, max: 1_000_000_000, label: "Minimum Loan Amount" },
  max_loan_amount: { min: 100, max: 1_000_000_000, label: "Maximum Loan Amount" },
  max_interest_rate: { min: 0.1, max: 25, label: "Max Interest Rate" },
  reminder_days_before_due: { min: 1, max: 30, label: "Payment Reminder (days before due)" },
  grace_period_days: { min: 0, max: 90, label: "Grace Period" },
  default_after_days: { min: 1, max: 365, label: "Default After" },
  late_fee_rate: { min: 0, max: 100, label: "Late Fee" }, // shown/validated as a % here, converted to a fraction on save
  guarantor_reminder_after_hours: { min: 1, max: 168, label: "Guarantor Reminder After" },
  guarantor_reminder_cooldown_hours: { min: 1, max: 168, label: "Guarantor Reminder Cooldown" },
  low_balance_lookback_days: { min: 1, max: 90, label: "Low Balance Lookback" },
  low_balance_notify_cooldown_days: { min: 1, max: 30, label: "Low Balance Notify Cooldown" },
  matched_offer_expiry_days: { min: 1, max: 90, label: "Matched Offer Expiry" },
  payment_pending_expiry_hours: { min: 1, max: 168, label: "Payment Pending Expiry" },
};

/** Every reason `form` can't be saved as-is — empty array means it's valid.
 * Checked before any network call, and again server-side (routers/admin.py
 * has the authoritative copy of these same bounds). */
function validateSettingsForm(form: Record<string, string>): string[] {
  const errors: string[] = [];

  for (const [key, bounds] of Object.entries(NUMERIC_BOUNDS)) {
    const raw = form[key];
    const value = Number(raw);
    if (raw === undefined || raw.trim() === "" || Number.isNaN(value)) {
      errors.push(`${bounds.label} must be a number`);
      continue;
    }
    if (value < bounds.min || value > bounds.max) {
      errors.push(`${bounds.label} must be between ${bounds.min} and ${bounds.max}`);
    }
  }

  if (!errors.length) {
    const min = Number(form.min_loan_amount);
    const max = Number(form.max_loan_amount);
    if (min >= max) errors.push("Minimum loan amount must be less than the maximum");

    const grace = Number(form.grace_period_days);
    const defaultAfter = Number(form.default_after_days);
    if (grace >= defaultAfter) errors.push("Grace Period must be less than Default After (days overdue)");
  }

  if (!form.platform_name?.trim()) errors.push("Platform name can't be empty");
  const email = form.support_email ?? "";
  if (!email.includes("@") || email.startsWith("@") || !email.split("@").pop()?.includes(".")) {
    errors.push("Support email must be a valid email address");
  }

  return errors;
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateAdminSetting();
  const { data: user } = useUser();
  const { mutate: updateProfile } = useUpdateProfile();
  const { data: pendingTemplates } = useOfferTemplatesForReview("pending_review");
  const reviewTemplate = useReviewOfferTemplate();
  const exportAllData = useExportAllPlatformData();
  const { confirm, ConfirmDialog } = useConfirm();

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
    const errors = validateSettingsForm(form);
    if (errors.length) {
      errors.forEach((e) => toast.error(e));
      return;
    }
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        Object.entries(form).map(([key, value]) =>
          api.updateAdminSetting(
            key,
            key === "late_fee_rate" ? String(Number(value) / 100) : value,
          ),
        ),
      );
      const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
      if (failed.length) {
        failed.forEach((f) => toast.error(f.reason instanceof Error ? f.reason.message : "Failed to save a setting"));
      } else {
        toast.success("Settings saved");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    const pwErrors = passwordRequirementErrors(newPassword);
    if (pwErrors.length) {
      toast.error(`New password needs: ${pwErrors.join(", ").toLowerCase()}`);
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
            <div className="space-y-2 sm:col-span-2">
              <Label>Regulatory Licence Statement</Label>
              <Input
                value={form.licence_number}
                onChange={(e) => setForm({ ...form, licence_number: e.target.value })}
                placeholder="e.g. Licensed by Bank of Uganda — Tier IV Credit Institution Licence #XXXXX"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Shown publicly in the website footer exactly as typed here — leave blank until
                Mpola actually holds a real licence to display. Until then, the public site shows
                a generic (true) compliance statement instead of an unverified regulatory claim.
              </p>
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
                min={NUMERIC_BOUNDS.min_loan_amount.min}
                max={NUMERIC_BOUNDS.min_loan_amount.max}
                value={form.min_loan_amount}
                onChange={(e) => setForm({ ...form, min_loan_amount: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Loan Amount (UGX)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.max_loan_amount.min}
                max={NUMERIC_BOUNDS.max_loan_amount.max}
                value={form.max_loan_amount}
                onChange={(e) => setForm({ ...form, max_loan_amount: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Interest Rate (%/month)</Label>
              <Input
                type="number"
                min={0.1}
                max={25}
                step={0.1}
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
                min={NUMERIC_BOUNDS.reminder_days_before_due.min}
                max={NUMERIC_BOUNDS.reminder_days_before_due.max}
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
                min={NUMERIC_BOUNDS.grace_period_days.min}
                max={NUMERIC_BOUNDS.grace_period_days.max}
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
                min={NUMERIC_BOUNDS.default_after_days.min}
                max={NUMERIC_BOUNDS.default_after_days.max}
                value={form.default_after_days}
                onChange={(e) => setForm({ ...form, default_after_days: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Late Fee (%)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.late_fee_rate.min}
                max={NUMERIC_BOUNDS.late_fee_rate.max}
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

      {/* Advanced Timing */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#C4A55A]" />
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Advanced Timing
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Background job timers — the scheduler already reads these (with the
            defaults shown), this is just where you can now tune them.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Guarantor Reminder After (hours)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.guarantor_reminder_after_hours.min}
                max={NUMERIC_BOUNDS.guarantor_reminder_after_hours.max}
                value={form.guarantor_reminder_after_hours}
                onChange={(e) => setForm({ ...form, guarantor_reminder_after_hours: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                How long a guarantor invite sits before the automatic reminder job nudges them.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Guarantor Reminder Cooldown (hours)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.guarantor_reminder_cooldown_hours.min}
                max={NUMERIC_BOUNDS.guarantor_reminder_cooldown_hours.max}
                value={form.guarantor_reminder_cooldown_hours}
                onChange={(e) => setForm({ ...form, guarantor_reminder_cooldown_hours: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Also caps how often a borrower can manually re-send a reminder.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Low Balance Lookback (days)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.low_balance_lookback_days.min}
                max={NUMERIC_BOUNDS.low_balance_lookback_days.max}
                value={form.low_balance_lookback_days}
                onChange={(e) => setForm({ ...form, low_balance_lookback_days: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                How much lending activity history is used to flag a lender as low-balance.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Low Balance Notify Cooldown (days)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.low_balance_notify_cooldown_days.min}
                max={NUMERIC_BOUNDS.low_balance_notify_cooldown_days.max}
                value={form.low_balance_notify_cooldown_days}
                onChange={(e) => setForm({ ...form, low_balance_notify_cooldown_days: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Matched Offer Expiry (days)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.matched_offer_expiry_days.min}
                max={NUMERIC_BOUNDS.matched_offer_expiry_days.max}
                value={form.matched_offer_expiry_days}
                onChange={(e) => setForm({ ...form, matched_offer_expiry_days: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                How long a standing-offer auto-match waits for the lender to fund it before it expires.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Payment Pending Expiry (hours)</Label>
              <Input
                type="number"
                min={NUMERIC_BOUNDS.payment_pending_expiry_hours.min}
                max={NUMERIC_BOUNDS.payment_pending_expiry_hours.max}
                value={form.payment_pending_expiry_hours}
                onChange={(e) => setForm({ ...form, payment_pending_expiry_hours: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                A mobile money/card deposit or withdrawal stuck &quot;pending&quot; longer than this gets reconciled/failed.
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
              <PasswordInput
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{PASSWORD_REQUIREMENTS_HINT}</p>
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
                      {formatRate(t.interest_rate)} · Max {formatDuration(t.max_duration, t.max_duration_days)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() =>
                        reviewTemplate.mutate(
                          { id: t.id, action: "approve" },
                          {
                            onSuccess: (res) =>
                              toast.success(
                                res.offers_created > 0
                                  ? `Offer approved — matched ${res.offers_created} pending application${res.offers_created === 1 ? "" : "s"} automatically`
                                  : "Offer approved",
                              ),
                          },
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
                Download complete platform data as a zip of CSVs (users, loans, applications,
                repayments, wallet transactions, disputes, support tickets)
                {user && !user.isSuperAdmin && " — super admin only"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={exportAllData.isPending || (!!user && !user.isSuperAdmin)}
              onClick={() => exportAllData.mutate()}
            >
              {exportAllData.isPending ? "Exporting…" : "Export"}
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
              onClick={async () => {
                const next = !isMaintenanceOn;
                if (next) {
                  const ok = await confirm({
                    title: "Enable maintenance mode?",
                    description: "Block all borrower and lender sign-ins now?",
                    confirmLabel: "Enable Maintenance Mode",
                    destructive: true,
                  });
                  if (!ok) return;
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
      {ConfirmDialog}
    </div>
    </FadeSwap>
  );
}
