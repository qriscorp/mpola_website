"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardSkeleton } from "@/components/skeletons";
import { useAdminChatThread, useReplyAdminChat } from "@/hooks/use-admin";

function isImageFile(name: string | null): boolean {
  if (!name) return false;
  return /\.(jpe?g|png)$/i.test(name);
}

export default function AdminChatThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { data: thread, isLoading } = useAdminChatThread(userId);
  const reply = useReplyAdminChat(userId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messageText, setMessageText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  if (isLoading || !thread) {
    return (
      <div className="space-y-6">
        <Link href="/admin/chat" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
          <ArrowLeft className="h-4 w-4" /> Back to Live Chat
        </Link>
        <CardSkeleton count={2} height="h-32" />
      </div>
    );
  }

  const handleSendReply = () => {
    const trimmed = messageText.trim();
    if (!trimmed && !pendingFile) return;
    reply.mutate(
      { message: trimmed, file: pendingFile ?? undefined },
      {
        onSuccess: () => {
          setMessageText("");
          setPendingFile(null);
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/chat" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#2BB5A0]">
        <ArrowLeft className="h-4 w-4" /> Back to Live Chat
      </Link>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#1B2B3A] dark:text-white">
              {thread.other_party.name ?? "—"}
            </p>
            {thread.other_party.role && (
              <Badge variant="outline" className="text-xs capitalize">
                {thread.other_party.role}
              </Badge>
            )}
            {thread.other_party.kyc_status && (
              <Badge variant="outline" className="text-xs capitalize">
                KYC: {thread.other_party.kyc_status}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-white dark:bg-gray-900">
        <CardHeader>
          <h3 className="font-semibold text-[#1B2B3A] dark:text-white text-sm">Conversation</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {!thread.messages.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {thread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-4 py-2.5 ${
                    m.is_admin
                      ? "bg-[#2BB5A0]/10 border border-[#2BB5A0]/30"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                    {m.is_admin ? "Mpola Support (you)" : m.sender_name ?? "—"}
                  </p>
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
                      className="flex items-center gap-1.5 text-xs font-medium text-[#2BB5A0] underline mb-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{m.file_name ?? "Attachment"}</span>
                    </a>
                  )}
                  {m.message && (
                    <p className="text-sm text-[#1B2B3A] dark:text-white whitespace-pre-wrap">{m.message}</p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
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
            <div className="flex gap-2">
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
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                placeholder="Reply..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                className="gap-2 text-white bg-[#2BB5A0] hover:bg-[#239385] shrink-0"
                disabled={reply.isPending || (!messageText.trim() && !pendingFile)}
                onClick={handleSendReply}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
