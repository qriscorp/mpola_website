"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, UserX, UserCheck, Trash2, ShieldCheck, ShieldX, FileText, ExternalLink, Wallet as WalletIcon } from "lucide-react";
import {
  useAdminUserDetail,
  useSuspendUser,
  useDeactivateUser,
  useReviewKyc,
  useVerifyKycDocument,
} from "@/hooks/use-admin";
import { formatCurrency, formatRate, getInitials } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdminWalletAdjustModal } from "@/components/admin-wallet-adjust-modal";

const statusColor = (s: string) => {
  switch (s) {
    case "active":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
    case "overdue":
      return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    case "completed":
      return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    case "defaulted":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
  }
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useAdminUserDetail(username);
  const suspend = useSuspendUser();
  const deactivate = useDeactivateUser();
  const reviewKyc = useReviewKyc(username);
  const verifyKycDocument = useVerifyKycDocument(username);
  const [tab, setTab] = useState<"borrower" | "lender">("borrower");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Link>
        <p className="text-sm text-muted-foreground">Couldn&apos;t load this user.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <CardSkeleton count={3} />
      </div>
    );
  }

  const { profile, loans_as_borrower, loans_as_lender, applications, kyc_documents, wallet, transactions } = data;

  const handleApproveKyc = () => {
    if (!confirm(`Approve KYC for ${profile.username}?`)) return;
    reviewKyc.mutate(
      { status: "verified" },
      { onSuccess: () => toast.success("KYC approved") },
    );
  };

  const handleRejectKyc = () => {
    const note = window.prompt("Reason for rejection (shown to the user, optional):") ?? undefined;
    reviewKyc.mutate(
      { status: "rejected", note },
      { onSuccess: () => toast.success("KYC rejected") },
    );
  };

  const handleSuspend = () => {
    suspend.mutate(profile.username, {
      onSuccess: (res) => toast.success(`User ${res.action}`),
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        `Permanently delete ${profile.username}? This removes their account, loans, and applications right away — it cannot be undone (audit record kept for 30 days).`,
      )
    ) {
      return;
    }
    deactivate.mutate(
      { username: profile.username },
      {
        onSuccess: () => {
          toast.success(`${profile.username} deleted`);
          router.push("/admin/users");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      {/* Profile header */}
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#1B2B3A] flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-bold">
                {getInitials(profile.full_name ?? profile.username)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
                  {profile.full_name ?? profile.username}
                </h1>
                <Badge variant="outline" className="text-xs capitalize">
                  {profile.role}
                </Badge>
                <Badge
                  className={`text-xs ${profile.is_active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {profile.is_active ? "active" : "suspended"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.email} · {profile.phone_number ?? "no phone on file"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Joined {new Date(profile.created_at).toLocaleDateString()} · Credit score {profile.credit_score}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleSuspend}
                disabled={suspend.isPending}
              >
                {profile.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                {profile.is_active ? "Suspend" : "Reactivate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-red-600 hover:text-red-700"
                onClick={handleDelete}
                disabled={deactivate.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">KYC Status</p>
            <p className="text-lg font-bold text-[#1B2B3A] dark:text-white capitalize">
              {profile.kyc_status}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="text-lg font-bold text-[#2BB5A0]">
                  {wallet.is_wallet_setup ? formatCurrency(wallet.balance) : "Not set up"}
                </p>
              </div>
              {wallet.is_wallet_setup && (
                <button
                  onClick={() => setAdjustModalOpen(true)}
                  title="Adjust balance"
                  className="shrink-0 h-7 w-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
                >
                  <WalletIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Loans as Borrower</p>
            <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
              {loans_as_borrower.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Loans as Lender</p>
            <p className="text-lg font-bold text-[#1B2B3A] dark:text-white">
              {loans_as_lender.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KYC review */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                KYC Review
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current status:{" "}
                <span
                  className={`font-semibold capitalize ${
                    profile.kyc_status === "verified"
                      ? "text-emerald-600"
                      : profile.kyc_status === "rejected"
                        ? "text-red-600"
                        : "text-amber-600"
                  }`}
                >
                  {profile.kyc_status}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleApproveKyc}
                disabled={reviewKyc.isPending || profile.kyc_status === "verified"}
              >
                <ShieldCheck className="h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-red-600 hover:text-red-700"
                onClick={handleRejectKyc}
                disabled={reviewKyc.isPending || profile.kyc_status === "rejected"}
              >
                <ShieldX className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {kyc_documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {kyc_documents.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white capitalize">
                        {d.document_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {d.file_name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </a>
                    <Button
                      size="sm"
                      variant={d.verified ? "outline" : "default"}
                      className={d.verified ? "" : "bg-emerald-500 hover:bg-emerald-600 text-white"}
                      disabled={verifyKycDocument.isPending}
                      onClick={() =>
                        verifyKycDocument.mutate({ documentId: d.id, verified: !d.verified })
                      }
                    >
                      {d.verified ? "Verified ✓" : "Mark Verified"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications */}
      {applications.length > 0 && (
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Loan Applications
            </h2>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">Reference</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm font-medium">{a.reference_number}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(a.amount)}</TableCell>
                    <TableCell className="text-sm capitalize">{a.loan_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusColor(a.status)}`}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Loans */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("borrower")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tab === "borrower"
                  ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              As Borrower ({loans_as_borrower.length})
            </button>
            <button
              onClick={() => setTab("lender")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                tab === "lender"
                  ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
            >
              As Lender ({loans_as_lender.length})
            </button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {(tab === "borrower" ? loans_as_borrower : loans_as_lender).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No loans {tab === "borrower" ? "borrowed" : "funded"} yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">
                    {tab === "borrower" ? "Lender" : "Borrower"}
                  </TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Rate</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Repaid</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tab === "borrower" ? loans_as_borrower : loans_as_lender).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="text-sm">{l.other_party ?? "Unknown"}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(l.amount)}</TableCell>
                    <TableCell className="text-sm">{formatRate(l.interest_rate)}</TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(l.total_paid)} / {formatCurrency(l.total_repayable)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusColor(l.status)}`}>
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
            Recent Wallet Transactions
          </h2>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No wallet activity yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{tx.type}</TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">{tx.status}</TableCell>
                    <TableCell className="text-sm text-right font-medium">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AdminWalletAdjustModal
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        username={profile.username}
        currentBalance={wallet.balance}
      />
    </div>
  );
}
