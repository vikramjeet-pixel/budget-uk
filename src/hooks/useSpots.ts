import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, limit, QueryConstraint } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Spot } from "@/types";

interface UseSpotsOptions {
  categories?: string[];
  neighbourhood?: string;
  neighbourhoods?: string[];
  boroughs?: string[];
  priceTiers?: string[];
  tags?: string[];
  status?: string;
}

export function useSpots(options?: UseSpotsOptions) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Base query: get up to 200 live spots
    const constraints: QueryConstraint[] = [
      where("status", "==", options?.status || "live"),
      limit(200)
    ];

    // Build the query. We prefer server-side filtering for categories first.
    if (options?.categories && options.categories.length > 0) {
      constraints.push(where("category", "in", options.categories.slice(0, 10)));
    }

    const q = query(collection(db, "spots"), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data: Spot[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Spot));

      // --- CLIENT-SIDE FILTERING REFINEMENT ---
      // We do this to handle multi-field "OR" logic and "in" limits beyond Firestore's capabilities.
      
      // Neighbourhood/Borough multi-select
      const selectedNbhs = options?.neighbourhoods || (options?.neighbourhood ? [options.neighbourhood] : []);
      const selectedBoroughs = options?.boroughs || [];

      if (selectedNbhs.length > 0 || selectedBoroughs.length > 0) {
        data = data.filter(spot => {
          const matchNbh = selectedNbhs.includes(spot.neighbourhood);
          const matchBorough = selectedBoroughs.includes(spot.borough);
          return matchNbh || matchBorough;
        });
      }

      if (options?.priceTiers && options.priceTiers.length > 0) {
        data = data.filter(spot => options.priceTiers!.includes(spot.priceTier));
      }

      if (options?.tags && options.tags.length > 0) {
        data = data.filter(spot => 
          spot.tags?.some((tag: string) => options.tags?.includes(tag))
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
  }, [
    options?.categories ? JSON.stringify(options.categories) : undefined,
    options?.neighbourhood,
    options?.neighbourhoods ? JSON.stringify(options.neighbourhoods) : undefined,
    options?.boroughs ? JSON.stringify(options.boroughs) : undefined,
    options?.priceTiers ? JSON.stringify(options.priceTiers) : undefined,
    options?.status,
    options?.tags ? JSON.stringify(options.tags) : undefined
  ]);

  return { spots, loading, error };
}
