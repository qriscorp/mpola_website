"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/constants";
import { getCookie } from "@/lib/api";

function wsUrl(token: string): string {
  const base = (API_BASE_URL || "").replace(/^http/, "ws");
  return `${base}/ws?token=${encodeURIComponent(token)}`;
}

/** Live notification/wallet push over WebSocket — reconnects with backoff.
 * Mount once near the app root (inside an authenticated layout) so it stays
 * connected for the life of the session.
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const retryRef = useRef(0);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    const token = getCookie("lf_token");
    if (!token) return;

    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    closedByUsRef.current = false;

    const connect = () => {
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
          } else if (msg.type === "low_wallet_balance") {
            toast.warning(msg.title, {
              description: msg.message,
              duration: 15000,
              action: {
                label: "Top up",
                onClick: () => router.push("/lender/wallet"),
              },
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
