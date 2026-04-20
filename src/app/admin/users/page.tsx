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
  Ban,
  Eye,
  Download,
} from "lucide-react";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search),
  );

  const handleStatusChange = (
    id: string,
    status: "active" | "suspended" | "banned",
  ) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`User status updated to ${status}`),
      },
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
            Manage all registered borrowers
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
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
              {users.filter((u) => u.kycStatus === "verified").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending KYC</p>
            <p className="text-2xl font-bold text-[#C4A55A]">
              {users.filter((u) => u.kycStatus === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-500">
              {users.filter((u) => u.status === "suspended").length}
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
                  Type
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
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs ${user.accountType === "business" ? "bg-[#E8F8F5] text-[#2BB5A0] dark:bg-[#2BB5A0]/10" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
                      >
                        {user.accountType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          user.kycStatus === "verified"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : user.kycStatus === "pending"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {user.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {user.activeLoans}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {formatCurrency(user.totalBorrowed)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : user.status === "suspended"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          {user.status !== "active" && (
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                handleStatusChange(user.id, "active")
                              }
                            >
                              <UserCheck className="h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {user.status !== "suspended" && (
                            <DropdownMenuItem
                              className="gap-2 text-amber-600"
                              onClick={() =>
                                handleStatusChange(user.id, "suspended")
                              }
                            >
                              <UserX className="h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {user.status !== "banned" && (
                            <DropdownMenuItem
                              className="gap-2 text-red-600"
                              onClick={() =>
                                handleStatusChange(user.id, "banned")
                              }
                            >
                              <Ban className="h-4 w-4" />
                              Ban User
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
