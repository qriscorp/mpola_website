"use client";

import { useEffect, useState } from "react";

type InstallOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome }>;
}

const isStandaloneMode = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
};

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  if (dismissed || !deferredPrompt || isStandaloneMode()) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-[#BDE8E2] bg-[#EAF9F6] px-3 py-2 text-[#0B2A29]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="text-xs font-semibold sm:text-sm">
          Install Mpola on your desktop for a faster app-like experience.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[#8CD8CF] bg-white px-2.5 py-1 text-xs font-semibold text-[#165652]"
            onClick={() => setDismissed(true)}
          >
            Not now
          </button>
          <button
            type="button"
            className="rounded-md bg-[#2BB5A0] px-2.5 py-1 text-xs font-semibold text-white"
            onClick={onInstall}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
