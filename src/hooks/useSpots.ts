import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, limit, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Spot } from "@/types";

interface UseSpotsOptions {
  city?: string;
  categories?: string[];
  neighbourhood?: string;
  neighbourhoods?: string[];
  boroughs?: string[];
  priceTiers?: string[];
  tags?: string[];
  status?: string;
}

export function useSpots(
  city: string,
  category?: string | string[],
  neighbourhood?: string | string[],
  priceTier?: string | string[],
  tags?: string[],
  enabled: boolean = true
) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSpots([]);
      setLoading(false);
      return;
    }
    const cats = typeof category === "string" ? [category] : category || [];
    const nbhs = typeof neighbourhood === "string" ? [neighbourhood] : neighbourhood || [];
    const tiers = typeof priceTier === "string" ? [priceTier] : priceTier || [];

    // Base query: get up to 200 live spots for this city
    const constraints: QueryConstraint[] = [
      where("status", "==", "live"),
      where("city", "==", city.toLowerCase()),
      limit(200)
    ];

    // Server-side category filtering (if 10 or fewer)
    if (cats.length > 0 && cats.length <= 10) {
      constraints.push(where("category", "in", cats));
    }

    const q = query(collection(db, "spots"), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data: Spot[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Spot));

      // --- CLIENT-SIDE FILTERING REFINEMENT ---
      
      // Category fallback (if > 10)
      if (cats.length > 10) {
        data = data.filter(spot => cats.includes(spot.category));
      }

      if (nbhs.length > 0) {
        data = data.filter(spot => nbhs.includes(spot.neighbourhood));
      }

      if (tiers.length > 0) {
        data = data.filter(spot => tiers.includes(spot.priceTier));
      }

      if (tags && tags.length > 0) {
        data = data.filter(spot => 
          spot.tags?.some((tag: string) => tags.includes(tag))
        );
      }

      setSpots(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("useSpots error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [city, JSON.stringify(category), JSON.stringify(neighbourhood), JSON.stringify(priceTier), JSON.stringify(tags), enabled]);

  return { spots, loading, error };
}
