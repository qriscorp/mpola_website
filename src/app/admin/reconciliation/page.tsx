"use client";

import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
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
import { formatCurrency } from "@/lib/format";
import { useAdminReconciliation } from "@/hooks/use-admin";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { FadeSwap } from "@/components/motion/fade-swap";

export default function AdminReconciliationPage() {
  const { data, isLoading } = useAdminReconciliation(7);

  const driftCount = data?.wallet_drift.length ?? 0;
  const mismatchCount = data?.gateway_mismatches.length ?? 0;
  const isHealthy = !isLoading && driftCount === 0 && mismatchCount === 0;

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Reconciliation</h1>
          <CardSkeleton count={1} height="h-20" />
          <TableSkeleton rows={6} />
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Reconciliation</h1>
          <p className="text-sm text-muted-foreground">
            Financial integrity check: every wallet&apos;s stored balance against its own
            transaction ledger, and recent deposits/withdrawals cross-checked against what the
            payment gateway reports.
          </p>
        </div>

        <Card className={isHealthy ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900" : "bg-white dark:bg-gray-900"}>
          <CardContent className="p-5 flex items-center gap-3">
            {isHealthy ? (
              <>
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">All clear</p>
                  <p className="text-sm text-muted-foreground">
                    Checked {data?.checked_count ?? 0} wallets/transactions — no drift or mismatches found.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-[#1B2B3A] dark:text-white">
                    {driftCount} wallet{driftCount === 1 ? "" : "s"} with drift,{" "}
                    {mismatchCount} gateway mismatch{mismatchCount === 1 ? "" : "es"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Review the tables below. Generated {data ? new Date(data.generated_at).toLocaleString() : ""}.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">Wallet Ledger Drift</h2>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">User</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground text-right">Stored Balance</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground text-right">Ledger Balance</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground text-right">Delta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.wallet_drift.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 inline mr-1 text-emerald-500" />
                      No drift detected.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.wallet_drift.map((w) => (
                    <TableRow key={w.user_id}>
                      <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                        {w.username ?? w.user_id}
                      </TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(w.stored_balance)}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(w.ledger_balance)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-red-600">
                        {formatCurrency(w.delta)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">Gateway Cross-Check (last 7 days)</h2>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">Reference</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Our Status</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Gateway Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.gateway_mismatches.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 inline mr-1 text-emerald-500" />
                      No mismatches found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.gateway_mismatches.map((m) => (
                    <TableRow key={m.transaction_id}>
                      <TableCell className="text-sm font-mono">{m.reference}</TableCell>
                      <TableCell className="text-sm capitalize">{m.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{m.our_status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs text-amber-600">{m.gateway_status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </FadeSwap>
  );
}
