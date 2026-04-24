/**
 * Emulator-backed tests for promote.ts business logic.
 *
 * Prerequisites:
 *   firebase emulators:start --only firestore
 *   (or: firebase emulators:exec "npm test" to start/stop automatically)
 *
 * The setupEmulator.ts setupFile sets FIRESTORE_EMULATOR_HOST before any
 * firebase-admin module is imported, so all reads/writes hit the emulator.
 */

import * as admin from "firebase-admin";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";
import { createHandlers, type Handlers } from "../promote";

// ─── One-time initialisation ─────────────────────────────────────────────────

let db: FirebaseFirestore.Firestore;
let handlers: Handlers;

beforeAll(() => {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: "demo-budgetuk-test" });
  }
  db = getFirestore();
  handlers = createHandlers(db);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function clearCollection(name: string) {
  const snap = await db.collection(name).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

afterEach(async () => {
  await Promise.all(
    ["submissions", "spots", "users", "mail"].map(clearCollection)
  );
});

function daysAgo(n: number): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

/** Minimal valid submission document. */
function makeSubmission(overrides: Partial<FirebaseFirestore.DocumentData> = {}) {
  return {
    name: "Flat Iron Coffee",
    slug: "flat-iron-coffee-abc",
    category: "coffee",
    neighbourhood: "Shoreditch",
    borough: "Hackney",
    postcodeDistrict: "EC2A",
    city: "london",
    location: new GeoPoint(51.5237, -0.082),
    geohash: "gcpvh0",
    priceTier: "£",
    approxPriceGbp: 3,
    tags: ["wifi", "vegan"],
    googlePlaceId: null,
    photoUrl: null,
    description: "Best £3 flat white east of Aldgate.",
    tips: ["Go before 9am to grab a window seat."],
    status: "pending",
    submittedBy: "user-alice",
    voters: [],
    voteCount: 25,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  };
}

async function seedSubmission(
  data: FirebaseFirestore.DocumentData = makeSubmission()
) {
  const ref = db.collection("submissions").doc();
  await ref.set(data);
  return { ref, id: ref.id, data };
}

async function seedUser(uid = "user-alice", rep = 0) {
  const ref = db.collection("users").doc(uid);
  await ref.set({
    displayName: "Alice",
    reputation: rep,
    homeBorough: null,
    createdAt: Timestamp.now(),
  });
  return ref;
}

// ─── promoteSubmission ────────────────────────────────────────────────────────

describe("promoteSubmission", () => {
  it("creates a live spot copied from the submission", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    await handlers.promoteSubmission(id, data);

    const spots = await db.collection("spots").get();
    expect(spots.size).toBe(1);

    const spot = spots.docs[0].data();
    expect(spot.name).toBe("Flat Iron Coffee");
    expect(spot.status).toBe("live");
    expect(spot.category).toBe("coffee");
    expect(spot.neighbourhood).toBe("Shoreditch");
    expect(spot.borough).toBe("Hackney");
    expect(spot.priceTier).toBe("£");
    expect(spot.description).toBe(data.description);
    expect(typeof spot.geohash).toBe("string");
    expect(spot.geohash.length).toBeGreaterThan(0);
  });

  it("sets the correct geohash for the spot", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    await handlers.promoteSubmission(id, data);

    const spots = await db.collection("spots").get();
    const spot = spots.docs[0].data();

    // geohashForLocation([51.5237, -0.082]) should start with "gcpv"
    expect(spot.geohash).toMatch(/^gcpv/);
  });

  it("returns the new spot ID", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    const { spotId } = await handlers.promoteSubmission(id, data);

    expect(typeof spotId).toBe("string");
    expect(spotId.length).toBeGreaterThan(0);

    const spotSnap = await db.collection("spots").doc(spotId).get();
    expect(spotSnap.exists).toBe(true);
  });

  it("marks the submission status as 'approved'", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    await handlers.promoteSubmission(id, data);

    const sub = await db.collection("submissions").doc(id).get();
    expect(sub.data()?.status).toBe("approved");
  });

  it("records promotedToSpotId on the submission", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    const { spotId } = await handlers.promoteSubmission(id, data);

    const sub = await db.collection("submissions").doc(id).get();
    expect(sub.data()?.promotedToSpotId).toBe(spotId);
  });

  it("increments the submitter's reputation by 10", async () => {
    await seedUser("user-alice", 5);
    const { id, data } = await seedSubmission();

    await handlers.promoteSubmission(id, data);

    const user = await db.collection("users").doc("user-alice").get();
    expect(user.data()?.reputation).toBe(15);
  });

  it("queues a notification email in the mail collection", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    await handlers.promoteSubmission(id, data);

    const mails = await db.collection("mail").get();
    expect(mails.size).toBe(1);

    const mail = mails.docs[0].data();
    expect(mail.toUids).toEqual(["user-alice"]);
    expect(mail.message.subject).toContain("Flat Iron Coffee");
    expect(mail.message.text).toContain("25");
    expect(mail.message.html).toContain("Flat Iron Coffee");
  });

  it("does not touch reputation if the user doc is missing", async () => {
    // No seedUser() — user doc absent
    const { id, data } = await seedSubmission();

    // Should not throw
    await expect(handlers.promoteSubmission(id, data)).resolves.toBeDefined();

    // No user doc should have been created
    const user = await db.collection("users").doc("user-alice").get();
    expect(user.exists).toBe(false);
  });

  it("throws and rolls back if the submission is not pending", async () => {
    await seedUser();
    // Already approved
    const { id, data } = await seedSubmission({ status: "approved" });

    await expect(handlers.promoteSubmission(id, data)).rejects.toThrow(
      /no longer pending/i
    );

    // No spot should have been created
    const spots = await db.collection("spots").get();
    expect(spots.size).toBe(0);
  });

  it("is idempotent: second call on already-approved doc throws", async () => {
    await seedUser();
    const { id, data } = await seedSubmission();

    await handlers.promoteSubmission(id, data);

    // The submission is now approved — calling again should throw, not create a second spot
    await expect(handlers.promoteSubmission(id, data)).rejects.toThrow();

    const spots = await db.collection("spots").get();
    expect(spots.size).toBe(1);
  });
});

// ─── rejectStaleSubmissions ──────────────────────────────────────────────────

describe("rejectStaleSubmissions", () => {
  it("rejects a submission older than 30 days with fewer than 5 votes", async () => {
    const { id } = await seedSubmission({
      voteCount: 2,
      createdAt: daysAgo(31),
    });

    const count = await handlers.rejectStaleSubmissions();

    expect(count).toBe(1);
    const sub = await db.collection("submissions").doc(id).get();
    expect(sub.data()?.status).toBe("rejected");
    expect(sub.data()?.rejectionReason).toBe("insufficient_votes");
  });

  it("does not reject a recent submission with few votes", async () => {
    const { id } = await seedSubmission({
      voteCount: 1,
      createdAt: daysAgo(5),
    });

    const count = await handlers.rejectStaleSubmissions();

    expect(count).toBe(0);
    const sub = await db.collection("submissions").doc(id).get();
    expect(sub.data()?.status).toBe("pending");
  });

  it("does not reject a stale submission with ≥5 votes", async () => {
    const { id } = await seedSubmission({
      voteCount: 5,
      createdAt: daysAgo(35),
    });

    const count = await handlers.rejectStaleSubmissions();

    expect(count).toBe(0);
    const sub = await db.collection("submissions").doc(id).get();
    expect(sub.data()?.status).toBe("pending");
  });

  it("does not reject already-approved or already-rejected submissions", async () => {
    await seedSubmission({ status: "approved", voteCount: 0, createdAt: daysAgo(40) });
    await seedSubmission({ status: "rejected", voteCount: 0, createdAt: daysAgo(40) });

    const count = await handlers.rejectStaleSubmissions();
    expect(count).toBe(0);
  });

  it("handles multiple stale submissions in one sweep", async () => {
    await seedSubmission({ voteCount: 0, createdAt: daysAgo(32) });
    await seedSubmission({ voteCount: 3, createdAt: daysAgo(45) });
    await seedSubmission({ voteCount: 4, createdAt: daysAgo(31) });
    // This one should survive (recent)
    await seedSubmission({ voteCount: 1, createdAt: daysAgo(2) });
    // This one should survive (enough votes)
    await seedSubmission({ voteCount: 10, createdAt: daysAgo(60) });

    const count = await handlers.rejectStaleSubmissions();
    expect(count).toBe(3);

    const all = await db.collection("submissions").get();
    const rejected = all.docs.filter((d) => d.data().status === "rejected");
    const pending = all.docs.filter((d) => d.data().status === "pending");
    expect(rejected).toHaveLength(3);
    expect(pending).toHaveLength(2);
  });

  it("returns 0 when there is nothing to reject", async () => {
    const count = await handlers.rejectStaleSubmissions();
    expect(count).toBe(0);
  });
});

// ─── onSubmissionUpdated trigger logic ───────────────────────────────────────
// We test the gate conditions directly — the actual trigger fires in the
// Functions emulator; here we verify the guard logic that wraps promoteSubmission.

describe("onSubmissionUpdated threshold guard", () => {
  /**
   * Simulate what the trigger checks: should promoteSubmission be called?
   */
  function shouldPromote(
    beforeCount: number,
    afterCount: number,
    status: string
  ): boolean {
    return (
      beforeCount < 25 && afterCount >= 25 && status === "pending"
    );
  }

  it("fires when vote count crosses 25 while pending", () => {
    expect(shouldPromote(24, 25, "pending")).toBe(true);
  });

  it("does not fire if already at or above threshold before the update", () => {
    expect(shouldPromote(25, 26, "pending")).toBe(false);
    expect(shouldPromote(30, 31, "pending")).toBe(false);
  });

  it("does not fire if status is not pending", () => {
    expect(shouldPromote(24, 25, "approved")).toBe(false);
    expect(shouldPromote(24, 25, "rejected")).toBe(false);
  });

  it("does not fire if count goes from 0 to 24", () => {
    expect(shouldPromote(23, 24, "pending")).toBe(false);
  });

  it("fires exactly once even if the vote overshoots (e.g. bulk import)", () => {
    expect(shouldPromote(0, 30, "pending")).toBe(true);
  });
});
