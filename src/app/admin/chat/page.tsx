"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, MessagesSquare } from "lucide-react";
import { AdminConversationList } from "@/components/admin-conversation-list";
import { AdminChatThreadPane } from "@/components/admin-chat-thread-pane";

export default function AdminChatPage() {
  // Deep-linked from a real-time toast (see use-realtime.ts's
  // admin_chat_message branch) as /admin/chat?userId=... — there's no
  // separate detail route anymore, this page is a single two-pane view.
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    searchParams.get("userId"),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-[#2BB5A0]" />
          Live Chat
        </h1>
        <p className="text-sm text-muted-foreground">
          Direct conversations with borrowers and lenders — any admin can reply. For
          formal, categorized issues, see Support Tickets instead.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Below sm: list and thread are mutually exclusive, thread has a
            back button. At sm and up: both panes always visible side by
            side, no back button needed. */}
        <div
          className={`w-full sm:w-80 shrink-0 border-r border-gray-100 dark:border-gray-800 overflow-y-auto ${
            selectedUserId ? "hidden sm:block" : ""
          }`}
        >
          <AdminConversationList selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
        </div>
        <div className={`flex-1 min-w-0 ${selectedUserId ? "flex" : "hidden sm:flex"}`}>
          {selectedUserId ? (
            <AdminChatThreadPane userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
              <MessagesSquare className="w-10 h-10" />
              <p className="text-sm">Pick a conversation to start replying.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
