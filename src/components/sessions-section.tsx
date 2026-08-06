"use client";

import { Monitor } from "lucide-react";
import { useLoginSessions, useSignOutEverywhere } from "@/hooks/use-support";
import { StaggerList, StaggerItem } from "@/components/motion/stagger";

function summarizeUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (/mobile/i.test(ua)) return "Mobile browser";
  if (/Mpola/i.test(ua)) return "Mpola app";
  if (/Chrome/i.test(ua)) return "Chrome browser";
  if (/Safari/i.test(ua)) return "Safari browser";
  if (/Firefox/i.test(ua)) return "Firefox browser";
  return "Desktop browser";
}

export function SessionsSection() {
  const { data: sessions, isLoading } = useLoginSessions();
  const signOutEverywhere = useSignOutEverywhere();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#1B2B3A] dark:text-white">
          Active Sessions
        </h2>
        <button
          onClick={() => {
            if (confirm("Sign out of Mpola on every device? You'll need to sign in again.")) {
              signOutEverywhere.mutate();
            }
          }}
          disabled={signOutEverywhere.isPending}
          className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
        >
          Sign out everywhere
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      ) : !sessions?.length ? (
        <p className="text-sm text-gray-400">No recent login activity.</p>
      ) : (
        <StaggerList className="space-y-3">
          {sessions.map((s) => (
            <StaggerItem
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-3"
            >
              <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <Monitor className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                  {summarizeUserAgent(s.user_agent)}
                  {s.is_most_recent && (
                    <span className="ml-2 text-xs font-semibold text-emerald-600">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {s.ip_address ?? "Unknown IP"} ·{" "}
                  {new Date(s.created_at).toLocaleString()}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
      <p className="mt-4 text-xs text-gray-400">
        Mpola keeps one active session per account — &quot;Sign out everywhere&quot; ends
        your current session on every device rather than a single one.
      </p>
    </div>
  );
}
