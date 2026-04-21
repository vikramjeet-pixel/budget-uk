"use client";

import * as React from "react";
import useSWR from "swr";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function StatusBanner() {
  const { data, error } = useSWR("/api/tfl/status", fetcher, {
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: true
  });

  const disruptions = data?.disruptions || [];

  if (error || disruptions.length === 0) return null;

  const disruptionText = disruptions
    .map((d: any) => `${d.name}: ${d.status}`)
    .join(" • ");

  return (
    <div className="relative w-full h-8 bg-[#ffce00] border-b border-[#1c1c1c]/10 overflow-hidden flex items-center z-[100]">
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          display: flex;
          white-space: nowrap;
          animation: marquee 30s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Icon Overlay (Left) */}
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#ffce00] flex items-center z-10 shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
        <AlertTriangle className="w-4 h-4 text-[#1c1c1c]" />
      </div>

      {/* Marquee Content */}
      <div className="flex-1 overflow-hidden">
        <div className="marquee-content flex items-center">
          <div className="flex items-center gap-4 px-4">
            {disruptions.map((d: any, idx: number) => (
              <span key={idx} className="text-[12px] font-bold text-[#1c1c1c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1c]" />
                {d.name}: {d.status}
              </span>
            ))}
          </div>
          {/* Double content for seamless looping */}
          <div className="flex items-center gap-4 px-4">
            {disruptions.map((d: any, idx: number) => (
              <span key={`loop-${idx}`} className="text-[12px] font-bold text-[#1c1c1c] uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1c]" />
                {d.name}: {d.status}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Help Link (Right) */}
      <div className="absolute right-0 top-0 bottom-0 px-3 bg-[#ffce00] flex items-center z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
        <span className="text-[10px] font-bold text-[#1c1c1c] uppercase hidden md:inline">TfL Live Status</span>
        <Info className="w-3 h-3 text-[#1c1c1c] ml-1.5" />
      </div>
    </div>
  );
}
