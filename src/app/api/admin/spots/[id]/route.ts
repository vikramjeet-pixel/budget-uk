import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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

/** PATCH /api/admin/spots/[id] — update tags and/or description */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await verifyModerator(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json() as { tags?: string[]; description?: string };

  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (Array.isArray(body.tags)) updates.tags = body.tags;
  if (typeof body.description === "string" && body.description.trim()) {
    updates.description = body.description.trim();
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const spotRef = adminDb.collection("spots").doc(id);
  const snap = await spotRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Spot not found" }, { status: 404 });

  await spotRef.update(updates);
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/spots/[id] — soft-delete (status → "removed") */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await verifyModerator(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const spotRef = adminDb.collection("spots").doc(id);
  const snap = await spotRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Spot not found" }, { status: 404 });

  await spotRef.update({
    status: "removed",
    removedBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}
