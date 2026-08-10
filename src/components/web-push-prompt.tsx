"use client";

import { Bell, X } from "lucide-react";
import { useWebPushPrompt } from "@/hooks/use-web-push";

/** "Enable browser notifications" — the desktop counterpart to granting
 * push permission on iOS/Android. Only renders while permission is still
 * undecided; once the browser's own prompt has been answered (allow or
 * block), nothing here can change that, so this stays hidden either way. */
export function WebPushPrompt() {
  const { show, subscribing, enable, dismiss } = useWebPushPrompt();

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#9DDAD1] bg-[#E6F4F2] dark:border-[#2BB5A0]/30 dark:bg-[#2BB5A0]/10 px-4 py-3">
      <Bell className="h-4 w-4 text-[#149D8E] shrink-0" />
      <p className="flex-1 text-sm text-[#1B2B3A] dark:text-white">
        Turn on browser notifications to get an instant alert — even when this tab isn&apos;t
        open — for things like guarantor requests, the same way it works on your phone.
      </p>
      <button
        onClick={enable}
        disabled={subscribing}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-[#149D8E] text-white text-xs font-semibold hover:bg-[#108a7d] transition-colors disabled:opacity-50"
      >
        {subscribing ? "Enabling…" : "Enable"}
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
