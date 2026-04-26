"use client";

import { useState, useEffect } from "react";

export function useWorldMapStats() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/map-stats");
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch map stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
}
