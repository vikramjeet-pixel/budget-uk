import { adminDb } from "@/lib/firebase/admin";
import { LeaderboardTabs } from "./LeaderboardTabs";

// Leaderboard docs are written once per day by the Cloud Function;
// revalidate every hour so ISR picks up same-day re-runs without stale serving.
export const revalidate = 3600;

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoUrl: string | null;
  reputation: number;
  liveCount: number;
}

async function getEntries(docId: string): Promise<LeaderboardEntry[]> {
  try {
    const snap = await adminDb.collection("leaderboard").doc(docId).get();
    if (!snap.exists) return [];
    return (snap.data()?.entries ?? []) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export default async function LeaderboardPage() {
  const now = new Date();
  const monthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const [allTime, monthly] = await Promise.all([
    getEntries("alltime"),
    getEntries(monthId),
  ]);

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-20 mt-16">
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter">Leaderboard</h1>
          <p className="t-body text-[#5f5f5d]">
            The top contributors to the BudgetUK community. Updated daily.
          </p>
        </div>
        <LeaderboardTabs allTime={allTime} monthly={monthly} monthLabel={monthLabel} />
      </main>
    </div>
  );
}
