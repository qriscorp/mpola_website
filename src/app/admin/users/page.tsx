"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Eye,
} from "lucide-react";
import {
  useAdminUsers,
  useAdminStats,
  useSuspendUser,
  useDeactivateUser,
} from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useAdminUsers(page, PAGE_SIZE, {
    search: debouncedSearch || undefined,
  });
  const { data: stats } = useAdminStats();
  const suspend = useSuspendUser();
  const deactivate = useDeactivateUser();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const handleSuspend = (username: string) => {
    suspend.mutate(username, {
      onSuccess: (res) => toast.success(`User ${res.action}`),
    });
  };

  const handleDelete = (username: string) => {
    if (
      !confirm(
        `Permanently delete ${username}? This removes their account, loans, and applications right away — it cannot be undone (audit record kept for 30 days).`,
      )
    ) {
      return;
    }
    deactivate.mutate(
      { username },
      { onSuccess: () => toast.success(`${username} deleted`) },
    );
  };

  const handleExport = () => {
    downloadCsv(
      "mpola-users.csv",
      users.map((u) => ({
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Users</h1>
        <CardSkeleton count={1} height="h-20" />
        <TableSkeleton rows={8} />
      </div>
    );
  }

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
              {stats?.users.total ?? total}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-[#2BB5A0]">
              {stats?.users.verified ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-[#C4A55A]">
              {stats?.users.active ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-500">
              {stats?.users.suspended ?? 0}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users match your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link href={`/admin/users/${user.username}`} className="block hover:underline">
                        <p className="font-medium text-sm text-[#1B2B3A] dark:text-white">
                          {user.full_name ?? user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </Link>
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
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => router.push(`/admin/users/${user.username}`)}
                          >
                            <Eye className="h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
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
                            onClick={() => handleDelete(user.username)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
  );
}
