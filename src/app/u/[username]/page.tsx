import { notFound } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { SpotCard } from "@/components/features/SpotCard";
import type { Spot, User } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

function ReputationBadge({ rep }: { rep: number }) {
  let label: string;
  let cls: string;

  if (rep >= 500) {
    label = "Legend";
    cls = "bg-amber-100 text-amber-800 border border-amber-300";
  } else if (rep >= 200) {
    label = "Curator";
    cls = "bg-purple-100 text-purple-800 border border-purple-300";
  } else if (rep >= 50) {
    label = "Local";
    cls = "bg-green-100 text-green-800 border border-green-300";
  } else if (rep >= 10) {
    label = "Regular";
    cls = "bg-blue-100 text-blue-800 border border-blue-300";
  } else {
    label = "Newcomer";
    cls = "bg-[var(--hover-tint)] text-[#1c1c1c]";
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const uid = decodeURIComponent(username);

  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) notFound();

  const userData = userDoc.data() as User & { favouritesPublic?: boolean };
  const rep = userData.reputation ?? 0;

  // Fetch all spots submitted by this user, filter live ones in JS to avoid composite index
  const spotsSnap = await adminDb
    .collection("spots")
    .where("submittedBy", "==", uid)
    .get();
  const spots = spotsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Spot))
    .filter((s) => s.status === "live")
    .sort((a, b) => (b.createdAt as any).toMillis() - (a.createdAt as any).toMillis());

  // Fetch favourites only when the user has made them public
  let favourites: Spot[] = [];
  if (userData.favouritesPublic) {
    const favSnap = await adminDb.collection(`favourites/${uid}/items`).get();
    const fetched = await Promise.all(
      favSnap.docs.map((d) => adminDb.collection("spots").doc(d.id).get())
    );
    favourites = fetched
      .filter((d) => d.exists && d.data()?.status === "live")
      .map((d) => ({ id: d.id, ...d.data() } as Spot));
  }

  const joinDate = userData.createdAt
    ? new Date((userData.createdAt as any).toDate()).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  const slugify = (text: string) => encodeURIComponent(text.toLowerCase().replace(/\s+/g, "-"));

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col gap-12">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <img
            src={
              userData.photoUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName || "U")}&background=1c1c1c&color=fcfbf8`
            }
            alt={userData.displayName}
            className="w-20 h-20 rounded-full object-cover bg-passive border border-passive shrink-0"
          />
          <div className="flex flex-col gap-2">
            <h1 className="t-h2 text-[#1c1c1c]">{userData.displayName}</h1>
            <div className="flex items-center flex-wrap gap-2">
              <ReputationBadge rep={rep} />
              <span className="text-[13px] text-[#5f5f5d]">{rep} rep</span>
              {userData.homeBorough && (
                <span className="text-[13px] text-[#5f5f5d]">· {userData.homeBorough}</span>
              )}
              {joinDate && (
                <span className="text-[13px] text-[#5f5f5d]">· Joined {joinDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Live spots */}
        <section className="flex flex-col gap-6">
          <h2 className="t-h3 text-[#1c1c1c]">
            Spots added{" "}
            <span className="text-[#5f5f5d] font-normal text-[16px]">({spots.length})</span>
          </h2>
          {spots.length === 0 ? (
            <p className="text-[14px] text-[#5f5f5d]">No live spots added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {spots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/${spot.city || "london"}/${slugify(spot.neighbourhood)}/${spot.slug}`}
                  className="block"
                >
                  <SpotCard spot={spot} showDistance={false} />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Public favourites */}
        {userData.favouritesPublic && (
          <section className="flex flex-col gap-6">
            <h2 className="t-h3 text-[#1c1c1c]">
              Favourites{" "}
              <span className="text-[#5f5f5d] font-normal text-[16px]">({favourites.length})</span>
            </h2>
            {favourites.length === 0 ? (
              <p className="text-[14px] text-[#5f5f5d]">No favourites shared yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favourites.map((spot) => (
                  <Link
                    key={spot.id}
                    href={`/${spot.city || "london"}/${slugify(spot.neighbourhood)}/${spot.slug}`}
                    className="block"
                  >
                    <SpotCard spot={spot} showDistance={false} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
