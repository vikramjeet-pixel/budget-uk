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

export async function POST(req: NextRequest) {
  const uid = await verifyModerator(req);
  if (!uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { submissionId, reason } = await req.json();
  if (!submissionId || !reason?.trim()) {
    return NextResponse.json({ error: "submissionId and reason required" }, { status: 400 });
  }

  const submissionRef = adminDb.collection("submissions").doc(submissionId);
  const submissionSnap = await submissionRef.get();

  if (!submissionSnap.exists) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const data = submissionSnap.data()!;
  if (data.status !== "pending") {
    return NextResponse.json({ error: "Submission is not pending" }, { status: 409 });
  }

  const mailRef = adminDb.collection("mail").doc();

  const batch = adminDb.batch();
  batch.update(submissionRef, {
    status: "rejected",
    rejectionReason: reason.trim(),
    rejectedBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.set(mailRef, {
    toUids: [data.submittedBy],
    message: {
      subject: `Update on your BudgetUK submission: "${data.name as string}"`,
      text: [
        `Hi there,`,
        ``,
        `After review, your submission "${data.name as string}" was not approved.`,
        ``,
        `Reason: ${reason.trim()}`,
        ``,
        `You're welcome to make another submission addressing the feedback above.`,
        ``,
        `Thanks for contributing to the BudgetUK community.`,
      ].join("\n"),
      html: `
        <p>Hi there,</p>
        <p>After review, your submission <strong>${data.name as string}</strong> was not approved.</p>
        <p><strong>Reason:</strong> ${reason.trim()}</p>
        <p>You're welcome to make another submission addressing the feedback above.</p>
        <p>Thanks for contributing to the BudgetUK community.</p>
      `.trim(),
    },
  });

  await batch.commit();
  return NextResponse.json({ ok: true });
}
