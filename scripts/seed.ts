import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, GeoPoint, FieldValue } from "firebase-admin/firestore";
import * as geofire from "geofire-common";
import * as dotenv from "dotenv";
import { spots } from "../src/data/seed-london";
import { getBoroughForNeighbourhood } from "../src/data/london-locations";

dotenv.config({ path: ".env.local" });

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

if (!serviceAccountBase64) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT_B64 in .env.local - Halting database mutation.");
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

async function seed() {
  console.log(`Initialising targeted seed sequence crossing ${spots.length} locational vectors directly overlapping London...`);
  const batch = db.batch();
  
  let count = 0;
  for (const rawSpot of spots) {
    // Generate unique index referencing locally securely
    const docRef = db.collection("spots").doc();
    
    // Hash configuration bounding cross-radius arrays mapping strictly from Geofire common primitives
    const hash = geofire.geohashForLocation([rawSpot.location.latitude, rawSpot.location.longitude]);
    
    // Strip boundaries creating seamless URI compatible node strings 
    const slug = rawSpot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // Assign borough based on neighbourhood mapping
    const borough = getBoroughForNeighbourhood(rawSpot.neighbourhood);

    const dbSpot = {
      ...rawSpot,
      neighbourhood: rawSpot.neighbourhood,
      borough,
      // Map strictly into standard native Firebase GeoPoint mapping out of raw JS logic safely
      location: new GeoPoint(rawSpot.location.latitude, rawSpot.location.longitude),
      slug,
      geohash: hash,
      status: "live",
      submittedBy: "system-root-seed",
      voteCount: Math.floor(Math.random() * 50) + 26, // Pre-seed logic maintaining passing grades reliably globally
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    batch.set(docRef, dbSpot);
    count++;
    
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`Executed secure Firestore batch limits natively locking ${count} mappings securely...`);
    }
  }

  if (count % 400 !== 0) {
    await batch.commit();
    console.log(`Fully injected ${count} index variables perfectly into live Collections. Complete.`);
  }
}

seed().catch((error) => {
  console.error("Execution violently halted mapping runtime parameter:", error);
  process.exit(1);
});
