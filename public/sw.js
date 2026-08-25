self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passive service worker for installability.
});

// Desktop/browser push — the counterpart to Expo push on mobile (see
// mpola_api's utils/webpush.py, which sends this exact JSON shape).
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  const { title, body, data, urgent, type } = payload;
  event.waitUntil(
    self.registration.showNotification(title || "Mpola", {
      body,
      // Flattened so notificationclick can read both the type and the
      // original data fields (e.g. ticket_id) off one object.
      data: { ...(data || {}), type },
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      requireInteraction: !!urgent,
      // Distinct pattern for action-needed vs routine pushes — mirrors the
      // app's high-importance Android channel getting a vibration pattern
      // while the default channel doesn't.
      vibrate: urgent ? [200, 100, 200, 100, 200] : [200],
    }),
  );
});

// Deep-link paths for notification types with one unambiguous destination
// regardless of which portal (borrower/lender) the recipient is in —
// mirrors the "View"/"Respond" actions already wired into the in-app toast
// in src/hooks/use-realtime.ts. Kept as its own small map here (not
// imported) since a service worker runs in an isolated context with no
// access to the app's own modules.
const NOTIFICATION_PATHS = {
  loan_pending_disbursement: () => "/lender/portfolio",
  offer_template_expired: () => "/lender/offers",
  lender_offer_template: () => "/lender/offers",
  offer_awaiting_response: () => "/dashboard/offers-received",
  auto_match_cooldown_lifted: () => "/lender/offers",
  low_wallet_balance: () => "/lender/wallet",
  guarantor_still_pending: () => "/dashboard/my-requests",
  application_expired: () => "/dashboard/my-requests",
  support_ticket: (data) => (data.ticket_id ? `/admin/support/${data.ticket_id}` : "/admin/support"),
  support_ticket_update: (data) => (data.ticket_id ? `/admin/support/${data.ticket_id}` : "/admin/support"),
  admin_chat_message: (data) => (data.user_id ? `/admin/chat/${data.user_id}` : null),
};

// Types whose destination depends on which portal the recipient is in —
// same role split the in-app toast makes via the current tab's pathname.
// A service worker has no such context when nothing is open, so this
// checks any already-open tab's URL instead, defaulting to the
// borrower/dashboard side (the more common portal) when none is open.
const PORTAL_SPLIT_PATHS = {
  offer_expired: { lender: "/lender/offers", other: "/dashboard/offers-received" },
  guarantor_invite_received: { lender: "/lender/approvals", other: "/dashboard/approvals" },
  support_reply: { lender: "/lender/help", other: "/dashboard/help" },
};

async function resolveNotificationPath(type, data) {
  if (NOTIFICATION_PATHS[type]) return NOTIFICATION_PATHS[type](data || {});
  if (PORTAL_SPLIT_PATHS[type]) {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const isLender = clients.some((c) => {
      try {
        return new URL(c.url).pathname.startsWith("/lender");
      } catch {
        return false;
      }
    });
    const split = PORTAL_SPLIT_PATHS[type];
    return isLender ? split.lender : split.other;
  }
  return null;
}

// Deep-links to the relevant screen when the notification's type/data
// resolve to one; otherwise just focuses an already-open tab (or opens a
// new one at "/") without force-navigating it away from whatever the user
// was doing — same fallback as before.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const { type } = data;
  event.waitUntil(
    (async () => {
      const path = await resolveNotificationPath(type, data);
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const client = clients[0];
      if (client) {
        if (path && "navigate" in client) {
          try {
            await client.navigate(path);
          } catch {
            // cross-origin or unsupported — fall back to just focusing below
          }
        }
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(path || "/");
    })(),
  );
});
