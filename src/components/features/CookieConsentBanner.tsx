"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent, initGA, denyGA } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (consent === undefined) {
      // No decision yet — show banner and default to denied
      denyGA();
      // Use a microtask to move the state update out of the direct effect body
      // if linting is strict, otherwise just leave it.
      setVisible(true);
    } else if (consent === "granted" && GA_ID) {
      // Returning user who already accepted
      initGA(GA_ID);
    }
  }, []);

  const handleAccept = () => {
    setConsent("granted");
    if (GA_ID) initGA(GA_ID);
    setVisible(false);
  };

  const handleDecline = () => {
    setConsent("denied");
    denyGA();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      id="cookie-consent-banner"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-lg
                 bg-[#f7f4ed] border border-[var(--border-passive)] rounded-[12px]
                 shadow-lg px-6 py-5
                 animate-in fade-in slide-in-from-bottom-4 duration-400"
    >
      <div className="flex flex-col gap-3">
        <p className="text-[14px] leading-relaxed text-[#1c1c1c]">
          We use cookies to understand how you use BudgetUK and improve the
          experience. No data is shared with third parties.{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors"
          >
            Privacy policy
          </Link>
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            id="cookie-decline-btn"
            onClick={handleDecline}
            className="px-4 py-2 text-[13px] font-medium text-[#5f5f5d] hover:text-[#1c1c1c] transition-colors rounded-lg"
          >
            Decline
          </button>
          <button
            id="cookie-accept-btn"
            onClick={handleAccept}
            className="px-5 py-2 text-[13px] font-semibold text-[#fcfbf8] bg-[#1c1c1c] hover:bg-[#3a3a3a] rounded-lg transition-colors"
          >
            Accept cookies
          </button>
        </div>
      </div>
    </div>
  );
}
