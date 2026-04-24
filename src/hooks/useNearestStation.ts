"use client";

import { useState, useEffect } from "react";

interface Station {
  id: string;
  name: string;
  modes: string[];
  lines: { id: string; name: string }[];
  distance: number;
}

export function useNearestStation(lat?: number, lon?: number) {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lon) return;

    async function fetchStations() {
      setLoading(true);
      try {
        const response = await fetch(`/api/tfl/stations?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error("Failed to fetch stations");
        
        const data = await response.json();
        setStations(data.stations || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("useNearestStation error:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, [lat, lon]);

  return { stations, loading, error };
}
