import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Spot } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // We can't do a partial string search easily in Firestore without a 3rd party tool,
    // so we'll do a simple prefix search or just fetch some and filter.
    // For 550 spots, we can actually fetch all live names and slugs and filter in memory,
    // then cache it.
    const snapshot = await adminDb
      .collection("spots")
      .where("status", "==", "live")
      .select("name", "slug", "city", "neighbourhood")
      .get();

    const results = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((spot: any) => 
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
