import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

if (!getApps().length) initializeApp();

const db = getFirestore();
const GOOGLE_PLACES_API_KEY = defineSecret("GOOGLE_PLACES_API_KEY");

// ─── Shared types (mirrored from src/types for the functions runtime) ─────────

interface PlaceData {
  openingHours: string[];
  phone: string | null;
  website: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  priceLevel: number | null;
  photoRef: string | null;
  lastSyncedAt: Timestamp;
}

// ─── Places API helper ───────────────────────────────────────────────────────

const PLACES_FIELDS = [
  "opening_hours",
  "formatted_phone_number",
  "website",
  "rating",
  "user_ratings_total",
  "price_level",
  "photos",
].join(",");

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceData | null> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", PLACES_FIELDS);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    logger.error(`Places API HTTP error: ${res.status}`, { placeId });
    return null;
  }

  const json = (await res.json()) as {
    status: string;
    result?: {
      opening_hours?: { weekday_text?: string[] };
      formatted_phone_number?: string;
      website?: string;
      rating?: number;
      user_ratings_total?: number;
      price_level?: number;
      photos?: Array<{ photo_reference: string }>;
    };
  };

  if (json.status !== "OK" || !json.result) {
    logger.warn(`Places API returned status "${json.status}"`, { placeId });
    return null;
  }

  const r = json.result;

  return {
    openingHours: r.opening_hours?.weekday_text ?? [],
    phone: r.formatted_phone_number ?? null,
    website: r.website ?? null,
    rating: r.rating ?? null,
    userRatingsTotal: r.user_ratings_total ?? null,
    priceLevel: r.price_level ?? null,
    photoRef: r.photos?.[0]?.photo_reference ?? null,
    lastSyncedAt: Timestamp.now(),
  };
}

// ─── Cache policy: skip if enriched within the last 29 days ───────────────────

const CACHE_MAX_DAYS = 29; // 30-day limit with 1-day buffer

function isStale(lastSyncedAt: Timestamp | undefined): boolean {
  if (!lastSyncedAt) return true;
  const ageMs = Date.now() - lastSyncedAt.toMillis();
  return ageMs > CACHE_MAX_DAYS * 24 * 60 * 60 * 1000;
}

// ─── Cloud Function 1: scheduled daily enrichment ────────────────────────────

export const enrichAllPlaces = onSchedule(
  {
    schedule: "0 4 * * *",
    timeZone: "Europe/London",
    secrets: [GOOGLE_PLACES_API_KEY],
  },
  async () => {
    const apiKey = GOOGLE_PLACES_API_KEY.value();
    if (!apiKey) {
      logger.error("GOOGLE_PLACES_API_KEY secret is not set — aborting.");
      return;
    }

    // Fetch all live spots that have a googlePlaceId
    const spotsSnap = await db
      .collection("spots")
      .where("status", "==", "live")
      .where("googlePlaceId", "!=", null)
      .get();

    logger.info(`enrichAllPlaces: found ${spotsSnap.size} spots with a googlePlaceId`);

    let enriched = 0;
    let skipped = 0;
    let failed = 0;

    for (const spotDoc of spotsSnap.docs) {
      const data = spotDoc.data();
      const existingSyncedAt = data.placeData?.lastSyncedAt as Timestamp | undefined;

      // Respect the 30-day caching policy
      if (!isStale(existingSyncedAt)) {
        skipped++;
        continue;
      }

      const placeId = data.googlePlaceId as string;
      const placeData = await fetchPlaceDetails(placeId, apiKey);

      if (placeData) {
        await spotDoc.ref.update({
          placeData,
          updatedAt: FieldValue.serverTimestamp(),
        });
        enriched++;
      } else {
        failed++;
      }

      // Throttle to avoid hitting API rate limits (10 req/s is the default)
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    logger.info(
      `enrichAllPlaces complete: enriched=${enriched}, skipped=${skipped}, failed=${failed}`
    );
  }
);

// ─── Cloud Function 2: manual single-spot enrichment (callable) ──────────────

export const enrichSingleSpot = onCall(
  { secrets: [GOOGLE_PLACES_API_KEY] },
  async (request) => {
    // Auth check: must be moderator or admin
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const uid = request.auth.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.data()?.role;

    if (role !== "moderator" && role !== "admin") {
      throw new HttpsError("permission-denied", "Admin or moderator role required.");
    }

    const spotId = request.data?.spotId as string | undefined;
    if (!spotId) {
      throw new HttpsError("invalid-argument", "spotId is required.");
    }

    const spotRef = db.collection("spots").doc(spotId);
    const spotSnap = await spotRef.get();

    if (!spotSnap.exists) {
      throw new HttpsError("not-found", "Spot not found.");
    }

    const spotData = spotSnap.data()!;
    const placeId = spotData.googlePlaceId as string | null;

    if (!placeId) {
      throw new HttpsError(
        "failed-precondition",
        "Spot does not have a googlePlaceId."
      );
    }

    const apiKey = GOOGLE_PLACES_API_KEY.value();
    if (!apiKey) {
      throw new HttpsError("internal", "GOOGLE_PLACES_API_KEY is not configured.");
    }

    const placeData = await fetchPlaceDetails(placeId, apiKey);

    if (!placeData) {
      throw new HttpsError("internal", "Failed to fetch data from Google Places API.");
    }

    await spotRef.update({
      placeData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info(`enrichSingleSpot: enriched spot ${spotId} (place: ${placeId})`);

    return { ok: true, placeData };
  }
);
