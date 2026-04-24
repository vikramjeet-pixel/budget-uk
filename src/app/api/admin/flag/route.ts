import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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

  const { spotId, spotName, reason } = await req.json() as {
    spotId: string;
    spotName: string;
    reason: string;
  };

  if (!spotId || !reason?.trim()) {
    return NextResponse.json({ error: "spotId and reason required" }, { status: 400 });
  }

  // Prevent duplicate reports from the same user on the same spot
  const existing = await adminDb
    .collection("reports")
    .where("spotId", "==", spotId)
    .where("reportedBy", "==", uid)
    .limit(1)
    .get();

  if (!existing.empty) {
    return NextResponse.json({ error: "Already reported" }, { status: 409 });
  }

  await adminDb.collection("reports").add({
    spotId,
    spotName: spotName ?? "",
    reportedBy: uid,
    reason: reason.trim(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}
