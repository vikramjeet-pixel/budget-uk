import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

    if (!serviceAccountBase64) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_B64 is not set");
    }

    const serviceAccountJson = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
