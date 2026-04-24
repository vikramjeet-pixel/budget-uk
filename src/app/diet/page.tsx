import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import type { Spot } from "@/types";
import { DIET_TABS, DEFAULT_TAB_ID } from "@/data/diet";
import { DietPageClient } from "./DietPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { tab } = await searchParams;
  const activeTab = DIET_TABS.find((t) => t.id === tab) ?? DIET_TABS.find((t) => t.id === DEFAULT_TAB_ID)!;
  const canonicalUrl = `https://budgetuk.io/diet?tab=${activeTab.id}`;

  return {
    title: `${activeTab.label} London | BudgetUK`,
    description: activeTab.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-GB": canonicalUrl,
      },
    },
  };
}

export default async function DietPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  const activeTab = DIET_TABS.find((t) => t.id === tab) ?? DIET_TABS.find((t) => t.id === DEFAULT_TAB_ID)!;

  let spots: Spot[] = [];
  try {
    const snap = await adminDb
      .collection("spots")
      .where("tags", "array-contains", activeTab.tag)
      .orderBy("voteCount", "desc")
      .limit(100)
      .get();
    spots = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Spot))
      .filter((s) => s.status === "live");
  } catch {
    // Non-fatal: renders with empty list
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${activeTab.label} restaurants in London`,
    description: activeTab.metaDescription,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 20).map((spot, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "FoodEstablishment",
        name: spot.name,
        description: spot.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: spot.neighbourhood,
          addressRegion: "London",
          addressCountry: "GB",
        },
        url: `https://budgetuk.io/london/${encodeURIComponent(spot.neighbourhood.toLowerCase())}/${spot.slug}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DietPageClient activeTab={activeTab} spots={spots} />
    </>
  );
}
