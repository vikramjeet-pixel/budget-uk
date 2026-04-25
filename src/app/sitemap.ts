import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/admin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://budgetuk.io";

export const revalidate = 86400; // Regenerate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Static pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/spots`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/community/add`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/community/leaderboard`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/free`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/student`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/transport`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/diet`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

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

  return [...staticPages, ...spotPages];
}
