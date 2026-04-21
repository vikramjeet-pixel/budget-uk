import { useState, useEffect } from "react";
import { collection, query, orderBy, startAt, endAt, getDocs } from "firebase/firestore";
import * as geofire from "geofire-common";
import { db } from "@/lib/firebase/client";

interface NearbyOptions {
  center: [number, number] | null; // [lat, lng]
  radiusInM?: number; 
  category?: string;
  enabled?: boolean;
}

export function useNearbySpots({ center, radiusInM = 1500, category, enabled = true }: NearbyOptions) {
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !center || center.length !== 2) {
      setSpots([]);
      return;
    }

    const fetchNearby = async () => {
      setLoading(true);
      setError(null);

      try {
        const bounds = geofire.geohashQueryBounds(center, radiusInM);
        const promises = [];

        for (const b of bounds) {
          const q = query(
            collection(db, "spots"),
            orderBy("geohash"),
            startAt(b[0]),
            endAt(b[1])
          );
          promises.push(getDocs(q));
        }

        const snapshots = await Promise.all(promises);

        const matchingDocs: any[] = [];
        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const data = doc.data();
            
            // Client side filters avoiding incredibly heavy composite indexing demands dynamically globally
            if (data.status !== "live") continue;
            if (category && data.category !== category) continue;

            const lat = data.location.latitude;
            const lng = data.location.longitude;

            const distanceInKm = geofire.distanceBetween([lat, lng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM <= radiusInM) {
              matchingDocs.push({
                id: doc.id,
                distance: distanceInM,
                ...data
              });
            }
          }
        }

        // De-duplicate any intersecting geohash boundary boxes dynamically bounding smoothly
        const unique = Array.from(new Map(matchingDocs.map((item) => [item.id, item])).values());
        
        // Sorting automatically directly sorting shortest walks nearest locally!
        unique.sort((a, b) => a.distance - b.distance);

        setSpots(unique);
      } catch (err: any) {
        console.error("Error fetching nearby spots:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [enabled, center?.[0], center?.[1], radiusInM, category]);

  return { spots, loading, error };
}
