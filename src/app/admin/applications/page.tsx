"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import {
  useAdminApplications,
  useUpdateApplicationStatus,
} from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export default function AdminApplicationsPage() {
  const { data: applications = [], isLoading } = useAdminApplications();
  const updateStatus = useUpdateApplicationStatus();
  const [search, setSearch] = useState("");

  const filtered = applications.filter(
    (a) =>
      (a.borrower_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      a.reference_number.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStatus = (id: string, action: "approve" | "reject") => {
    updateStatus.mutate(
      { id, status: action },
      {
        onSuccess: () =>
          toast.success(`Application ${action === "approve" ? "approved" : "rejected"}`),
      },
    );
  };

  const handleExport = () => {
    downloadCsv(
      "mpola-applications.csv",
      filtered.map((a) => ({
        reference: a.reference_number,
        borrower: a.borrower_name ?? "",
        amount: a.amount,
        loan_type: a.loan_type,
        status: a.status,
        offers: a.offer_count,
        created_at: a.created_at,
      })),
    );
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
      case "funded":
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
      case "approved":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "completed":
        return "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10";
      case "rejected":
      case "defaulted":
        return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Applications
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and moderate loan applications
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              {applications.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {applications.filter((a) => a.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Funded</p>
            <p className="text-2xl font-bold text-[#C4A55A]">
              {applications.filter((a) => a.status === "funded").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-[#2BB5A0]">
              {applications.filter((a) => a.status === "completed").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by borrower name or reference..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Reference
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Borrower
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">
                  Amount
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  Offers
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse text-muted-foreground">
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No applications match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                      {app.reference_number}
                    </TableCell>
                    <TableCell className="text-sm">
                      {app.borrower_name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {formatCurrency(app.amount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${app.loan_type === "business" ? "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
                      >
                        {app.loan_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {app.offer_count}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColor(app.status)}`}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.status === "pending" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="gap-2 text-emerald-600"
                              onClick={() => handleStatus(app.id, "approve")}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-red-600"
                              onClick={() => handleStatus(app.id, "reject")}
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
