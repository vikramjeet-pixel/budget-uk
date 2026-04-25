import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { GeoPoint, FieldValue } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

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

  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const submissionRef = adminDb.collection("submissions").doc(submissionId);
  const spotRef = adminDb.collection("spots").doc();
  const mailRef = adminDb.collection("mail").doc();

  try {
    await adminDb.runTransaction(async (t) => {
      const submissionSnap = await t.get(submissionRef);
      if (!submissionSnap.exists) throw Object.assign(new Error("Submission not found"), { status: 404 });
      const data = submissionSnap.data()!;
      if (data.status !== "pending") {
        throw Object.assign(new Error("Submission is not pending"), { status: 409 });
      }

      const loc = data.location as { latitude: number; longitude: number };
      const geohash = geohashForLocation([loc.latitude, loc.longitude]);
      const userRef = adminDb.collection("users").doc(data.submittedBy as string);
      const userSnap = await t.get(userRef);

      t.set(spotRef, {
        name: data.name,
        slug: data.slug,
        category: data.category,
        neighbourhood: data.neighbourhood,
        borough: data.borough ?? "",
        postcodeDistrict: data.postcodeDistrict ?? "",
        city: data.city ?? "london",
        location: new GeoPoint(loc.latitude, loc.longitude),
        geohash,
        priceTier: data.priceTier,
        approxPriceGbp: data.approxPriceGbp ?? null,
        tags: data.tags ?? [],
        googlePlaceId: data.googlePlaceId ?? null,
        photoUrl: data.photoUrl ?? null,
        description: data.description,
        tips: data.tips ?? [],
        status: "live",
        submittedBy: data.submittedBy,
        voteCount: 0,
        website: data.website ?? null,
        createdAt: data.createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      });

      t.update(submissionRef, {
        status: "approved",
        promotedToSpotId: spotRef.id,
        approvedBy: uid,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (userSnap.exists) {
        t.update(userRef, { reputation: FieldValue.increment(10) });
      }

      t.set(mailRef, {
        toUids: [data.submittedBy],
        message: {
          subject: `"${data.name as string}" is now live on BudgetUK!`,
          text: `Great news! Your spot "${data.name as string}" has been approved by a moderator and is now live on the BudgetUK map.`,
          html: `<p>Your spot <strong>${data.name as string}</strong> has been approved by a moderator and is now featured on the BudgetUK map.</p><p>Thanks for contributing!</p>`,
        },
      });
    });

    return NextResponse.json({ ok: true, spotId: spotRef.id });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
