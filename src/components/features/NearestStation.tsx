"use client";

import * as React from "react";
import { useNearestStation } from "@/hooks/useNearestStation";
import { lineStyle } from "@/lib/tfl/colours";
import { LiveArrivals } from "@/components/features/LiveArrivals";

const MODE_ICON: Record<string, string> = {
  tube:             "🚇",
  overground:       "🚆",
  "elizabeth-line": "🟣",
  dlr:              "🚈",
  bus:              "🚌",
  "national-rail":  "🚂",
  tram:             "🚊",
};

function modeIcon(modes: string[]): string {
  for (const priority of ["elizabeth-line", "tube", "overground", "dlr", "national-rail", "tram", "bus"]) {
    if (modes.includes(priority)) return MODE_ICON[priority] ?? "🚉";
  }
  return "🚉";
}

function walkMins(metres: number): number {
  return Math.max(1, Math.ceil(metres / 80));
}

interface Props {
  latitude: number;
  longitude: number;
}

export function NearestStation({ latitude, longitude }: Props) {
  const { stations, loading } = useNearestStation(latitude, longitude);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1].map(i => (
          <div key={i} className="h-16 rounded-xl bg-(--hover-tint) animate-pulse" />
        ))}
      </div>
    );
  }

  if (stations.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {stations.slice(0, 2).map(station => (
        <div
          key={station.id}
          className="flex flex-col gap-2 bg-[#f7f4ed] border border-passive rounded-xl px-4 py-3"
        >
          {/* Row 1: icon + name + walk time */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[18px] leading-none shrink-0">{modeIcon(station.modes)}</span>
              <span className="text-[14px] font-semibold text-[#1c1c1c] truncate">{station.name}</span>
            </div>
            <span className="text-[13px] text-[#5f5f5d] shrink-0">
              {walkMins(station.distance)} min walk
            </span>
          </div>

          {/* Row 2: line pills */}
          {station.lines.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {station.lines.slice(0, 6).map(line => (
                <span
                  key={line.id}
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold leading-tight"
                  style={lineStyle(line.name)}
                >
                  {line.name}
                </span>
              ))}
            </div>
          )}

          {/* Live arrivals — updates every 30s while visible */}
          <LiveArrivals stationId={station.id} />
        </div>
      ))}
    </div>
  );
}
