import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { GeoPoint, FieldValue } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";
import { checkRateLimit, SUBMISSION_LIMIT, recordAuthFailure, isIpBlocked } from "@/lib/rateLimit";
import { checkSpam } from "@/lib/spamDetect";
import { verifyAppCheck } from "@/lib/verifyAppCheck";

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

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
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
    } catch (error) {
      console.error("Auth verification failed:", error);
      if (clientIp !== "unknown") {
        await recordAuthFailure(clientIp);
      }
      return NextResponse.json({ error: "Invalid or expired session. Please log in again." }, { status: 401 });
    }

    // ─── Sliding-window rate limit (3 per 24h) ───────────────────────────────
    const rateResult = await checkRateLimit(uid, SUBMISSION_LIMIT);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          error: `Submission limit reached (3 per 24 hours). Try again in ${rateResult.retryAfterSeconds}s.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateResult.retryAfterSeconds),
          },
        }
      );
    }

    // ─── Cooldown: max 3 pending submissions per user ────────────────────────
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

    const body = await req.json();
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
      website,
    } = body;

    // Basic validation to prevent crashes
    if (!name || !category || !neighbourhood || !description || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // ─── Spam detection ──────────────────────────────────────────────────────
    const spamResult = checkSpam({
      name: name || "",
      description: description || "",
      tips: tips || [],
    });

    const slug = buildSlug(name);
    const geohash = geohashForLocation([latitude, longitude]);

    const submissionData: Record<string, unknown> = {
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
      website: website || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // If spam detected, flag for moderator review
    if (spamResult.isSpam) {
      submissionData.flagged = true;
      submissionData.flagReasons = spamResult.reasons;
      submissionData.flaggedAt = FieldValue.serverTimestamp();
    }

    const docRef = await adminDb.collection("submissions").add(submissionData);

    return NextResponse.json({
      id: docRef.id,
      submissionId: docRef.id,
      flagged: spamResult.isSpam,
    });
  } catch (error) {
    console.error("Submission API Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

