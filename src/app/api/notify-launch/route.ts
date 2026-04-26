import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, citySlug } = await req.json();

    if (!email || !citySlug) {
      return NextResponse.json({ error: "Missing email or city" }, { status: 400 });
    }

    // Write to waitlist/{citySlug}/emails/{email}
    // We use email as ID to prevent duplicates easily, but encode it if it has special chars.
    const emailId = encodeURIComponent(email.toLowerCase());
    
    await adminDb
      .collection("waitlist")
      .doc(citySlug)
      .collection("emails")
      .doc(emailId)
      .set({
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        source: "coming-soon-page"
      }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}
