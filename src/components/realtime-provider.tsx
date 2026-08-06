"use client";

import { useRealtimeNotifications } from "@/hooks/use-realtime";

/** Renders nothing — just keeps the live WebSocket connection open for as
 * long as this is mounted (place once per authenticated layout).
 */
export function RealtimeProvider() {
  useRealtimeNotifications();
  return null;
}
