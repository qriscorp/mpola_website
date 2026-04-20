"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActiveLoan } from "@/hooks/use-dashboard";
import { useInstalments } from "@/hooks/use-repayments";
import { formatCurrency, getStatusColor } from "@/lib/format";

export default function RepaymentsPage() {
  const { data: loan } = useActiveLoan();
  const { data: instalments, isLoading } = useInstalments();

  const paidAmount = (loan?.paidInstalments ?? 0) * (loan?.monthlyPayment ?? 0);
  const totalAmount =
    (loan?.totalInstalments ?? 1) * (loan?.monthlyPayment ?? 0);
  const remainingAmount = totalAmount - paidAmount;
  const progressPct = loan
    ? (loan.paidInstalments / loan.totalInstalments) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#1B2B3A]">
          Repayment Schedule
        </h1>
        <p className="text-gray-500 mt-1">
          Personal Loan · LF-2026-00621 · Kampala Capital Partners
        </p>
      </div>

      {/* Loan Summary Header - dark card */}
      <Card className="bg-[#1B2B3A] text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Loan Amount
              </p>
              <p className="mt-1">
                <span className="text-xs text-gray-400">UGX </span>
                <span className="text-2xl font-bold">
                  {loan?.amount.toLocaleString() ?? "—"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Rate
              </p>
              <p className="text-2xl font-bold mt-1">
                {loan?.interestRate ?? "—"}%
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Monthly
              </p>
              <p className="mt-1">
                <span className="text-xs text-gray-400">UGX </span>
                <span className="text-2xl font-bold">
                  {loan?.monthlyPayment.toLocaleString() ?? "—"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                Lender
              </p>
              <p className="text-2xl font-bold mt-1">Kampala Capital</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>{formatCurrency(paidAmount)} paid</span>
            <span>
              {loan?.paidInstalments} of {loan?.totalInstalments} instalments (
              {Math.round(progressPct)}%)
            </span>
            <span>{formatCurrency(remainingAmount)} remaining</span>
          </div>
          <Progress
            value={progressPct}
            className="mt-2 h-2 bg-gray-600 [&>div]:bg-[#2BB5A0]"
          />
        </CardContent>
      </Card>

      {/* Instalments Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                  #
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                  Due Date
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                  Amount
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                  Paid On
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-400"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                instalments?.map((inst) => (
                  <TableRow
                    key={inst.number}
                    className={inst.status === "due" ? "bg-amber-50/50" : ""}
                  >
                    <TableCell className="font-bold text-[#1B2B3A]">
                      {String(inst.number).padStart(2, "0")}
                    </TableCell>
                    <TableCell>{inst.dueDate}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-400">UGX </span>
                      <span className="font-medium">
                        {inst.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(inst.status)} border-0 text-xs font-medium`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />
                        {inst.status === "paid"
                          ? "Paid"
                          : inst.status === "due"
                            ? `Due May 1`
                            : "Upcoming"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {inst.paidOn ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {inst.status === "paid" ? (
                        <button className="text-sm text-[#2BB5A0] font-medium hover:underline">
                          Receipt
                        </button>
                      ) : inst.status === "due" ? (
                        <Link href="/dashboard/repayments/pay">
                          <Button
                            size="sm"
                            className="bg-[#2BB5A0] text-white hover:bg-[#239E8C] text-xs"
                          >
                            Pay Now
                          </Button>
                        </Link>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
