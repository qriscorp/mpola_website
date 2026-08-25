"use client";

import { useState } from "react";
import { X, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { useUser } from "@/hooks/use-dashboard";
import { useChatConversations, useLoanChat, useSendChatMessage } from "@/hooks/use-chat";
import { formatCurrency, getInitials } from "@/lib/format";

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

function ConversationThread({ loanId, onBack }: { loanId: string; onBack: () => void }) {
  const { data: user } = useUser();
  const { data: chat, isLoading } = useLoanChat(loanId);
  const sendMessage = useSendChatMessage(loanId);
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed, { onSuccess: () => setText("") });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-sm text-[#1B2B3A] dark:text-white">
          {chat?.other_party.name ?? "Loading…"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
        ) : !chat?.messages.length ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No messages yet — say hello.
          </p>
        ) : (
          chat.messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                    mine
                      ? "bg-[#2BB5A0] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#1B2B3A] dark:text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a message…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:border-[#2BB5A0] dark:text-white"
        />
        <button
          onClick={handleSend}
          disabled={sendMessage.isPending || !text.trim()}
          className="shrink-0 w-9 h-9 rounded-lg bg-[#2BB5A0] text-white flex items-center justify-center hover:bg-[#239E8C] disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ConversationList({ onSelect }: { onSelect: (loanId: string) => void }) {
  const { data: conversations, isLoading } = useChatConversations();

  if (isLoading) {
    return <p className="text-sm text-gray-400 text-center py-10">Loading…</p>;
  }
  if (!conversations?.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-10 px-6">
        No conversations yet — once you have a loan with someone, you can message them here.
      </p>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((c) => (
        <button
          key={c.loan_id}
          onClick={() => onSelect(c.loan_id)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#1B2B3A] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(c.other_party_name ?? "?")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-[#1B2B3A] dark:text-white truncate">
                {c.other_party_name ?? "—"}
              </p>
              <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.last_message_at)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {c.last_message ?? `Loan of ${formatCurrency(c.loan_amount)}`}
            </p>
          </div>
          {c.unread_count > 0 && (
            <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#2BB5A0] text-white text-[10px] font-bold flex items-center justify-center">
              {c.unread_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function ChatModal({ onClose }: { onClose: () => void }) {
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/20 sm:bg-transparent p-0 sm:p-6">
      <div className="w-full sm:w-96 h-[70vh] sm:h-[560px] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-[#1B2B3A]">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-4 h-4" />
            <p className="font-bold text-sm">Messages</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeLoanId ? (
            <ConversationThread loanId={activeLoanId} onBack={() => setActiveLoanId(null)} />
          ) : (
            <ConversationList onSelect={setActiveLoanId} />
          )}
        </div>
      </div>
    </div>
  );
}
