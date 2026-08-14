"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useDeactivateAccount } from "@/hooks/use-dashboard";
import { useSignOut } from "@/hooks/use-auth";

/** Self-service account deactivation — the backend (POST /users/me/deactivate)
 * blocks this if there's a nonzero wallet balance or a loan in progress, so
 * failures here are expected and surfaced via the mutation's own error toast,
 * not something this dialog needs to pre-validate. */
export function DeactivateAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const deactivate = useDeactivateAccount();
  const signOut = useSignOut();

  const handleConfirm = () => {
    if (!password) return;
    deactivate.mutate(
      { password, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          signOut();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-center text-[#1B2B3A] dark:text-white">
            Deactivate your account?
          </DialogTitle>
          <DialogDescription className="text-center">
            This permanently deletes your account and wallet — your data is fully purged after 30
            days. Withdraw your wallet balance and settle any active loan first; this can&apos;t
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label>Confirm your password</Label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason (optional)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Help us improve — why are you leaving?"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="destructive"
            className="w-full"
            disabled={!password || deactivate.isPending}
            onClick={handleConfirm}
          >
            {deactivate.isPending ? "Deactivating…" : "Permanently Deactivate"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
            disabled={deactivate.isPending}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
