"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Send, Paperclip, X, FileText, Check, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAdminChatThread, useReplyAdminChat } from "@/hooks/use-admin";

function isImageFile(name: string | null): boolean {
  if (!name) return false;
  return /\.(jpe?g|png)$/i.test(name);
}

/** A real WhatsApp-style chat room for one user's Mpola Support thread —
 * the user's messages on the left, any admin's on the right (styled as a
 * single "Mpola Support" voice, matching the shared-inbox model — no
 * per-admin ownership). Used by both /admin/chat's right pane and the
 * floating popup's thread view. */
export function AdminChatThreadPane({ userId, onBack }: { userId: string; onBack?: () => void }) {
  const { data: thread, isLoading } = useAdminChatThread(userId);
  const reply = useReplyAdminChat(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;
    reply.mutate(
      { message: trimmed, file: pendingFile ?? undefined },
      {
        onSuccess: () => {
          setText("");
          setPendingFile(null);
        },
      },
    );
  };

  if (isLoading || !thread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 sm:hidden">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <p className="font-bold text-sm text-[#1B2B3A] dark:text-white">
          {thread.other_party.name ?? "—"}
        </p>
        {thread.other_party.role && (
          <Badge variant="outline" className="text-xs capitalize">
            {thread.other_party.role}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {!thread.messages.length ? (
          <p className="text-sm text-gray-400 text-center py-6">No messages yet.</p>
        ) : (
          thread.messages.map((m) => {
            const mine = m.is_admin;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                    mine
                      ? "bg-[#2BB5A0] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-[#1B2B3A] dark:text-white"
                  }`}
                >
                  {!mine && (
                    <p className="text-[10px] font-semibold opacity-70 mb-0.5">{m.sender_name ?? "—"}</p>
                  )}
                  {m.file_url && isImageFile(m.file_name) && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="block mb-1.5">
                      <img
                        src={m.file_url}
                        alt={m.file_name ?? "attachment"}
                        className="max-w-full max-h-56 rounded-lg object-cover"
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
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <p className="text-[10px] opacity-70">{new Date(m.created_at).toLocaleString()}</p>
                    {mine &&
                      (thread.user_read_at && m.created_at <= thread.user_read_at ? (
                        <CheckCheck className="w-3.5 h-3.5 opacity-90" />
                      ) : (
                        <Check className="w-3.5 h-3.5 opacity-70" />
                      ))}
                  </div>
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
                handleSend();
              }
            }}
            placeholder="Reply…"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:border-[#2BB5A0] dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={reply.isPending || (!text.trim() && !pendingFile)}
            className="shrink-0 w-9 h-9 rounded-lg bg-[#2BB5A0] text-white flex items-center justify-center hover:bg-[#239E8C] disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
