import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit, VOTE_LIMIT, recordAuthFailure, isIpBlocked } from "@/lib/rateLimit";
import { verifyAppCheck } from "@/lib/verifyAppCheck";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  // ─── App Check ───────────────────────────────────────────────────────────
  if (!(await verifyAppCheck(req))) {
    return NextResponse.json({ error: "App Check verification failed" }, { status: 403 });
  }

  // ─── IP block check ──────────────────────────────────────────────────────
  const clientIp = getClientIp(req);
  if (clientIp !== "unknown" && (await isIpBlocked(clientIp))) {
    return NextResponse.json(
      { error: "Too many failed requests. Try again later." },
      { status: 429 }
    );
  }

  // ─── Auth ────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    if (clientIp !== "unknown") {
      await recordAuthFailure(clientIp);
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // ─── Sliding-window rate limit (60 votes per hour) ───────────────────────
  const rateResult = await checkRateLimit(uid, VOTE_LIMIT);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: `Vote limit reached (60 per hour). Try again in ${rateResult.retryAfterSeconds}s.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateResult.retryAfterSeconds) },
      }
    );
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
