"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateLeaderboard = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_functions_1 = require("firebase-functions");
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
exports.aggregateLeaderboard = (0, scheduler_1.onSchedule)({ schedule: "0 3 * * *", timeZone: "Europe/London" }, async () => {
    var _a, _b, _c, _d;
    const now = new Date();
    const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // One read for all live spots; split into all-time and monthly counts in JS
    const allSpotsSnap = await db.collection("spots").where("status", "==", "live").get();
    const allTimeCounts = new Map();
    const monthlyCounts = new Map();
    for (const spotDoc of allSpotsSnap.docs) {
        const data = spotDoc.data();
        const uid = data.submittedBy;
        if (!uid)
            continue;
        const createdAt = (_b = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a);
        allTimeCounts.set(uid, ((_c = allTimeCounts.get(uid)) !== null && _c !== void 0 ? _c : 0) + 1);
        if (createdAt && createdAt >= startOfMonth) {
            monthlyCounts.set(uid, ((_d = monthlyCounts.get(uid)) !== null && _d !== void 0 ? _d : 0) + 1);
        }
    }
    // All-time: top 50 users by total reputation
    const topUsersSnap = await db
        .collection("users")
        .orderBy("reputation", "desc")
        .limit(50)
        .get();
    const allTimeEntries = topUsersSnap.docs.map((d) => {
        var _a;
        return ({
            uid: d.id,
            displayName: d.data().displayName || "Anonymous",
            photoUrl: d.data().photoUrl || null,
            reputation: d.data().reputation || 0,
            liveCount: (_a = allTimeCounts.get(d.id)) !== null && _a !== void 0 ? _a : 0,
        });
    });
    // Monthly: top 50 by spots contributed this month
    const monthlyUids = Array.from(monthlyCounts.keys());
    const monthlyUserDocs = await Promise.all(monthlyUids.map((uid) => db.collection("users").doc(uid).get()));
    const monthlyEntries = monthlyUserDocs
        .filter((d) => d.exists)
        .map((d) => {
        var _a;
        return ({
            uid: d.id,
            displayName: d.data().displayName || "Anonymous",
            photoUrl: d.data().photoUrl || null,
            reputation: d.data().reputation || 0,
            liveCount: (_a = monthlyCounts.get(d.id)) !== null && _a !== void 0 ? _a : 0,
        });
    })
        .sort((a, b) => b.liveCount - a.liveCount || b.reputation - a.reputation)
        .slice(0, 50);
    await Promise.all([
        db.collection("leaderboard").doc("alltime").set({
            entries: allTimeEntries,
            computedAt: firestore_1.FieldValue.serverTimestamp(),
        }),
        db.collection("leaderboard").doc(monthId).set({
            entries: monthlyEntries,
            computedAt: firestore_1.FieldValue.serverTimestamp(),
        }),
    ]);
    firebase_functions_1.logger.info(`Leaderboard aggregated: alltime=${allTimeEntries.length}, monthly=${monthlyEntries.length} (${monthId})`);
});
//# sourceMappingURL=leaderboard.js.map