"use client";

import { useRealtimeNotifications } from "@/hooks/use-realtime";
import { useWebPushAutoResubscribe } from "@/hooks/use-web-push";

/** Renders nothing — just keeps the live WebSocket connection open (and
 * an already-granted browser push subscription current) for as long as
 * this is mounted (place once per authenticated layout).
 */
export function RealtimeProvider() {
  useRealtimeNotifications();
  useWebPushAutoResubscribe();
  return null;
}
