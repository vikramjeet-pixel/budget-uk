import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

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

/** DELETE /api/admin/reports/[id] — dismiss (delete) a report */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = await verifyModerator(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const ref = adminDb.collection("reports").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  await ref.delete();
  return NextResponse.json({ ok: true });
}
