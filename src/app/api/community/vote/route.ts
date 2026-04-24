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

  const { submissionId } = await req.json();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const voteRef = adminDb.collection("votes").doc(`${submissionId}_${uid}`);
  const submissionRef = adminDb.collection("submissions").doc(submissionId);

  try {
    await adminDb.runTransaction(async (t) => {
      const [voteSnap, subSnap] = await Promise.all([t.get(voteRef), t.get(submissionRef)]);

      if (!subSnap.exists) throw Object.assign(new Error("Submission not found"), { status: 404 });
      if (subSnap.data()!.submittedBy === uid)
        throw Object.assign(new Error("You cannot vote on your own submission"), { status: 403 });
      if (voteSnap.exists)
        throw Object.assign(new Error("Already voted"), { status: 409 });

      t.set(voteRef, { uid, submissionId, createdAt: FieldValue.serverTimestamp() });
      t.update(submissionRef, {
        voteCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
