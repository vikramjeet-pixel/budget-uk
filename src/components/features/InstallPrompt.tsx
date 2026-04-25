"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";

const VISIT_COOKIE = "buk_visit_count";
const DISMISSED_COOKIE = "buk_pwa_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Increment visit counter
    const count = parseInt(Cookies.get(VISIT_COOKIE) || "0", 10) + 1;
    Cookies.set(VISIT_COOKIE, String(count), { expires: 365, sameSite: "Lax" });

    // Don't show if dismissed or already installed
    if (Cookies.get(DISMISSED_COOKIE)) return;

    // Only show on 3rd visit or later
    if (count < 3) return;

    // Check if already in standalone mode (already installed)
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    deferredPrompt.current = null;
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    deferredPrompt.current = null;
    // Don't show again for 30 days
    Cookies.set(DISMISSED_COOKIE, "1", { expires: 30, sameSite: "Lax" });
  }, []);

  if (!visible) return null;

  return (
    <div
      id="pwa-install-banner"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-lg
                 bg-[#fcfbf8] border border-[var(--border-passive)] rounded-[12px]
                 shadow-lg px-6 py-5
                 animate-in fade-in slide-in-from-bottom-4 duration-400"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192x192.png"
            alt="BudgetUK"
            className="w-10 h-10 rounded-[8px] border border-[var(--border-passive)]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#1c1c1c] truncate">
              Install BudgetUK
            </p>
            <p className="text-[12px] text-[#5f5f5d]">
              Quick access, works offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            id="pwa-dismiss-btn"
            onClick={handleDismiss}
            className="px-4 py-2 text-[13px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c]
                       border border-[var(--border-passive)] rounded-[8px] transition-colors"
          >
            Not now
          </button>
          <button
            id="pwa-install-btn"
            onClick={handleInstall}
            className="px-5 py-2 text-[13px] font-semibold text-[#fcfbf8] bg-[#1c1c1c]
                       hover:bg-[#3a3a3a] rounded-[8px] transition-colors"
          >
            Install app
          </button>
        </div>
      </div>
    </div>
  );
}
