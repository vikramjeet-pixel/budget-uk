import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, citySlug } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!citySlug) {
      return NextResponse.json({ error: "City slug is required" }, { status: 400 });
    }

    // Add to waitlist collection
    await adminDb.collection("waitlist").doc(citySlug).set({
      emails: FieldValue.arrayUnion({
        email,
        subscribedAt: FieldValue.serverTimestamp(),
      }),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
