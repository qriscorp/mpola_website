"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Search, ShieldAlert } from "lucide-react";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 20;

const actionColor = (action: string) => {
  if (action.includes("failed") || action.includes("declined") || action.includes("rejected"))
    return "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
  if (action.includes("deactivated") || action.includes("suspended"))
    return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
  if (action.includes("success") || action.includes("approved") || action.includes("created"))
    return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400";
  return "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
};

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data, isLoading } = useAdminAuditLogs(page, PAGE_SIZE, {
    search: debouncedSearch || undefined,
  });
  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Audit Log</h1>
        <CardSkeleton count={1} height="h-20" />
        <TableSkeleton rows={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[#C4A55A]" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground">
          Immutable record of every admin and account-security action on the platform
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, action, or resource..."
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
                <TableHead className="text-xs uppercase text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">User</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">Action</TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">
                  Resource
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">
                  IP Address
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No matching audit entries.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {log.username ?? "system"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${actionColor(log.action)}`}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {log.resource_type ? `${log.resource_type}${log.resource_id ? ` · ${log.resource_id.slice(0, 8)}` : ""}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {log.ip_address ?? "—"}
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
