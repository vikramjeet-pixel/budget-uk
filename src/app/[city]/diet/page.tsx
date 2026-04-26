import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";
import type { Spot } from "@/types";
import { DIET_TABS, DEFAULT_TAB_ID } from "@/data/diet";
import { DietPageClient } from "./DietPageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const { tab } = await searchParams;
  const activeTab = DIET_TABS.find((t) => t.id === tab) ?? DIET_TABS.find((t) => t.id === DEFAULT_TAB_ID)!;
  const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
  const canonicalUrl = `https://budgetuk.io/${citySlug}/diet?tab=${activeTab.id}`;

  return {
    title: `${activeTab.label} in ${cityName} | BudgetUK`,
    description: activeTab.metaDescription.replace("London", cityName),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-GB": canonicalUrl,
      },
    },
  };
}

export default async function DietPage({ params, searchParams }: PageProps) {
  const { city: citySlug } = await params;
  const { tab } = await searchParams;
  const activeTab = DIET_TABS.find((t) => t.id === tab) ?? DIET_TABS.find((t) => t.id === DEFAULT_TAB_ID)!;
  const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  let spots: Spot[] = [];
  try {
    const snap = await adminDb
      .collection("spots")
      .where("city", "==", citySlug.toLowerCase())
      .where("tags", "array-contains", activeTab.tag)
      .orderBy("voteCount", "desc")
      .limit(100)
      .get();
    spots = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Spot))
      .filter((s) => s.status === "live");
  } catch (err) {
    console.error("DietPage data fetch error:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${activeTab.label} restaurants in ${cityName}`,
    description: activeTab.metaDescription.replace("London", cityName),
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
          addressRegion: cityName,
          addressCountry: "GB",
        },
        url: `https://budgetuk.io/${citySlug}/${encodeURIComponent(spot.neighbourhood.toLowerCase())}/${spot.slug}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DietPageClient activeTab={activeTab} spots={spots} citySlug={citySlug} cityName={cityName} />
    </>
  );
}
