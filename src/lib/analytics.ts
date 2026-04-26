"use client";

import Cookies from "js-cookie";

// ─── Consent cookie ─────────────────────────────────────────────────────────

const CONSENT_COOKIE = "buk_analytics_consent";

export type ConsentValue = "granted" | "denied" | undefined;

export function getConsent(): ConsentValue {
  const v = Cookies.get(CONSENT_COOKIE);
  if (v === "granted" || v === "denied") return v;
  return undefined;
}

export function setConsent(value: "granted" | "denied") {
  // 365 days, SameSite=Lax for first-party cookie
  Cookies.set(CONSENT_COOKIE, value, { expires: 365, sameSite: "Lax" });
}

// ─── GA4 gtag wrapper ───────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/**
 * Initialise GA config — called only after the user grants consent.
 * @next/third-parties injects the gtag.js script, but we hold back
 * the `config` call until consent is given.
 */
export function initGA(measurementId: string) {
  gtag("consent", "update", {
    analytics_storage: "granted",
  });
  gtag("config", measurementId, {
    send_page_view: true,
  });
}

/**
 * Set consent to denied (default before user interacts with banner).
 */
export function denyGA() {
  gtag("consent", "update", {
    analytics_storage: "denied",
  });
}

// ─── Custom events ──────────────────────────────────────────────────────────

function getCityFromUrl(): string {
  if (typeof window === "undefined") return "london";
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);
  // Known static pages at root
  const STATIC = ["about", "privacy", "terms", "login", "signup", "account", "admin", "team", "contact", "blog", "guides", "u"];
  if (parts.length > 0 && !STATIC.includes(parts[0])) {
    return parts[0];
  }
  return "london";
}

export function trackSpotViewed(params: {
  spotId: string;
  category: string;
  neighbourhood: string;
  city?: string;
}) {
  gtag("event", "spot_viewed", { ...params, city: params.city || getCityFromUrl() });
}

export function trackSpotSaved(params: { spotId: string; city?: string }) {
  gtag("event", "spot_saved", { ...params, city: params.city || getCityFromUrl() });
}

export function trackSpotSubmitted(params: { spotId: string; city?: string }) {
  gtag("event", "spot_submitted", { ...params, city: params.city || getCityFromUrl() });
}

export function trackFilterApplied(params: { type: string; value: string; city?: string }) {
  gtag("event", "filter_applied", { ...params, city: params.city || getCityFromUrl() });
}

export function trackSearchPerformed(params: {
  query: string;
  resultCount: number;
  city?: string;
}) {
  gtag("event", "search_performed", { ...params, city: params.city || getCityFromUrl() });
}

export function trackLogin(params: { method: string; city?: string }) {
  gtag("event", "login", { ...params, city: params.city || getCityFromUrl() });
}

export function trackSignup(params: { method: string; city?: string }) {
  gtag("event", "signup", { ...params, city: params.city || getCityFromUrl() });
}

export function trackAffiliateClick(params: { destination: string; city?: string }) {
  gtag("event", "affiliate_click", { ...params, city: params.city || getCityFromUrl() });
}
