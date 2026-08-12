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
  const { title, body, data, urgent } = payload;
  event.waitUntil(
    self.registration.showNotification(title || "Mpola", {
      body,
      data,
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

// Focus an already-open tab if there is one, otherwise open a new one —
// deliberately doesn't force-navigate an open tab away from whatever the
// user is doing; the in-app toast (shown while a tab is focused) already
// carries a specific "Respond"/"View" deep link for that case.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    }),
  );
});
