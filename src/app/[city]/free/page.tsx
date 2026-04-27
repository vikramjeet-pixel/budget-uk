import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import type { SerializedSpot } from "@/types";
import { FreePageClient } from "./FreePageClient";
import { CITIES } from "@/data/cities";
import { ComingSoon } from "@/components/features/ComingSoon";
import { FREE_SECTIONS } from "@/data/freeLondon";

function serializeSpot(doc: FirebaseFirestore.QueryDocumentSnapshot): SerializedSpot {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    location: {
      latitude: data.location?._latitude ?? data.location?.latitude ?? 0,
      longitude: data.location?._longitude ?? data.location?.longitude ?? 0,
    },
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : String(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
  } as SerializedSpot;
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const cityName = CITIES.find(c => c.slug === city.toLowerCase())?.name || city;
  
  return {
    title: `Free in ${cityName}`,
    description: `Free museums, parks, walks, markets, and cultural events in ${cityName} — plus community-submitted free spots.`,
    alternates: { canonical: `/${city}/free` },
  };
}

export const revalidate = 3600;

export default async function FreePage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const cityName = CITIES.find(c => c.slug === citySlug.toLowerCase())?.name || citySlug;
  let spots: SerializedSpot[] = [];

  try {
    const snap = await adminDb
      .collection("spots")
      .where("city", "==", citySlug.toLowerCase())
      .where("status", "==", "live")
      .where("priceTier", "==", "free")
      .orderBy("voteCount", "desc")
      .limit(100)
      .get();
    spots = snap.docs.map(serializeSpot);
  } catch (err) {
    console.error("FreePage data fetch error:", err);
  }

  // Show ComingSoon only if there's no editorial content AND no community spots for this city
  const hasEditorial = FREE_SECTIONS.length > 0 && citySlug.toLowerCase() === "london";
  if (spots.length === 0 && !hasEditorial) {
    return <ComingSoon cityName={cityName} citySlug={citySlug} />;
  }

  return <FreePageClient spots={spots} citySlug={citySlug} />;
}
