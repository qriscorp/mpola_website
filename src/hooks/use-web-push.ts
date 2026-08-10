"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

async function subscribeBrowser(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  const { public_key } = await api.getVapidPublicKey();
  if (!public_key) return false;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key),
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;
  await api.subscribeWebPush({
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  });
  return true;
}

/** Silently keeps an already-granted browser subscribed (e.g. after
 * clearing site data lost the old subscription) — no UI, safe to mount
 * on every authenticated page. Requesting permission itself needs an
 * explicit user gesture (see useWebPushPrompt below), so this never
 * calls Notification.requestPermission(). */
export function useWebPushAutoResubscribe() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      subscribeBrowser().catch(() => {});
    }
  }, []);
}

const DISMISS_KEY = "mpola_web_push_prompt_dismissed";

/** Drives the visible "enable notifications" prompt banner — only makes
 * sense to show when permission hasn't been decided yet (a user who
 * already denied it can't be re-prompted by JS at all; the browser
 * just silently ignores requestPermission() in that case). */
export function useWebPushPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [dismissed, setDismissed] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const enable = async () => {
    setSubscribing(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        await subscribeBrowser();
      }
    } finally {
      setSubscribing(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return {
    show: permission === "default" && !dismissed,
    subscribing,
    enable,
    dismiss,
  };
}
