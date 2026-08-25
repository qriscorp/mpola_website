"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin";
import { AdminChatPopup } from "@/components/admin-chat-popup";

/** Admin's counterpart to the borrower/lender floating chat button — quick
 * access to Live Chat from any admin page, without leaving it. The full
 * two-pane inbox at /admin/chat (sidebar's "Live Chat" link) is still the
 * place for a dedicated work session through many conversations. */
export function FloatingAdminChatButton() {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data: stats } = useAdminStats();
  const awaitingReply = stats?.platform.awaiting_admin_chat_reply ?? 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Live Chat"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#2BB5A0] text-white shadow-lg hover:bg-[#239E8C] transition-colors flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
        {!!awaitingReply && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
            {awaitingReply > 9 ? "9+" : awaitingReply}
          </span>
        )}
      </button>
      {open && (
        <AdminChatPopup
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
          onClose={() => {
            setOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </>
  );
}
