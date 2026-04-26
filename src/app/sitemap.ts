import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/admin";
import { CITIES } from "@/data/cities";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://budgetuk.io";

export const revalidate = 86400; // Regenerate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Static global pages ───────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/roadmap`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  // ─── Regional pages for each city ──────────────────────────────────────────
  const cityPages: MetadataRoute.Sitemap = CITIES.flatMap((city) => {
    const cityBase = `${BASE_URL}/${city.slug}`;
    const priority = city.comingSoon ? 0.4 : 0.8;
    const changeFreq = city.comingSoon ? "monthly" : ("daily" as const);

    return [
      { url: cityBase, lastModified: new Date(), changeFrequency: changeFreq, priority },
      { url: `${cityBase}/spots`, lastModified: new Date(), changeFrequency: changeFreq, priority },
      { url: `${cityBase}/free`, lastModified: new Date(), changeFrequency: changeFreq, priority: priority * 0.9 },
      { url: `${cityBase}/transport`, lastModified: new Date(), changeFrequency: changeFreq, priority: priority * 0.9 },
      { url: `${cityBase}/events`, lastModified: new Date(), changeFrequency: changeFreq, priority: priority * 0.8 },
      { url: `${cityBase}/community`, lastModified: new Date(), changeFrequency: changeFreq, priority: priority * 0.8 },
    ];
  });

  // ─── Dynamic spot pages ────────────────────────────────────────────────────
  let spotPages: MetadataRoute.Sitemap = [];
  try {
    const snapshot = await adminDb
      .collection("spots")
      .where("status", "==", "live")
      .select("slug", "neighbourhood", "city", "updatedAt")
      .get();

    spotPages = snapshot.docs.map((doc) => {
      const data = doc.data();
      const neighbourhood = (data.neighbourhood || "").toLowerCase().replace(/\s+/g, "-");
      const city = data.city || "london";
      const updatedAt = data.updatedAt?.toDate?.() ?? new Date();

      return {
        url: `${BASE_URL}/${city}/${encodeURIComponent(neighbourhood)}/${data.slug}`,
        lastModified: updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error("Sitemap: failed to fetch spots:", error);
  }

  return [...staticPages, ...cityPages, ...spotPages];
}
