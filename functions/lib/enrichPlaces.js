"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichSingleSpot = exports.enrichAllPlaces = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_functions_1 = require("firebase-functions");
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const GOOGLE_PLACES_API_KEY = (0, params_1.defineSecret)("GOOGLE_PLACES_API_KEY");
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
async function fetchPlaceDetails(placeId, apiKey) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", PLACES_FIELDS);
    url.searchParams.set("key", apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) {
        firebase_functions_1.logger.error(`Places API HTTP error: ${res.status}`, { placeId });
        return null;
    }
    const json = (await res.json());
    if (json.status !== "OK" || !json.result) {
        firebase_functions_1.logger.warn(`Places API returned status "${json.status}"`, { placeId });
        return null;
    }
    const r = json.result;
    return {
        openingHours: (_b = (_a = r.opening_hours) === null || _a === void 0 ? void 0 : _a.weekday_text) !== null && _b !== void 0 ? _b : [],
        phone: (_c = r.formatted_phone_number) !== null && _c !== void 0 ? _c : null,
        website: (_d = r.website) !== null && _d !== void 0 ? _d : null,
        rating: (_e = r.rating) !== null && _e !== void 0 ? _e : null,
        userRatingsTotal: (_f = r.user_ratings_total) !== null && _f !== void 0 ? _f : null,
        priceLevel: (_g = r.price_level) !== null && _g !== void 0 ? _g : null,
        photoRef: (_k = (_j = (_h = r.photos) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.photo_reference) !== null && _k !== void 0 ? _k : null,
        lastSyncedAt: firestore_1.Timestamp.now(),
    };
}
// ─── Cache policy: skip if enriched within the last 29 days ───────────────────
const CACHE_MAX_DAYS = 29; // 30-day limit with 1-day buffer
function isStale(lastSyncedAt) {
    if (!lastSyncedAt)
        return true;
    const ageMs = Date.now() - lastSyncedAt.toMillis();
    return ageMs > CACHE_MAX_DAYS * 24 * 60 * 60 * 1000;
}
// ─── Cloud Function 1: scheduled daily enrichment ────────────────────────────
exports.enrichAllPlaces = (0, scheduler_1.onSchedule)({
    schedule: "0 4 * * *",
    timeZone: "Europe/London",
    secrets: [GOOGLE_PLACES_API_KEY],
}, async () => {
    var _a;
    const apiKey = GOOGLE_PLACES_API_KEY.value();
    if (!apiKey) {
        firebase_functions_1.logger.error("GOOGLE_PLACES_API_KEY secret is not set — aborting.");
        return;
    }
    // Fetch all live spots that have a googlePlaceId
    const spotsSnap = await db
        .collection("spots")
        .where("status", "==", "live")
        .where("googlePlaceId", "!=", null)
        .get();
    firebase_functions_1.logger.info(`enrichAllPlaces: found ${spotsSnap.size} spots with a googlePlaceId`);
    let enriched = 0;
    let skipped = 0;
    let failed = 0;
    for (const spotDoc of spotsSnap.docs) {
        const data = spotDoc.data();
        const existingSyncedAt = (_a = data.placeData) === null || _a === void 0 ? void 0 : _a.lastSyncedAt;
        // Respect the 30-day caching policy
        if (!isStale(existingSyncedAt)) {
            skipped++;
            continue;
        }
        const placeId = data.googlePlaceId;
        const placeData = await fetchPlaceDetails(placeId, apiKey);
        if (placeData) {
            await spotDoc.ref.update({
                placeData,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            enriched++;
        }
        else {
            failed++;
        }
        // Throttle to avoid hitting API rate limits (10 req/s is the default)
        await new Promise((resolve) => setTimeout(resolve, 120));
    }
    firebase_functions_1.logger.info(`enrichAllPlaces complete: enriched=${enriched}, skipped=${skipped}, failed=${failed}`);
});
// ─── Cloud Function 2: manual single-spot enrichment (callable) ──────────────
exports.enrichSingleSpot = (0, https_1.onCall)({ secrets: [GOOGLE_PLACES_API_KEY] }, async (request) => {
    var _a, _b;
    // Auth check: must be moderator or admin
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = request.auth.uid;
    const userDoc = await db.collection("users").doc(uid).get();
    const role = (_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role;
    if (role !== "moderator" && role !== "admin") {
        throw new https_1.HttpsError("permission-denied", "Admin or moderator role required.");
    }
    const spotId = (_b = request.data) === null || _b === void 0 ? void 0 : _b.spotId;
    if (!spotId) {
        throw new https_1.HttpsError("invalid-argument", "spotId is required.");
    }
    const spotRef = db.collection("spots").doc(spotId);
    const spotSnap = await spotRef.get();
    if (!spotSnap.exists) {
        throw new https_1.HttpsError("not-found", "Spot not found.");
    }
    const spotData = spotSnap.data();
    const placeId = spotData.googlePlaceId;
    if (!placeId) {
        throw new https_1.HttpsError("failed-precondition", "Spot does not have a googlePlaceId.");
    }
    const apiKey = GOOGLE_PLACES_API_KEY.value();
    if (!apiKey) {
        throw new https_1.HttpsError("internal", "GOOGLE_PLACES_API_KEY is not configured.");
    }
    const placeData = await fetchPlaceDetails(placeId, apiKey);
    if (!placeData) {
        throw new https_1.HttpsError("internal", "Failed to fetch data from Google Places API.");
    }
    await spotRef.update({
        placeData,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    firebase_functions_1.logger.info(`enrichSingleSpot: enriched spot ${spotId} (place: ${placeId})`);
    return { ok: true, placeData };
});
//# sourceMappingURL=enrichPlaces.js.map