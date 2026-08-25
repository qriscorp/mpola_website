"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useChatUnreadCount } from "@/hooks/use-chat";
import { ChatModal } from "@/components/chat-modal";

/** Floating chat button — mounted once in each role's authenticated
 * layout (dashboard/layout.tsx, lender/layout.tsx). Opens a modal with the
 * user's loan-scoped conversations, not an open DM system — see
 * chat-modal.tsx / routers/chat.py for why it's scoped that way. */
export function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount } = useChatUnreadCount();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Messages"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#2BB5A0] text-white shadow-lg hover:bg-[#239E8C] transition-colors flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
        {!!unreadCount && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && <ChatModal onClose={() => setOpen(false)} />}
    </>
  );
}
