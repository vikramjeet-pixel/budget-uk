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
  if (!token) {
    return process.env.NODE_ENV !== "production";
  }
  try {
    await adminAppCheck.verifyToken(token);
    return true;
  } catch {
    return false;
  }
}
