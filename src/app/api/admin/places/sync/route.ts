import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

const PLACES_FIELDS = [
  "opening_hours",
  "formatted_phone_number",
  "website",
  "rating",
  "user_ratings_total",
  "price_level",
  "photos",
].join(",");

async function verifyModerator(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const { uid } = await adminAuth.verifyIdToken(authHeader.slice(7));
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const role = userDoc.data()?.role;
    if (role !== "moderator" && role !== "admin") return null;
    return uid;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyModerator(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY not configured on server" },
      { status: 500 }
    );
  }

  const { spotId } = (await req.json()) as { spotId?: string };
  if (!spotId) {
    return NextResponse.json({ error: "spotId required" }, { status: 400 });
  }

  // Fetch the spot doc
  const spotRef = adminDb.collection("spots").doc(spotId);
  const spotSnap = await spotRef.get();

  if (!spotSnap.exists) {
    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  }

  const spotData = spotSnap.data()!;
  const placeId = spotData.googlePlaceId as string | null;

  if (!placeId) {
    return NextResponse.json(
      { error: "Spot does not have a googlePlaceId" },
      { status: 400 }
    );
  }

  // Call Google Places Details API
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", PLACES_FIELDS);
  url.searchParams.set("key", GOOGLE_PLACES_API_KEY);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      return NextResponse.json(
        { error: `Places API returned HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const json = (await res.json()) as {
      status: string;
      result?: {
        opening_hours?: { weekday_text?: string[] };
        formatted_phone_number?: string;
        website?: string;
        rating?: number;
        user_ratings_total?: number;
        price_level?: number;
        photos?: Array<{ photo_reference: string }>;
      };
    };

    if (json.status !== "OK" || !json.result) {
      return NextResponse.json(
        { error: `Places API status: ${json.status}` },
        { status: 502 }
      );
    }

    const r = json.result;

    const placeData = {
      openingHours: r.opening_hours?.weekday_text ?? [],
      phone: r.formatted_phone_number ?? null,
      website: r.website ?? null,
      rating: r.rating ?? null,
      userRatingsTotal: r.user_ratings_total ?? null,
      priceLevel: r.price_level ?? null,
      photoRef: r.photos?.[0]?.photo_reference ?? null,
      lastSyncedAt: FieldValue.serverTimestamp(),
    };

    await spotRef.update({
      placeData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, placeData });
  } catch (err) {
    console.error("Places sync error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from Google Places API" },
      { status: 502 }
    );
  }
}
