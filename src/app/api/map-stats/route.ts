import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { CITIES } from "@/data/cities";

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const stats: Record<string, number> = {};
    
    // We can use a single query to get all counts if we group them, 
    // but Firestore doesn't support grouping in a single call easily without aggregation queries.
    // For 20 cities, 20 parallel count queries are fine.
    
    const countPromises = CITIES.map(async (city) => {
      const snapshot = await adminDb
        .collection('spots')
        .where('city', '==', city.slug)
        .where('status', '==', 'live')
        .count()
        .get();
      
      return { slug: city.slug, count: snapshot.data().count };
    });

    const results = await Promise.all(countPromises);
    
    results.forEach(({ slug, count }) => {
      stats[slug] = count;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching map stats:", error);
    return NextResponse.json({ error: "Failed to fetch map stats" }, { status: 500 });
  }
}
