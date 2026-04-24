import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

if (!getApps().length) initializeApp();

const db = getFirestore();

interface Entry {
  uid: string;
  displayName: string;
  photoUrl: string | null;
  reputation: number;
  liveCount: number;
}

export const aggregateLeaderboard = onSchedule(
  { schedule: "0 3 * * *", timeZone: "Europe/London" },
  async () => {
    const now = new Date();
    const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // One read for all live spots; split into all-time and monthly counts in JS
    const allSpotsSnap = await db.collection("spots").where("status", "==", "live").get();

    const allTimeCounts = new Map<string, number>();
    const monthlyCounts = new Map<string, number>();

    for (const spotDoc of allSpotsSnap.docs) {
      const data = spotDoc.data();
      const uid = data.submittedBy as string;
      if (!uid) continue;
      const createdAt: Date | undefined = data.createdAt?.toDate?.();

      allTimeCounts.set(uid, (allTimeCounts.get(uid) ?? 0) + 1);
      if (createdAt && createdAt >= startOfMonth) {
        monthlyCounts.set(uid, (monthlyCounts.get(uid) ?? 0) + 1);
      }
    }

    // All-time: top 50 users by total reputation
    const topUsersSnap = await db
      .collection("users")
      .orderBy("reputation", "desc")
      .limit(50)
      .get();

    const allTimeEntries: Entry[] = topUsersSnap.docs.map((d) => ({
      uid: d.id,
      displayName: (d.data().displayName as string) || "Anonymous",
      photoUrl: (d.data().photoUrl as string) || null,
      reputation: (d.data().reputation as number) || 0,
      liveCount: allTimeCounts.get(d.id) ?? 0,
    }));

    // Monthly: top 50 by spots contributed this month
    const monthlyUids = Array.from(monthlyCounts.keys());
    const monthlyUserDocs = await Promise.all(
      monthlyUids.map((uid) => db.collection("users").doc(uid).get())
    );

    const monthlyEntries: Entry[] = monthlyUserDocs
      .filter((d) => d.exists)
      .map((d) => ({
        uid: d.id,
        displayName: (d.data()!.displayName as string) || "Anonymous",
        photoUrl: (d.data()!.photoUrl as string) || null,
        reputation: (d.data()!.reputation as number) || 0,
        liveCount: monthlyCounts.get(d.id) ?? 0,
      }))
      .sort((a, b) => b.liveCount - a.liveCount || b.reputation - a.reputation)
      .slice(0, 50);

    await Promise.all([
      db.collection("leaderboard").doc("alltime").set({
        entries: allTimeEntries,
        computedAt: FieldValue.serverTimestamp(),
      }),
      db.collection("leaderboard").doc(monthId).set({
        entries: monthlyEntries,
        computedAt: FieldValue.serverTimestamp(),
      }),
    ]);

    logger.info(
      `Leaderboard aggregated: alltime=${allTimeEntries.length}, monthly=${monthlyEntries.length} (${monthId})`
    );
  }
);
