"use client";

import { useState, useEffect } from "react";

interface Arrival {
  lineName: string;
  destinationName: string;
  timeToStation: number;
}

export function useArrivals(stationId?: string) {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stationId) return;

    async function fetchArrivals() {
      setLoading(true);
      try {
        const response = await fetch(`/api/tfl/arrivals/${stationId}`);
        if (!response.ok) throw new Error("Failed to fetch arrivals");
        
        const data = await response.json();
        setArrivals(data.arrivals || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("useArrivals error:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchArrivals();
    
    // Optional: Auto-refresh every 60 seconds
    const interval = setInterval(fetchArrivals, 60000);
    return () => clearInterval(interval);

  }, [stationId]);

  return { arrivals, loading, error };
}
