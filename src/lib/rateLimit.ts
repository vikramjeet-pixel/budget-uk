import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Sliding-window rate limiter backed by Firestore `rateLimits/{uid}` docs.
 *
 * Each action type gets its own array of timestamps inside the doc.
 * On each check we prune expired entries and count remaining ones.
 */

interface RateLimitConfig {
  /** Firestore field name for the timestamps array */
  action: string;
  /** Maximum actions allowed within the window */
  maxActions: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(
  uid: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const docRef = adminDb.collection("rateLimits").doc(uid);
  const fieldName = `${config.action}_timestamps`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  return adminDb.runTransaction(async (t) => {
    const snap = await t.get(docRef);
    const data = snap.data() || {};
    const timestamps: number[] = (data[fieldName] || []).filter(
      (ts: number) => ts > windowStart
    );

    if (timestamps.length >= config.maxActions) {
      // Find when the earliest entry in the window expires
      const earliest = Math.min(...timestamps);
      const retryAfterSeconds = Math.ceil(
        (earliest + config.windowSeconds * 1000 - now) / 1000
      );
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(retryAfterSeconds, 1),
      };
    }

    // Record new timestamp
    timestamps.push(now);
    t.set(docRef, { [fieldName]: timestamps }, { merge: true });

    return {
      allowed: true,
      remaining: config.maxActions - timestamps.length,
    };
  });
}

// ─── Preset configs ─────────────────────────────────────────────────────────

/** Max 3 submissions per user per 24 hours */
export const SUBMISSION_LIMIT: RateLimitConfig = {
  action: "submission",
  maxActions: 3,
  windowSeconds: 24 * 60 * 60, // 24h
};

/** Max 60 votes per user per hour */
export const VOTE_LIMIT: RateLimitConfig = {
  action: "vote",
  maxActions: 60,
  windowSeconds: 60 * 60, // 1h
};

// ─── IP-based auth failure tracking ─────────────────────────────────────────

const AUTH_FAILURE_LIMIT = 300;
const AUTH_FAILURE_WINDOW = 60 * 60; // 1 hour in seconds

/**
 * Check and record an auth failure from an IP.
 * Returns true if the IP is blocked (exceeded the threshold).
 */
export async function recordAuthFailure(ip: string): Promise<boolean> {
  const safeIp = ip.replace(/[.:/]/g, "_");
  const docRef = adminDb.collection("rateLimits").doc(`ip_${safeIp}`);
  const fieldName = "authFailure_timestamps";
  const now = Date.now();
  const windowStart = now - AUTH_FAILURE_WINDOW * 1000;

  return adminDb.runTransaction(async (t) => {
    const snap = await t.get(docRef);
    const data = snap.data() || {};
    const timestamps: number[] = (data[fieldName] || []).filter(
      (ts: number) => ts > windowStart
    );

    timestamps.push(now);
    t.set(
      docRef,
      {
        [fieldName]: timestamps,
        lastFailure: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return timestamps.length > AUTH_FAILURE_LIMIT;
  });
}

/**
 * Check if an IP is currently blocked (without recording a new failure).
 */
export async function isIpBlocked(ip: string): Promise<boolean> {
  const safeIp = ip.replace(/[.:/]/g, "_");
  const docRef = adminDb.collection("rateLimits").doc(`ip_${safeIp}`);
  const snap = await docRef.get();

  if (!snap.exists) return false;

  const data = snap.data()!;
  const fieldName = "authFailure_timestamps";
  const now = Date.now();
  const windowStart = now - AUTH_FAILURE_WINDOW * 1000;
  const timestamps: number[] = (data[fieldName] || []).filter(
    (ts: number) => ts > windowStart
  );

  return timestamps.length > AUTH_FAILURE_LIMIT;
}
