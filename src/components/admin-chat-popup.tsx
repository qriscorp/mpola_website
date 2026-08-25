"use client";

import { X, ArrowLeft, MessageCircle } from "lucide-react";
import { AdminConversationList } from "@/components/admin-conversation-list";
import { AdminChatThreadPane } from "@/components/admin-chat-thread-pane";

export function AdminChatPopup({
  selectedUserId,
  onSelect,
  onClose,
}: {
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/20 sm:bg-transparent p-0 sm:p-6">
      <div className="w-full sm:w-96 h-[70vh] sm:h-[560px] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[#1B2B3A]">
          <div className="flex items-center gap-2 text-white">
            {selectedUserId && (
              <button onClick={() => onSelect(null)} className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <MessageCircle className="w-4 h-4" />
            <p className="font-bold text-sm">Live Chat</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex">
          {selectedUserId ? (
            <AdminChatThreadPane userId={selectedUserId} onReleased={() => onSelect(null)} />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <AdminConversationList onSelect={onSelect} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
