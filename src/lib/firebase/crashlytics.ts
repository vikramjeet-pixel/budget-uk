/**
 * Web error reporting via Firebase Analytics.
 * Crashlytics proper is mobile-only; on web we use the app_exception
 * event which appears in Firebase Analytics / Google Analytics dashboards.
 */

import { app } from "@/lib/firebase/client";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";

/**
 * Generates a short human-readable error ID.
 * If Next.js provides a digest on the Error object, use that instead —
 * it maps back to the server log entry.
 */
export function generateErrorId(digest?: string): string {
  if (digest) return digest;
  const ts = Date.now().toString(36).slice(-4);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${ts}-${rand}`;
}

/**
 * Report an error to Firebase Analytics.
 * Silently no-ops when analytics isn't supported (SSR, ad-blocker, etc.).
 */
export async function reportError(
  error: Error,
  errorId: string,
  context?: Record<string, string>
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const supported = await isSupported();
    if (!supported) return;
    const analytics = getAnalytics(app);
    logEvent(analytics, "app_exception", {
      description: `[${errorId}] ${error.name}: ${error.message.slice(0, 150)}`,
      fatal: false,
      error_id: errorId,
      ...context,
    });
  } catch {
    // Error reporting must never throw
  }
}
