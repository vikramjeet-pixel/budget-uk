"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { highlightText } from "@/lib/highlight";
import { ExternalLink } from "lucide-react";
import type { Spot } from "@/types";

interface SpotCardProps {
  spot: Spot & { distance?: number };
  isActive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showDistance?: boolean;
  query?: string;
}

export function SpotCard({
  spot,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showDistance = true,
  query = "",
}: SpotCardProps) {
  return (
    <div
      id={`spot-card-${spot.id}`}
      className="transition-transform h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Card
        className={`h-full cursor-pointer transition-shadow hover:shadow-focus ${isActive ? "border-[#1c1c1c]" : ""}`}
        onClick={onClick}
      >
        <div className="flex flex-col gap-3 p-5 h-full">
          <div className="flex flex-col justify-start grow gap-2.5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="t-h3 text-[#1c1c1c] font-bold leading-tight">
                {highlightText(spot.name, query)}
              </h3>
              <Badge variant={spot.priceTier === "free" ? "free" : "tier"}>
                {spot.priceTier === "free" ? "Free" : spot.priceTier}
              </Badge>
            </div>

            {spot.approxPriceGbp !== undefined && (
              <div className="text-[12px] text-[#5f5f5d] font-semibold opacity-80">
                {spot.priceTier === "free" ? "Always Free" : `~£${spot.approxPriceGbp} ${spot.category === "food" ? "per meal" : spot.category === "coffee" ? "per cup" : ""}`}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap text-[13px] text-[#5f5f5d] font-medium">
              <span>{spot.neighbourhood} {spot.postcodeDistrict ? `· ${spot.postcodeDistrict}` : ""}</span>
              {showDistance && spot.distance !== undefined && (
                <span className="text-[#565] ml-1">
                  · {(spot.distance / 1000).toFixed(1)}km
                </span>
              )}
            </div>

            <p className="text-[#5f5f5d] text-[14px] leading-relaxed line-clamp-3">
              {highlightText(spot.description, query)}
            </p>
          </div>

          {(spot.website || spot.placeData?.website) && (
            <div className="mt-auto pt-2">
              <a 
                href={spot.website || spot.placeData?.website || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[12px] text-[#1c1c1c] font-bold hover:text-[#565] underline-offset-4 hover:underline bg-[#f0ede4] px-3 py-1 rounded-full border border-[#e5e0d5] transition-colors"
              >
                <span>Website</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
