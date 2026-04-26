import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import type { Spot } from "@/types";
import { FreePageClient } from "./FreePageClient";
import { CITIES } from "@/data/cities";
import { ComingSoon } from "@/components/features/ComingSoon";

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
  let spots: Spot[] = [];
  
  try {
    const snap = await adminDb
      .collection("spots")
      .where("city", "==", citySlug.toLowerCase())
      .where("status", "==", "live")
      .where("priceTier", "==", "free")
      .orderBy("voteCount", "desc")
      .limit(100)
      .get();
    spots = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Spot));
  } catch (err) {
    console.error("FreePage data fetch error:", err);
  }

  if (spots.length === 0) {
    return <ComingSoon cityName={cityName} citySlug={citySlug} />;
  }

  return <FreePageClient spots={spots} citySlug={citySlug} />;
}
