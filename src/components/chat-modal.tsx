"use client";

import { useRef, useState } from "react";
import { X, Send, ArrowLeft, MessageCircle, LifeBuoy, Paperclip, FileText } from "lucide-react";
import { useUser } from "@/hooks/use-dashboard";
import {
  useChatConversations,
  useLoanChat,
  useSendChatMessage,
  useAdminChat,
  useSendAdminChatMessage,
} from "@/hooks/use-chat";
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

function isImageFile(name: string | null): boolean {
  if (!name) return false;
  return /\.(jpe?g|png)$/i.test(name);
}

type ThreadMessage = {
  id: string;
  sender_id: string | null;
  message: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

function ThreadView({
  title,
  isLoading,
  messages,
  myId,
  onBack,
  onSend,
  sending,
  text,
  setText,
  pendingFile,
  setPendingFile,
}: {
  title: string;
  isLoading: boolean;
  messages: ThreadMessage[];
  myId: string | undefined;
  onBack: () => void;
  onSend: () => void;
  sending: boolean;
  text: string;
  setText: (v: string) => void;
  pendingFile: File | null;
  setPendingFile: (f: File | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="font-bold text-sm text-[#1B2B3A] dark:text-white">{title}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
        ) : !messages.length ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === myId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                    mine
                      ? "bg-[#2BB5A0] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#1B2B3A] dark:text-white"
                  }`}
                >
                  {m.file_url && isImageFile(m.file_name) && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="block mb-1.5">
                      <img
                        src={m.file_url}
                        alt={m.file_name ?? "attachment"}
                        className="max-w-full max-h-48 rounded-lg object-cover"
                      />
                    </a>
                  )}
                  {m.file_url && !isImageFile(m.file_name) && (
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 text-xs font-medium underline mb-1.5 ${
                        mine ? "text-white" : "text-[#2BB5A0]"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{m.file_name ?? "Attachment"}</span>
                    </a>
                  )}
                  {m.message && <p className="text-sm whitespace-pre-wrap">{m.message}</p>}
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 pt-2 border-t border-gray-100 dark:border-gray-800">
        {pendingFile && (
          <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs">
            <Paperclip className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span className="flex-1 truncate text-gray-600 dark:text-gray-300">{pendingFile.name}</span>
            <button
              onClick={() => setPendingFile(null)}
              className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex gap-2 pb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPendingFile(f);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:border-[#2BB5A0] hover:text-[#2BB5A0] transition-colors"
            aria-label="Attach a file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Write a message…"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:border-[#2BB5A0] dark:text-white"
          />
          <button
            onClick={onSend}
            disabled={sending || (!text.trim() && !pendingFile)}
            className="shrink-0 w-9 h-9 rounded-lg bg-[#2BB5A0] text-white flex items-center justify-center hover:bg-[#239E8C] disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanConversationThread({ loanId, onBack }: { loanId: string; onBack: () => void }) {
  const { data: user } = useUser();
  const { data: chat, isLoading } = useLoanChat(loanId);
  const sendMessage = useSendChatMessage(loanId);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;
    sendMessage.mutate(
      { message: trimmed, file: pendingFile ?? undefined },
      {
        onSuccess: () => {
          setText("");
          setPendingFile(null);
        },
      },
    );
  };

  return (
    <ThreadView
      title={chat?.other_party.name ?? "Loading…"}
      isLoading={isLoading}
      messages={chat?.messages ?? []}
      myId={user?.id}
      onBack={onBack}
      onSend={handleSend}
      sending={sendMessage.isPending}
      text={text}
      setText={setText}
      pendingFile={pendingFile}
      setPendingFile={setPendingFile}
    />
  );
}

function AdminConversationThread({ onBack }: { onBack: () => void }) {
  const { data: user } = useUser();
  const { data: chat, isLoading } = useAdminChat();
  const sendMessage = useSendAdminChatMessage();
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;
    sendMessage.mutate(
      { message: trimmed, file: pendingFile ?? undefined },
      {
        onSuccess: () => {
          setText("");
          setPendingFile(null);
        },
      },
    );
  };

  return (
    <ThreadView
      title="Mpola Support"
      isLoading={isLoading}
      messages={chat?.messages ?? []}
      myId={user?.id}
      onBack={onBack}
      onSend={handleSend}
      sending={sendMessage.isPending}
      text={text}
      setText={setText}
      pendingFile={pendingFile}
      setPendingFile={setPendingFile}
    />
  );
}

function ConversationList({
  onSelectLoan,
  onSelectAdmin,
}: {
  onSelectLoan: (loanId: string) => void;
  onSelectAdmin: () => void;
}) {
  const { data: conversations, isLoading } = useChatConversations();

  return (
    <div className="overflow-y-auto">
      <button
        onClick={onSelectAdmin}
        className="w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-[#2BB5A0] text-white flex items-center justify-center shrink-0">
          <LifeBuoy className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1B2B3A] dark:text-white">Mpola Support</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Chat with our team</p>
        </div>
      </button>

      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
      ) : !conversations?.length ? (
        <p className="text-sm text-gray-400 text-center py-10 px-6">
          No loan conversations yet — once you have a loan with someone, you can message them here.
        </p>
      ) : (
        conversations.map((c) => (
          <button
            key={c.loan_id}
            onClick={() => onSelectLoan(c.loan_id)}
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
        ))
      )}
    </div>
  );
}

export function ChatModal({ onClose }: { onClose: () => void }) {
  const [activeView, setActiveView] = useState<"admin" | string | null>(null);

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
          {activeView === "admin" ? (
            <AdminConversationThread onBack={() => setActiveView(null)} />
          ) : activeView ? (
            <LoanConversationThread loanId={activeView} onBack={() => setActiveView(null)} />
          ) : (
            <ConversationList onSelectLoan={setActiveView} onSelectAdmin={() => setActiveView("admin")} />
          )}
        </div>
      </div>
    </div>
  );
}
