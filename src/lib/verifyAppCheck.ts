import { adminAppCheck } from "@/lib/firebase/admin";
import type { NextRequest } from "next/server";

/**
 * Verifies the Firebase App Check token from the X-Firebase-AppCheck header.
 *
 * In production, a missing or invalid token is a hard reject — no App Check
 * token means the request did not come from a verified browser client.
 *
 * In development, missing tokens are allowed through so local workflows
 * (curl, Postman, tests) aren't broken before a debug token is configured.
 * Invalid tokens are always rejected regardless of environment.
 */
export async function verifyAppCheck(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("X-Firebase-AppCheck");
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!token) {
    // If no token, only allow if not in production OR if App Check isn't configured yet
    const allowed = process.env.NODE_ENV !== "production" || !siteKey;
    if (!allowed) {
      console.warn("App Check: Missing token in production with site key configured. Rejecting.");
    }
    return allowed;
  }

  try {
    await adminAppCheck.verifyToken(token);
    return true;
  } catch (error) {
    console.error("App Check: Token verification failed:", error);
    return false;
  }
}
