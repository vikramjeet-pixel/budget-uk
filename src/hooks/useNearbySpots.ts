import { useState, useEffect } from "react";
import { collection, query, orderBy, startAt, endAt, getDocs, where } from "firebase/firestore";
import * as geofire from "geofire-common";
import { db } from "@/lib/firebase/client";
import type { Spot } from "@/types";

export type NearbySpot = Spot & { distance: number };

export function useNearbySpots(
  city: string,
  lat: number | null,
  lng: number | null,
  radiusInM: number = 1500,
  category?: string,
  enabled: boolean = true
) {
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || lat === null || lng === null) {
      setSpots([]);
      return;
    }

    const fetchNearby = async () => {
      setLoading(true);
      setError(null);

      try {
        const center: [number, number] = [lat, lng];
        const bounds = geofire.geohashQueryBounds(center, radiusInM);
        const promises = [];

        for (const b of bounds) {
          const q = query(
            collection(db, "spots"),
            where("city", "==", city.toLowerCase()),
            where("status", "==", "live"),
            orderBy("geohash"),
            startAt(b[0]),
            endAt(b[1])
          );
          promises.push(getDocs(q));
        }

        const snapshots = await Promise.all(promises);

        const matchingDocs: NearbySpot[] = [];
        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const data = doc.data() as Omit<Spot, "id">;
            
            if (category && data.category !== category) continue;

            const spotLat = data.location.latitude;
            const spotLng = data.location.longitude;

            const distanceInKm = geofire.distanceBetween([spotLat, spotLng], center);
            const distanceInM = distanceInKm * 1000;

            if (distanceInM <= radiusInM) {
              matchingDocs.push({
                id: doc.id,
                distance: distanceInM,
                ...data
              } as NearbySpot);
            }
          }
        }

        const unique = Array.from(new Map(matchingDocs.map((item) => [item.id, item])).values());
        unique.sort((a, b) => a.distance - b.distance);
        setSpots(unique);
      } catch (err) {
        console.error("Error fetching nearby spots:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [city, enabled, lat, lng, radiusInM, category]);

  return { spots, loading, error };
}
