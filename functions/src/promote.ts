import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp, getApps } from "firebase-admin/app";
import {
  getFirestore,
  FieldValue,
  type Firestore,
  type DocumentData,
} from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";
import { logger } from "firebase-functions";

if (!getApps().length) initializeApp();

// ─── Constants ────────────────────────────────────────────────────────────────

const VOTE_THRESHOLD = 25;
const STALE_DAYS = 30;
const STALE_VOTE_MIN = 5;

// ─── Business logic (injectable for tests) ───────────────────────────────────

export interface Handlers {
  promoteSubmission(
    submissionId: string,
    data: DocumentData
  ): Promise<{ spotId: string }>;
  rejectStaleSubmissions(): Promise<number>;
}

export function createHandlers(db: Firestore): Handlers {
  async function promoteSubmission(
    submissionId: string,
    data: DocumentData
  ): Promise<{ spotId: string }> {
    const loc = data.location as { latitude: number; longitude: number };
    const geohash = geohashForLocation([loc.latitude, loc.longitude]);

    const spotRef = db.collection("spots").doc();
    const submissionRef = db.collection("submissions").doc(submissionId);
    const userRef = db.collection("users").doc(data.submittedBy as string);
    const mailRef = db.collection("mail").doc();

    await db.runTransaction(async (t) => {
      const [userSnap, submissionSnap] = await Promise.all([
        t.get(userRef),
        t.get(submissionRef),
      ]);

      // Guard: re-check status inside transaction to prevent races
      if (!submissionSnap.exists || submissionSnap.data()?.status !== "pending") {
        throw new Error("Submission is no longer pending — skipping promotion.");
      }

      // Copy submission fields into the live spots collection
      t.set(spotRef, {
        name: data.name,
        slug: data.slug,
        category: data.category,
        neighbourhood: data.neighbourhood,
        borough: data.borough ?? "",
        postcodeDistrict: data.postcodeDistrict ?? "",
        city: data.city ?? "london",
        location: data.location,
        geohash,
        priceTier: data.priceTier,
        approxPriceGbp: data.approxPriceGbp ?? null,
        tags: data.tags ?? [],
        googlePlaceId: data.googlePlaceId ?? null,
        photoUrl: data.photoUrl ?? null,
        description: data.description,
        tips: data.tips ?? [],
        status: "live",
        submittedBy: data.submittedBy,
        voteCount: 0,
        createdAt: data.createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Mark submission approved and record which spot it became
      t.update(submissionRef, {
        status: "approved",
        promotedToSpotId: spotRef.id,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Reputation +10 for the submitter (only if their user doc exists)
      if (userSnap.exists) {
        t.update(userRef, { reputation: FieldValue.increment(10) });
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
              <strong>${data.name as string}</strong> has reached
              <strong>${VOTE_THRESHOLD} community votes</strong> and is now
              featured on the BudgetUK map.
            </p>
            <p>Thanks for contributing to the community!</p>
          `.trim(),
        },
      });
    });

    logger.info(`Promoted submission ${submissionId} → spot ${spotRef.id}`);
    return { spotId: spotRef.id };
  }

  async function rejectStaleSubmissions(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - STALE_DAYS);

    // Firestore does not allow range filters on two different fields in the
    // same query, so we filter by createdAt server-side and voteCount in code.
    const staleSnap = await db
      .collection("submissions")
      .where("status", "==", "pending")
      .where("createdAt", "<", cutoff)
      .get();

    const toReject = staleSnap.docs.filter(
      (d) => (d.data().voteCount ?? 0) < STALE_VOTE_MIN
    );

    if (toReject.length === 0) {
      logger.info("rejectStale: nothing to reject");
      return 0;
    }

    // Batch writes (max 500 per batch; fine for typical stale counts)
    const batch = db.batch();
    toReject.forEach((doc) => {
      batch.update(doc.ref, {
        status: "rejected",
        rejectionReason: "insufficient_votes",
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    logger.info(`rejectStale: rejected ${toReject.length} submissions`);
    return toReject.length;
  }

  return { promoteSubmission, rejectStaleSubmissions };
}

// ─── Singleton used by the Cloud Function triggers ────────────────────────────

const handlers = createHandlers(getFirestore());

// ─── Cloud Function 1: promote on vote threshold ─────────────────────────────

export const onSubmissionUpdated = onDocumentUpdated(
  "submissions/{submissionId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const crossedThreshold =
      before.voteCount < VOTE_THRESHOLD &&
      after.voteCount >= VOTE_THRESHOLD &&
      after.status === "pending";

    if (!crossedThreshold) return;

    try {
      const { spotId } = await handlers.promoteSubmission(
        event.params.submissionId,
        after
      );
      logger.info(`onSubmissionUpdated: promoted to spot ${spotId}`);
    } catch (err) {
      logger.error("onSubmissionUpdated: promotion failed", {
        submissionId: event.params.submissionId,
        err,
      });
      throw err; // causes Firebase to retry the function
    }
  }
);

// ─── Cloud Function 2: daily auto-reject sweep ───────────────────────────────

export const autoRejectStale = onSchedule(
  { schedule: "every 24 hours", timeZone: "UTC" },
  async () => {
    await handlers.rejectStaleSubmissions();
  }
);
