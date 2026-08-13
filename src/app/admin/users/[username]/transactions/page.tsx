"use client";

import { use, useState } from "react";
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
import { ArrowLeft } from "lucide-react";
import { useAdminUserTransactions } from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { CardSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";

const PAGE_SIZE = 20;

export default function AdminUserTransactionsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUserTransactions(username, page, PAGE_SIZE);

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/users/${username}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {username}
      </Link>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h1 className="text-xl font-bold text-[#1B2B3A] dark:text-white">
            All Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} transaction{total === 1 ? "" : "s"} for @{username}
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <CardSkeleton count={1} height="h-64" />
          ) : transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No wallet activity yet.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Description</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm capitalize">{tx.type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-right font-medium">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PaginationControls
                page={page}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
