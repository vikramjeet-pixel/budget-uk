import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import type { Spot } from "@/types";
import { FreePageClient } from "./FreePageClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Free in London",
  description:
    "Free museums, parks, walks, markets, and cultural events in London — plus community-submitted free spots.",
  alternates: { canonical: "/free" },
  openGraph: {
    title: "Free in London",
    description: "Free museums, parks, walks, markets, and cultural events in London.",
    url: "/free",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free in London",
    description: "Free museums, parks, walks, markets, and cultural events in London.",
  },
};

export default async function FreePage() {
  let spots: Spot[] = [];
  try {
    const snap = await adminDb
      .collection("spots")
      .where("status", "==", "live")
      .where("priceTier", "==", "free")
      .orderBy("voteCount", "desc")
      .limit(100)
      .get();
    spots = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Spot));
  } catch {
    // Non-fatal: editorial content renders regardless
  }

  return <FreePageClient spots={spots} />;
}
