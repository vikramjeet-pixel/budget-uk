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
  
  // Clean up existing system spots to avoid duplicates with missing images
  console.log("Cleaning up existing system-seeded spots...");
  const existingSystemSpots = await db.collection("spots").where("submittedBy", "==", "system-root-seed").get();
  if (!existingSystemSpots.empty) {
    const cleanBatch = db.batch();
    existingSystemSpots.docs.forEach(doc => cleanBatch.delete(doc.ref));
    await cleanBatch.commit();
    console.log(`Removed ${existingSystemSpots.size} legacy spots.`);
  }

  const batch = db.batch();
  
  let count = 0;
  for (const rawSpot of spots) {
    // Strip boundaries creating seamless URI compatible node strings 
    const slug = rawSpot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    
    // Generate unique index referencing locally securely (using slug for idempotency)
    const docRef = db.collection("spots").doc(slug);
    
    // Hash configuration bounding cross-radius arrays mapping strictly from Geofire common primitives
    const hash = geofire.geohashForLocation([rawSpot.location.latitude, rawSpot.location.longitude]);
    // Assign borough based on neighbourhood mapping
    const borough = getBoroughForNeighbourhood(rawSpot.neighbourhood);

    // Dynamic photo assignment for rich aesthetics if missing
    const categoryPhotos: Record<string, string[]> = {
      food: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
      ],
      coffee: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"
      ],
      grocery: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80"
      ],
      gym: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80"
      ],
      workspace: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
      ],
      entertainment: [
        "https://images.unsplash.com/photo-1518998053504-5368efeb9b7a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80"
      ],
      housing: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
      ],
      bars: [
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80"
      ]
    };

    const photos = categoryPhotos[rawSpot.category] || categoryPhotos['entertainment'];
    const photoUrl = photos[count % photos.length];

    const dbSpot = {
      ...rawSpot,
      photoUrl,
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
