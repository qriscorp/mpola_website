"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/constants";
import { getCookie } from "@/lib/api";

function wsUrl(token: string): string {
  const base = (API_BASE_URL || "").replace(/^http/, "ws");
  return `${base}/ws?token=${encodeURIComponent(token)}`;
}

// Types where someone is being asked to actually approve/decide something,
// not just informed — these get an audible cue in addition to the toast so
// they're harder to miss while the tab is open (mirrors the backend's
// URGENT_NOTIFICATION_TYPES, which raises push priority for the same set
// on mobile). No sound plays if the tab is closed — the browser has no
// push channel today; only the visible-tab case is covered here.
const URGENT_NOTIFICATION_TYPES = new Set(["guarantor_invite_received", "guarantor_still_pending"]);

let audioCtx: AudioContext | null = null;

function playAttentionChime() {
  try {
    audioCtx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    // Two quick ascending tones, distinct from a plain single beep.
    [[880, now], [1174.66, now + 0.14]].forEach(([freq, start]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq as number;
      gain.gain.setValueAtTime(0.0001, start as number);
      gain.gain.exponentialRampToValueAtTime(0.2, (start as number) + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, (start as number) + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start as number);
      osc.stop((start as number) + 0.24);
    });
  } catch {
    // best-effort — never let a sound failure break notification delivery
  }
}

/** Live notification/wallet push over WebSocket — reconnects with backoff.
 * Mount once near the app root (inside an authenticated layout) so it stays
 * connected for the life of the session.
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const retryRef = useRef(0);
  const closedByUsRef = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (!getCookie("lf_token")) return;

    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    closedByUsRef.current = false;

    const connect = () => {
      // Re-read the cookie on every (re)connect, not just once at mount —
      // access tokens are short-lived (15min) and get silently refreshed
      // in place elsewhere in the app (see refreshToken() in lib/api.ts).
      // Reusing a stale closured token meant that once it expired, every
      // reconnect attempt kept retrying the SAME dead token forever,
      // getting rejected (code 4001, logged server-side as 403) in an
      // infinite loop instead of picking up the refreshed one.
      const token = getCookie("lf_token");
      if (!token) return; // logged out — stop retrying rather than loop on no-token
      socket = new WebSocket(wsUrl(token));

      socket.onopen = () => {
        retryRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event !== "notification") return;

          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["wallet"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["lender", "wallet"] });
          queryClient.invalidateQueries({ queryKey: ["applications"] });
          queryClient.invalidateQueries({ queryKey: ["active-loan"] });
          queryClient.invalidateQueries({ queryKey: ["lender", "active-loans"] });
          queryClient.invalidateQueries({ queryKey: ["lender", "offer-templates"] });
          queryClient.invalidateQueries({ queryKey: ["lender", "offers"] });
          queryClient.invalidateQueries({ queryKey: ["borrower", "offers-received"] });
          queryClient.invalidateQueries({ queryKey: ["application"] });
          queryClient.invalidateQueries({ queryKey: ["guarantor-requests"] });
          queryClient.invalidateQueries({ queryKey: ["support"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "support-tickets"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
          queryClient.invalidateQueries({ queryKey: ["chat"] });

          if (URGENT_NOTIFICATION_TYPES.has(msg.type)) {
            playAttentionChime();
          }

          if (msg.type === "loan_pending_disbursement") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "Review",
                onClick: () => router.push("/lender/portfolio"),
              },
            });
          } else if (msg.type === "loan_disbursed") {
            toast.success(msg.title, { description: msg.message });
          } else if (msg.type === "offer_template_expired") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "Update",
                onClick: () => router.push("/lender/offers"),
              },
            });
          } else if (msg.type === "lender_offer_template") {
            toast.success(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "View",
                onClick: () => router.push("/lender/offers"),
              },
            });
          } else if (msg.type === "offer_awaiting_response") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "View",
                onClick: () => router.push("/dashboard/offers-received"),
              },
            });
          } else if (msg.type === "auto_match_cooldown_lifted") {
            toast.info(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "View",
                onClick: () => router.push("/lender/offers"),
              },
            });
          } else if (msg.type === "offer_expired") {
            const isLenderPath = pathnameRef.current?.startsWith("/lender");
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "View",
                onClick: () => router.push(isLenderPath ? "/lender/offers" : "/dashboard/offers-received"),
              },
            });
          } else if (msg.type === "low_wallet_balance") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "Top up",
                onClick: () => router.push("/lender/wallet"),
              },
            });
          } else if (msg.type === "guarantor_invite_received") {
            const approvalsPath = pathnameRef.current?.startsWith("/lender")
              ? "/lender/approvals"
              : "/dashboard/approvals";
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "Respond",
                onClick: () => router.push(approvalsPath),
              },
            });
          } else if (msg.type === "guarantor_response") {
            toast.info(msg.title, { description: msg.message });
          } else if (msg.type === "guarantor_still_pending") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "View",
                onClick: () => router.push("/dashboard/my-requests"),
              },
            });
          } else if (msg.type === "application_expired") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "View",
                onClick: () => router.push("/dashboard/my-requests"),
              },
            });
          } else if (msg.type === "guarantor_request_expired") {
            toast.info(msg.title, { description: msg.message });
          } else if (msg.type === "support_ticket" || msg.type === "support_ticket_update") {
            const ticketId = msg.data?.ticket_id;
            toast.info(msg.title, {
              description: msg.message,
              duration: 15000,
              action: ticketId
                ? {
                    label: "View",
                    onClick: () => router.push(`/admin/support/${ticketId}`),
                  }
                : undefined,
            });
          } else if (msg.type === "support_reply") {
            const ticketId = msg.data?.ticket_id;
            const isLenderPath = pathnameRef.current?.startsWith("/lender");
            toast.info(msg.title, {
              description: msg.message,
              duration: 15000,
              action: ticketId
                ? {
                    label: "View",
                    onClick: () => router.push(isLenderPath ? "/lender/help" : "/dashboard/help"),
                  }
                : undefined,
            });
          } else if (msg.title) {
            toast.info(msg.title, { description: msg.message });
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (closedByUsRef.current) return;
        const delay = Math.min(30000, 1000 * 2 ** retryRef.current);
        retryRef.current += 1;
        retryTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      closedByUsRef.current = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, [queryClient]);
}
