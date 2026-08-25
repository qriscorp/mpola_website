"use client";

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
import { MessageCircle, ArrowRight } from "lucide-react";
import { useAdminChatConversations } from "@/hooks/use-admin";
import { CardSkeleton, TableSkeleton } from "@/components/skeletons";
import { FadeSwap } from "@/components/motion/fade-swap";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminChatPage() {
  const { data: conversations, isLoading } = useAdminChatConversations();
  const list = conversations ?? [];

  return (
    <FadeSwap
      loading={isLoading}
      skeleton={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">Live Chat</h1>
          <CardSkeleton count={1} height="h-12" />
          <TableSkeleton rows={8} />
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#2BB5A0]" />
            Live Chat
          </h1>
          <p className="text-sm text-muted-foreground">
            Direct conversations with borrowers and lenders — any admin can reply. For
            formal, categorized issues, see Support Tickets instead.
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              {list.length} conversation{list.length === 1 ? "" : "s"}
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase text-muted-foreground">User</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">Role</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground">Last message</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground hidden lg:table-cell">Active</TableHead>
                  <TableHead className="text-xs uppercase text-muted-foreground w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nothing here — all caught up.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((c) => (
                    <TableRow key={c.user_id}>
                      <TableCell className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                        {c.name ?? "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs capitalize">
                          {c.role ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        <p className="line-clamp-2 text-gray-600 dark:text-gray-300">{c.last_message}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {c.needs_reply ? (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            Needs reply
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                            Replied
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {timeAgo(c.last_message_at)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/chat/${c.user_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2BB5A0] text-white text-xs font-semibold hover:bg-[#239385] transition-colors"
                        >
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
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
