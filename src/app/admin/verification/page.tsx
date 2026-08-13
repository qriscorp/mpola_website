"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useAdminUsers, useAdminStats } from "@/hooks/use-admin";
import { getInitials } from "@/lib/format";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FadeSwap } from "@/components/motion/fade-swap";

const PAGE_SIZE = 20;

type RoleTab = "borrower" | "lender";

export default function AdminVerificationPage() {
  const [role, setRole] = useState<RoleTab>("borrower");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page, PAGE_SIZE, {
    role,
    status: "unverified",
  });
  const { data: stats } = useAdminStats();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const handleTab = (t: RoleTab) => {
    setRole(t);
    setPage(1);
  };

  return (
    <FadeSwap
      loading={isLoading && !data}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Verification</h1>
          <CardSkeleton count={1} height="h-20" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#2BB5A0]" />
          Verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Everyone still waiting on KYC review — separated by role so it's
          clear whether you're vetting a borrower or a lender.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              {stats?.users.total ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-emerald-500">
              {stats?.users.verified ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Awaiting Verification</p>
            <p className="text-2xl font-bold text-amber-500">
              {stats?.users.awaiting_review ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTab("borrower")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            role === "borrower"
              ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
              : "bg-white border-gray-300 text-gray-600 hover:border-[#2BB5A0] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          Borrowers
        </button>
        <button
          onClick={() => handleTab("lender")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            role === "lender"
              ? "bg-[#2BB5A0] border-[#2BB5A0] text-white"
              : "bg-white border-gray-300 text-gray-600 hover:border-[#2BB5A0] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          Lenders
        </button>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            {total} {role}{total === 1 ? "" : "s"} awaiting verification
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">User</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">Contact</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">KYC Status</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground w-24">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nobody waiting on verification here — all caught up.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <Link href={`/admin/users/${u.username}`} className="flex items-center gap-3 hover:underline">
                        <div className="h-8 w-8 rounded-full bg-[#1B2B3A] flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">
                            {getInitials(u.full_name ?? u.username)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                          {u.full_name ?? u.username}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {u.email}
                      {u.phone_number ? ` · ${u.phone_number}` : ""}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          u.kyc_status === "rejected"
                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        }`}
                      >
                        Not Verified
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${u.username}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239385] transition-colors"
                      >
                        Review
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
    </FadeSwap>
  );
}
