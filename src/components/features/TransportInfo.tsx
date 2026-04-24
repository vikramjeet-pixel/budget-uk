"use client";

import * as React from "react";
import { useNearestStation } from "@/hooks/useNearestStation";
import { useArrivals } from "@/hooks/useArrivals";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Loader2, Train } from "lucide-react";
import { lineStyle } from "@/lib/tfl/colours";

function ArrivalsList({ stationId }: { stationId: string }) {
  const { arrivals, loading, error } = useArrivals(stationId);

  if (loading) return (
    <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-[#5f5f5d]">
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>Fetching live predictions...</span>
    </div>
  );

  if (error) return (
    <div className="px-4 py-2 text-[12px] text-red-500">Live data temporarily unavailable</div>
  );

  if (arrivals.length === 0) return (
    <div className="px-4 py-2 text-[12px] text-[#5f5f5d]">No upcoming arrivals scheduled</div>
  );

  return (
    <div className="flex flex-col py-1">
      {arrivals.map((arr, idx) => (
        <div key={idx} className="flex items-center justify-between px-4 py-2 hover:bg-[#fcfbf8] transition-colors border-b border-[var(--border-passive)] last:border-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: lineStyle(arr.lineName).backgroundColor }} />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#1c1c1c]">{arr.lineName}</span>
              <span className="text-[11px] text-[#5f5f5d] truncate max-w-[140px]">to {arr.destinationName}</span>
            </div>
          </div>
          <span className="text-[13px] font-bold text-[#1c1c1c]">{arr.timeToStation}m</span>
        </div>
      ))}
    </div>
  );
}

function StationPill({ station, isExpanded, onToggle }: { station: any, isExpanded: boolean, onToggle: () => void }) {
  const { arrivals } = useArrivals(station.id);
  const nextArrival = arrivals[0];

  return (
    <div className="flex flex-col gap-2 w-full">
      <button 
        onClick={onToggle}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 rounded-full border bg-white shadow-sm transition-all text-left",
          isExpanded ? "border-[#1c1c1c] ring-1 ring-[#1c1c1c]" : "border-[var(--border-passive)] hover:border-[#1c1c1c]"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f7f4ed] flex items-center justify-center text-lg">🚇</div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#1c1c1c]">{station.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#5f5f5d] font-bold">{station.distance}m away</span>
              {nextArrival && (
                <span className="text-[11px] text-green-600 font-bold">• Live: {nextArrival.lineName} in {nextArrival.timeToStation}m</span>
              )}
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-[#5f5f5d]" /> : <ChevronDown className="w-5 h-5 text-[#5f5f5d]" />}
      </button>

      {isExpanded && (
        <div className="mx-2 bg-white rounded-2xl border border-[var(--border-passive)] overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <ArrivalsList stationId={station.id} />
        </div>
      )}
    </div>
  );
}

export function TransportInfo({ latitude, longitude }: { latitude: number, longitude: number }) {
  const { stations, loading, error } = useNearestStation(latitude, longitude);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (loading) return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border-passive)] bg-[#f7f4ed]/50 animate-pulse">
      <div className="w-5 h-5 bg-[#5f5f5d]/20 rounded-full" />
      <div className="h-4 w-40 bg-[#5f5f5d]/20 rounded" />
    </div>
  );

  if (error || stations.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[14px] font-bold text-[#1c1c1c] flex items-center gap-2">
          <Train className="w-4 h-4" /> Nearest Stations
        </h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {stations.map((station) => (
          <StationPill 
            key={station.id} 
            station={station} 
            isExpanded={expandedId === station.id}
            onToggle={() => setExpandedId(expandedId === station.id ? null : station.id)}
          />
        ))}
      </div>
    </div>
  );
}
