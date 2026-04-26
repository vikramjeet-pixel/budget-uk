import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, GeoPoint, FieldValue } from "firebase-admin/firestore";
import * as geofire from "geofire-common";
import * as dotenv from "dotenv";

// Import all city seeds
import { spots as londonSpots } from "../src/data/seed-london";
import { spots as manchesterSpots } from "../src/data/seed-manchester";
import { spots as birminghamSpots } from "../src/data/seed-birmingham";
import { spots as leedsSpots } from "../src/data/seed-leeds";
import { spots as bristolSpots } from "../src/data/seed-bristol";
import { spots as edinburghSpots } from "../src/data/seed-edinburgh";
import { spots as glasgowSpots } from "../src/data/seed-glasgow";
import { spots as liverpoolSpots } from "../src/data/seed-liverpool";
import { spots as newcastleSpots } from "../src/data/seed-newcastle";
import { spots as sheffieldSpots } from "../src/data/seed-sheffield";
import { spots as cambridgeSpots } from "../src/data/seed-cambridge";
import { spots as oxfordSpots } from "../src/data/seed-oxford";
import { spots as yorkSpots } from "../src/data/seed-york";
import { spots as bathSpots } from "../src/data/seed-bath";
import { spots as brightonSpots } from "../src/data/seed-brighton";
import { spots as nottinghamSpots } from "../src/data/seed-nottingham";
import { spots as leicesterSpots } from "../src/data/seed-leicester";
import { spots as coventrySpots } from "../src/data/seed-coventry";
import { spots as cardiffSpots } from "../src/data/seed-cardiff";
import { spots as belfastSpots } from "../src/data/seed-belfast";

const ALL_CITY_SPOTS = [
  ...londonSpots,
  ...manchesterSpots,
  ...birminghamSpots,
  ...leedsSpots,
  ...bristolSpots,
  ...edinburghSpots,
  ...glasgowSpots,
  ...liverpoolSpots,
  ...newcastleSpots,
  ...sheffieldSpots,
  ...cambridgeSpots,
  ...oxfordSpots,
  ...yorkSpots,
  ...bathSpots,
  ...brightonSpots,
  ...nottinghamSpots,
  ...leicesterSpots,
  ...coventrySpots,
  ...cardiffSpots,
  ...belfastSpots,
];

dotenv.config({ path: ".env.local" });

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

if (!serviceAccountBase64) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_B64 in .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf-8"));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function seedAll() {
  console.log(`Starting master seed operation for ${ALL_CITY_SPOTS.length} spots across 20 cities...`);
  
  // Optional: Clear only admin-seeded spots if needed, but usually we just overwrite by slug
  // We'll use slug-based ID for idempotency

  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const rawSpot of ALL_CITY_SPOTS) {
    const slug = `${rawSpot.city}-${rawSpot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}`;
    const docRef = db.collection("spots").doc(slug);
    
    const hash = geofire.geohashForLocation([rawSpot.location.latitude, rawSpot.location.longitude]);

    const dbSpot = {
      ...rawSpot,
      location: new GeoPoint(rawSpot.location.latitude, rawSpot.location.longitude),
      slug,
      geohash: hash,
      status: "live",
      submittedBy: "admin-seed",
      voteCount: (rawSpot as any).voteCount || Math.floor(Math.random() * 30) + 10,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    batch.set(docRef, dbSpot);
    count++;
    
    if (count % 450 === 0) {
      await batch.commit();
      batchCount++;
      batch = db.batch();
      console.log(`Committed batch ${batchCount} (${count} spots total)...`);
    }
  }

  if (count % 450 !== 0) {
    await batch.commit();
    batchCount++;
  }

  console.log(`Success: Seeded ${count} spots across 20 cities in ${batchCount} batches.`);
}

seedAll().catch((error) => {
  console.error("Fatal seed error:", error);
  process.exit(1);
});
