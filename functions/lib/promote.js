"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoRejectStale = exports.onSubmissionUpdated = void 0;
exports.createHandlers = createHandlers;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const app_1 = require("firebase-admin/app");
const firestore_2 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
const firebase_functions_1 = require("firebase-functions");
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
// ─── Constants ────────────────────────────────────────────────────────────────
const VOTE_THRESHOLD = 25;
const STALE_DAYS = 30;
const STALE_VOTE_MIN = 5;
function createHandlers(db) {
    async function promoteSubmission(submissionId, data) {
        const loc = data.location;
        const geohash = (0, geofire_common_1.geohashForLocation)([loc.latitude, loc.longitude]);
        const spotRef = db.collection("spots").doc();
        const submissionRef = db.collection("submissions").doc(submissionId);
        const userRef = db.collection("users").doc(data.submittedBy);
        const mailRef = db.collection("mail").doc();
        await db.runTransaction(async (t) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const [userSnap, submissionSnap] = await Promise.all([
                t.get(userRef),
                t.get(submissionRef),
            ]);
            // Guard: re-check status inside transaction to prevent races
            if (!submissionSnap.exists || ((_a = submissionSnap.data()) === null || _a === void 0 ? void 0 : _a.status) !== "pending") {
                throw new Error("Submission is no longer pending — skipping promotion.");
            }
            // Copy submission fields into the live spots collection
            t.set(spotRef, {
                name: data.name,
                slug: data.slug,
                category: data.category,
                neighbourhood: data.neighbourhood,
                borough: (_b = data.borough) !== null && _b !== void 0 ? _b : "",
                postcodeDistrict: (_c = data.postcodeDistrict) !== null && _c !== void 0 ? _c : "",
                city: (_d = data.city) !== null && _d !== void 0 ? _d : "london",
                location: data.location,
                geohash,
                priceTier: data.priceTier,
                approxPriceGbp: (_e = data.approxPriceGbp) !== null && _e !== void 0 ? _e : null,
                tags: (_f = data.tags) !== null && _f !== void 0 ? _f : [],
                googlePlaceId: (_g = data.googlePlaceId) !== null && _g !== void 0 ? _g : null,
                photoUrl: (_h = data.photoUrl) !== null && _h !== void 0 ? _h : null,
                description: data.description,
                tips: (_j = data.tips) !== null && _j !== void 0 ? _j : [],
                status: "live",
                submittedBy: data.submittedBy,
                voteCount: 0,
                createdAt: data.createdAt,
                updatedAt: firestore_2.FieldValue.serverTimestamp(),
            });
            // Mark submission approved and record which spot it became
            t.update(submissionRef, {
                status: "approved",
                promotedToSpotId: spotRef.id,
                updatedAt: firestore_2.FieldValue.serverTimestamp(),
            });
            // Reputation +10 for the submitter (only if their user doc exists)
            if (userSnap.exists) {
                t.update(userRef, { reputation: firestore_2.FieldValue.increment(10) });
            }
            // Queue a notification via the Firebase Trigger Email extension.
            // The extension watches the `mail` collection and sends via the
            // configured provider. `toUids` lets it look up the email from Auth.
            t.set(mailRef, {
                toUids: [data.submittedBy],
                message: {
                    subject: `🎉 "${data.name}" is now live on BudgetUK!`,
                    text: [
                        `Great news! Your spot "${data.name}" has reached ${VOTE_THRESHOLD} community votes`,
                        `and is now live on the BudgetUK map.`,
                        ``,
                        `Thanks for contributing to the community!`,
                    ].join("\n"),
                    html: `
            <h2>Your spot is live! 🎉</h2>
            <p>
              <strong>${data.name}</strong> has reached
              <strong>${VOTE_THRESHOLD} community votes</strong> and is now
              featured on the BudgetUK map.
            </p>
            <p>Thanks for contributing to the community!</p>
          `.trim(),
                },
            });
        });
        firebase_functions_1.logger.info(`Promoted submission ${submissionId} → spot ${spotRef.id}`);
        return { spotId: spotRef.id };
    }
    async function rejectStaleSubmissions() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - STALE_DAYS);
        // Firestore does not allow range filters on two different fields in the
        // same query, so we filter by createdAt server-side and voteCount in code.
        const staleSnap = await db
            .collection("submissions")
            .where("status", "==", "pending")
            .where("createdAt", "<", cutoff)
            .get();
        const toReject = staleSnap.docs.filter((d) => { var _a; return ((_a = d.data().voteCount) !== null && _a !== void 0 ? _a : 0) < STALE_VOTE_MIN; });
        if (toReject.length === 0) {
            firebase_functions_1.logger.info("rejectStale: nothing to reject");
            return 0;
        }
        // Batch writes (max 500 per batch; fine for typical stale counts)
        const batch = db.batch();
        toReject.forEach((doc) => {
            batch.update(doc.ref, {
                status: "rejected",
                rejectionReason: "insufficient_votes",
                updatedAt: firestore_2.FieldValue.serverTimestamp(),
            });
        });
        await batch.commit();
        firebase_functions_1.logger.info(`rejectStale: rejected ${toReject.length} submissions`);
        return toReject.length;
    }
    return { promoteSubmission, rejectStaleSubmissions };
}
// ─── Singleton used by the Cloud Function triggers ────────────────────────────
const handlers = createHandlers((0, firestore_2.getFirestore)());
// ─── Cloud Function 1: promote on vote threshold ─────────────────────────────
exports.onSubmissionUpdated = (0, firestore_1.onDocumentUpdated)("submissions/{submissionId}", async (event) => {
    var _a, _b;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after)
        return;
    const crossedThreshold = before.voteCount < VOTE_THRESHOLD &&
        after.voteCount >= VOTE_THRESHOLD &&
        after.status === "pending";
    if (!crossedThreshold)
        return;
    try {
        const { spotId } = await handlers.promoteSubmission(event.params.submissionId, after);
        firebase_functions_1.logger.info(`onSubmissionUpdated: promoted to spot ${spotId}`);
    }
    catch (err) {
        firebase_functions_1.logger.error("onSubmissionUpdated: promotion failed", {
            submissionId: event.params.submissionId,
            err,
        });
        throw err; // causes Firebase to retry the function
    }
});
// ─── Cloud Function 2: daily auto-reject sweep ───────────────────────────────
exports.autoRejectStale = (0, scheduler_1.onSchedule)({ schedule: "every 24 hours", timeZone: "UTC" }, async () => {
    await handlers.rejectStaleSubmissions();
});
//# sourceMappingURL=promote.js.map