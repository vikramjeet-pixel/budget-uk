/**
 * Environment variable validation logic.
 * This script runs during the initialization phase to ensure all required 
 * environment variables are present in production.
 */

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_SERVICE_ACCOUNT_B64",
  "GOOGLE_PLACES_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "NEXT_PUBLIC_SITE_URL"
] as const;

export function validateEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `❌ CRITICAL CONFIGURATION ERROR: Missing required environment variables: ${missing.join(", ")}`;
    console.error(errorMsg);

    // In production, we want to fail loudly on cold start
    throw new Error(errorMsg);
  }
}

// Automatically validate on import
validateEnv();
