"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { lineStyle } from "@/lib/tfl/colours";

interface Arrival {
  lineName: string;
  destinationName: string;
  timeToStation: number; // minutes (converted by the API route)
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="h-5 w-16 rounded-full bg-[var(--hover-tint)] animate-pulse" />
      <div className="h-4 flex-1 rounded bg-[var(--hover-tint)] animate-pulse" />
      <div className="h-4 w-10 rounded bg-[var(--hover-tint)] animate-pulse" />
    </div>
  );
}

interface Props {
  stationId: string;
}

export function LiveArrivals({ stationId }: Props) {
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pause polling when the component scrolls off-screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fetchArrivals = useCallback(async () => {
    try {
      const res = await fetch(`/api/tfl/arrivals/${stationId}`);
      if (!res.ok) throw new Error();
      const data: { arrivals: Arrival[] } = await res.json();
      setArrivals(data.arrivals ?? []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  // Initial fetch on mount.
  useEffect(() => { fetchArrivals(); }, [fetchArrivals]);

  // 30-second interval — only runs while visible.
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(fetchArrivals, 30_000);
    return () => clearInterval(id);
  }, [visible, fetchArrivals]);

  return (
    <div ref={containerRef} className="flex flex-col divide-y divide-[var(--border-passive)]">
      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : error ? (
        <p className="py-2 text-[12px] text-[#5f5f5d]">
          Live data unavailable — try TfL Go
        </p>
      ) : arrivals.length === 0 ? (
        <p className="py-2 text-[12px] text-[#5f5f5d]">No upcoming arrivals</p>
      ) : (
        arrivals.slice(0, 3).map((arr, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <span
              className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight"
              style={lineStyle(arr.lineName)}
            >
              {arr.lineName}
            </span>
            <span className="flex-1 text-[13px] text-[#1c1c1c] truncate">
              {arr.destinationName}
            </span>
            <span className="shrink-0 text-[13px] font-bold text-[#1c1c1c] tabular-nums">
              {arr.timeToStation} min
            </span>
          </div>
        ))
      )}
    </div>
  );
}
