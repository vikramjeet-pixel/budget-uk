import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { GeoPoint, FieldValue } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

const MAX_PENDING = 3;

function buildSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Cooldown: max 3 pending submissions per user
  const pendingSnap = await adminDb
    .collection("submissions")
    .where("submittedBy", "==", uid)
    .where("status", "==", "pending")
    .select()
    .limit(MAX_PENDING)
    .get();

  if (pendingSnap.size >= MAX_PENDING) {
    return NextResponse.json(
      {
        error:
          "You already have 3 pending submissions. Wait for them to be reviewed before submitting more.",
      },
      { status: 429 }
    );
  }

  const {
    name,
    category,
    neighbourhood,
    priceTier,
    approxPriceGbp,
    latitude,
    longitude,
    borough,
    postcodeDistrict,
    photoUrl,
    description,
    tips,
    tags,
  } = await req.json();

  const slug = buildSlug(name);
  const geohash = geohashForLocation([latitude, longitude]);

  const docRef = await adminDb.collection("submissions").add({
    name: name.trim(),
    slug,
    category,
    neighbourhood: neighbourhood.trim(),
    borough: (borough || "").trim(),
    postcodeDistrict: (postcodeDistrict || "").toUpperCase().trim(),
    city: "london",
    location: new GeoPoint(latitude, longitude),
    geohash,
    priceTier,
    approxPriceGbp: approxPriceGbp ? Number(approxPriceGbp) : null,
    tags: tags || [],
    googlePlaceId: null,
    photoUrl: photoUrl || null,
    description: description.trim(),
    tips: (tips || []).filter(Boolean),
    status: "pending",
    submittedBy: uid,
    voters: [],
    voteCount: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id });
}
