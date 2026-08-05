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
  UserCheck,
  UserX,
  Trash2,
  Download,
} from "lucide-react";
import {
  useAdminUsers,
  useSuspendUser,
  useDeactivateUser,
} from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const suspend = useSuspendUser();
  const deactivate = useDeactivateUser();
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone_number ?? "").includes(search),
  );

  const handleSuspend = (username: string) => {
    suspend.mutate(username, {
      onSuccess: (res) => toast.success(`User ${res.action}`),
    });
  };

  const handleDeactivate = (username: string) => {
    if (
      !confirm(
        `Permanently deactivate ${username}? This cannot be undone (data is purged after 30 days).`,
      )
    ) {
      return;
    }
    deactivate.mutate(
      { username },
      { onSuccess: () => toast.success(`${username} deactivated`) },
    );
  };

  const handleExport = () => {
    downloadCsv(
      "mpola-users.csv",
      filtered.map((u) => ({
        username: u.username,
        full_name: u.full_name ?? "",
        email: u.email,
        phone: u.phone_number ?? "",
        role: u.role,
        kyc_status: u.kyc_status,
        active_loans: u.active_loans,
        total_borrowed: u.total_borrowed,
        status: u.is_active ? "active" : "suspended",
        joined: u.created_at,
      })),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Users
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered borrowers and lenders
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
              {users.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-[#2BB5A0]">
              {users.filter((u) => u.kyc_status === "verified").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending KYC</p>
            <p className="text-2xl font-bold text-[#C4A55A]">
              {users.filter((u) => u.kyc_status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-500">
              {users.filter((u) => !u.is_active).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
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
                  User
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">
                  Role
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  KYC
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">
                  Active Loans
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">
                  Total Borrowed
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground w-12">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse text-muted-foreground">
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                          {user.full_name ?? user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${user.role === "lender" ? "bg-[#F5F0E0] text-[#C4A55A] dark:bg-[#C4A55A]/10" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.kyc_status === "verified"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : user.kyc_status === "pending"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {user.kyc_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {user.active_loans}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {formatCurrency(user.total_borrowed)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          user.is_active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {user.is_active ? "active" : "suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent hover:bg-muted transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.is_active ? (
                            <DropdownMenuItem
                              className="gap-2 text-amber-600"
                              onClick={() => handleSuspend(user.username)}
                            >
                              <UserX className="h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="gap-2 text-emerald-600"
                              onClick={() => handleSuspend(user.username)}
                            >
                              <UserCheck className="h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="gap-2 text-red-600"
                            onClick={() => handleDeactivate(user.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Deactivate Account
                          </DropdownMenuItem>
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
