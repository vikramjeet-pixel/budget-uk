import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase/admin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://budgetuk.io";

export const metadata: Metadata = {
  title: "Explore Budget Spots in London",
  description:
    "Browse hundreds of community-curated budget-friendly places in London — filter by category, neighbourhood, price, and dietary needs.",
  alternates: { canonical: "/spots" },
  openGraph: {
    title: "Explore Budget Spots in London",
    description:
      "Browse hundreds of community-curated budget-friendly places in London.",
    url: "/spots",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Budget Spots in London",
    description:
      "Browse hundreds of community-curated budget-friendly places in London.",
  },
};

export default async function SpotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Build ItemList JSON-LD from live spots
  let jsonLd = null;
  try {
    const snapshot = await adminDb
      .collection("spots")
      .where("status", "==", "live")
      .orderBy("voteCount", "desc")
      .limit(100)
      .select("name", "slug", "neighbourhood", "city", "category")
      .get();

    const items = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      const neighbourhood = encodeURIComponent(
        (data.neighbourhood || "").toLowerCase().replace(/\s+/g, "-")
      );
      const city = data.city || "london";

      return {
        "@type": "ListItem",
        position: index + 1,
        url: `${BASE_URL}/${city}/${neighbourhood}/${data.slug}`,
        name: data.name,
      };
    });

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Budget-Friendly Spots in London",
      description:
        "Community-curated list of the best budget-friendly places in London.",
      numberOfItems: items.length,
      itemListElement: items,
    };
  } catch {
    // Non-fatal — page still renders
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
