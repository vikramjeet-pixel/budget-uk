import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

let cachedSpots: any[] = [];
let lastFetched = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const now = Date.now();
    if (now - lastFetched > CACHE_TTL || cachedSpots.length === 0) {
      const snapshot = await adminDb
        .collection("spots")
        .where("status", "==", "live")
        .select("name", "slug", "city", "neighbourhood")
        .get();
      
      cachedSpots = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      lastFetched = now;
    }

    const results = cachedSpots
      .filter((spot) => 
        spot.name.toLowerCase().includes(q) || 
        spot.neighbourhood.toLowerCase().includes(q)
      )
      .slice(0, 8);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
