"use client";

import React from "react";
import Image from "next/image";
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
        <div className="flex gap-4 p-4 items-start h-full">
          <div className="h-24 w-24 shrink-0 bg-passive rounded-sm overflow-hidden relative">
            {spot.photoUrl ? (
              <Image
                src={spot.photoUrl}
                alt={spot.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-(--hover-tint) flex items-center justify-center text-[10px] text-[#5f5f5d]">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col justify-start grow gap-2 h-full">
            <div>
              <h3 className="t-h3 text-[#1c1c1c] leading-tight mb-0.5">
                {highlightText(spot.name, query)}
              </h3>
              {spot.approxPriceGbp !== undefined && (
                <div className="text-[12px] text-[#5f5f5d] font-medium mb-1.5 opacity-80">
                  {spot.priceTier === "free" ? "Always Free" : `~£${spot.approxPriceGbp} ${spot.category === "food" ? "per meal" : spot.category === "coffee" ? "per cup" : ""}`}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[14px] text-[#5f5f5d] font-medium">
                  {spot.neighbourhood} {spot.postcodeDistrict ? `· ${spot.postcodeDistrict}` : ""}
                </span>
                <Badge variant={spot.priceTier === "free" ? "free" : "tier"}>
                  {spot.priceTier === "free" ? "Free" : spot.priceTier}
                </Badge>
                {showDistance && spot.distance !== undefined && (
                  <span className="text-[12px] text-[#565] font-medium ml-1">
                    · {(spot.distance / 1000).toFixed(1)}km
                  </span>
                )}
              </div>

              {(spot.website || spot.placeData?.website) && (
                <a 
                  href={spot.website || spot.placeData?.website || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[13px] text-[#1c1c1c] font-medium hover:text-[#565] underline-offset-4 hover:underline mb-2 block w-fit bg-[#f0ede4] px-2 py-0.5 rounded-sm border border-[#e5e0d5] transition-colors"
                >
                  <span>Visit Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <p className="text-[#5f5f5d] text-[14px] line-clamp-2 mt-auto">
              {highlightText(spot.description, query)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
