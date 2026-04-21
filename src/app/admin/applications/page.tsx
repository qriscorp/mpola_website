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
  Eye,
  Download,
} from "lucide-react";
import {
  useAdminApplications,
  useUpdateApplicationStatus,
} from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function AdminApplicationsPage() {
  const { data: applications = [], isLoading } = useAdminApplications();
  const updateStatus = useUpdateApplicationStatus();
  const [search, setSearch] = useState("");

  const filtered = applications.filter(
    (a) =>
      a.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      a.reference.toLowerCase().includes(search.toLowerCase()),
  );

  const handleStatus = (id: string, status: "approved" | "rejected") => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Application ${status}`),
      },
    );
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "submitted":
        return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
      case "reviewing_offers":
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
      case "approved":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "rejected":
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
            Review and manage loan applications
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
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
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {applications.filter((a) => a.status === "submitted").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Reviewing</p>
            <p className="text-2xl font-bold text-[#C4A55A]">
              {
                applications.filter((a) => a.status === "reviewing_offers")
                  .length
              }
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-[#2BB5A0]">
              {applications.filter((a) => a.status === "approved").length}
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
              ) : (
                filtered.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                      {app.reference}
                    </TableCell>
                    <TableCell className="text-sm">
                      {app.borrowerName}
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {formatCurrency(app.amount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs ${app.loanType === "business" ? "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
                      >
                        {app.loanType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {app.offersCount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColor(app.status)}`}
                      >
                        {app.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {app.status !== "approved" && (
                            <DropdownMenuItem
                              className="gap-2 text-emerald-600"
                              onClick={() => handleStatus(app.id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {app.status !== "rejected" && (
                            <DropdownMenuItem
                              className="gap-2 text-red-600"
                              onClick={() => handleStatus(app.id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
