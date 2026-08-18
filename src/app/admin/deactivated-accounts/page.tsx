"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserX, RotateCcw, Copy, Check } from "lucide-react";
import { useDeactivatedAccounts, useRestoreDeactivatedAccount } from "@/hooks/use-admin";
import { ConfirmModal } from "@/components/confirm-modal";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FadeSwap } from "@/components/motion/fade-swap";

const PAGE_SIZE = 20;

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diffMs = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function AdminDeactivatedAccountsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDeactivatedAccounts(page, PAGE_SIZE);
  const restore = useRestoreDeactivatedAccount();

  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [restoredResult, setRestoredResult] = useState<{
    username: string;
    temporary_password: string;
    sms_sent: boolean;
    phone_number: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const accounts = data?.users ?? [];
  const total = data?.total ?? 0;

  const handleConfirmRestore = () => {
    if (!confirmTarget) return;
    restore.mutate(confirmTarget, {
      onSuccess: (result) => {
        setConfirmTarget(null);
        setRestoredResult({
          username: result.username,
          temporary_password: result.temporary_password,
          sms_sent: result.sms_sent,
          phone_number: result.phone_number,
        });
      },
    });
  };

  const handleCopy = async () => {
    if (!restoredResult) return;
    await navigator.clipboard.writeText(restoredResult.temporary_password);
    setCopied(true);
    toast.success("Temporary password copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FadeSwap
      loading={isLoading && !data}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Deactivated Accounts</h1>
          <CardSkeleton count={1} height="h-20" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
            <UserX className="h-6 w-6 text-[#2BB5A0]" />
            Deactivated Accounts
          </h1>
          <p className="text-sm text-muted-foreground">
            Self-deactivated or admin-deactivated accounts, kept for 30 days before their
            record is permanently purged. Restoring recreates the account and texts a
            temporary password to the phone number on file — they&apos;ll be prompted to
            set a real password the moment they sign in with it.
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              {total} deactivated account{total === 1 ? "" : "s"}
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">Account</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">Deactivated By</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">Reason</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Purge Date</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground w-28">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No deactivated accounts right now.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((a) => {
                    const remaining = daysUntil(a.scheduled_deletion_date);
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                            {a.original_username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {a.original_email}
                            {a.original_phone_number ? ` · ${a.original_phone_number}` : ""}
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {a.deactivated_by ?? "Self-service"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                          {a.reason ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.scheduled_deletion_date ? (
                            <>
                              {new Date(a.scheduled_deletion_date).toLocaleDateString()}
                              {remaining != null && (
                                <span className={remaining <= 3 ? "text-red-500 font-medium" : ""}>
                                  {" "}
                                  ({remaining > 0 ? `${remaining}d left` : "purging soon"})
                                </span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setConfirmTarget(a.original_username)}
                            disabled={restore.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239385] transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <PaginationControls page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Restore this account?"
        description={`This recreates ${confirmTarget}'s account and texts a new temporary password straight to the phone number on file. They'll be prompted to change it the moment they sign in.`}
        confirmLabel="Restore"
        onConfirm={handleConfirmRestore}
        loading={restore.isPending}
      />

      <Dialog open={!!restoredResult} onOpenChange={(open) => !open && setRestoredResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2B3A] dark:text-white">Account restored</DialogTitle>
            <DialogDescription>
              {restoredResult?.sms_sent ? (
                <>
                  A temporary password was texted to <strong>{restoredResult.username}</strong>&apos;s
                  registered number ({restoredResult.phone_number}). It&apos;s also shown below in
                  case the SMS doesn&apos;t arrive — it won&apos;t be shown again after you close
                  this dialog. They&apos;ll be prompted to set a real password the moment they sign in.
                </>
              ) : (
                <>
                  <strong>{restoredResult?.username}</strong> has no phone number on file, so no SMS
                  could be sent — give them this temporary password directly. It won&apos;t be shown
                  again after you close this dialog.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
            <code className="flex-1 text-sm font-mono text-[#1B2B3A] dark:text-white break-all">
              {restoredResult?.temporary_password}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={() => setRestoredResult(null)} className="w-full mt-2 bg-[#2BB5A0] hover:bg-[#239E8C]">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </FadeSwap>
  );
}
