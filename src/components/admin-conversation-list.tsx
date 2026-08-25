"use client";

import { useAdminChatConversations } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-dashboard";
import { getInitials } from "@/lib/format";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/** The row list behind both the /admin/chat left pane and the floating
 * popup's list view — every user with a Mpola Support conversation. */
export function AdminConversationList({
  selectedUserId,
  onSelect,
}: {
  selectedUserId?: string | null;
  onSelect: (userId: string) => void;
}) {
  const { data: conversations, isLoading } = useAdminChatConversations();
  const { data: me } = useUser();

  if (isLoading) {
    return <p className="text-sm text-gray-400 text-center py-10">Loading…</p>;
  }
  if (!conversations?.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-10 px-6">
        Nothing here — all caught up.
      </p>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((c) => {
        const handledByMe = !!c.assigned_to_id && c.assigned_to_id === me?.id;
        return (
          <button
            key={c.user_id}
            onClick={() => onSelect(c.user_id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
              selectedUserId === c.user_id ? "bg-gray-50 dark:bg-gray-800/50" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#1B2B3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(c.name ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-bold text-[#1B2B3A] dark:text-white truncate">
                    {c.name ?? "—"}
                  </p>
                  {c.role && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {c.role}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.last_message_at)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.last_message}</p>
              {c.assigned_to_id && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {handledByMe ? "Handled by you" : `Handled by ${c.assigned_to_name ?? "another admin"}`}
                </p>
              )}
            </div>
            {c.needs_reply && (
              <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-[#2BB5A0]" aria-label="Needs reply" />
            )}
          </button>
        );
      })}
    </div>
  );
}
