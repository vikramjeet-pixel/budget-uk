import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface SpotCardProps {
  spot: any;
  isActive?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showDistance?: boolean;
}

export function SpotCard({ 
  spot, 
  isActive, 
  onClick, 
  onMouseEnter, 
  onMouseLeave, 
  showDistance = true 
}: SpotCardProps) {
  return (
    <div 
      id={`spot-card-${spot.id}`}
      className="transition-transform h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Card 
        className={`h-full cursor-pointer transition-shadow hover:shadow-[var(--focus-shadow)] ${isActive ? 'border-[#1c1c1c]' : ''}`}
        onClick={onClick}
      >
        <div className="flex gap-4 p-4 items-start h-full">
          {/* Square Thumbnail Constraint mapped natively bounding explicit corner locks */}
          <div className="h-24 w-24 flex-shrink-0 bg-[var(--border-passive)] rounded-[6px] overflow-hidden relative">
            {spot.photoUrl ? (
               <Image 
                 src={spot.photoUrl} 
                 alt={spot.name} 
                 fill 
                 sizes="96px"
                 className="object-cover" 
               />
            ) : (
               <div className="w-full h-full bg-[var(--hover-tint)] flex items-center justify-center text-[10px] text-[#5f5f5d]">No Image</div>
            )}
          </div>
          
          <div className="flex flex-col justify-start flex-grow gap-2 h-full">
             <div>
               <h3 className="t-h3 text-[#1c1c1c] leading-tight mb-1">{spot.name}</h3>
               <div className="flex items-center gap-2 flex-wrap">
                 <Badge variant="category">{spot.neighbourhood}</Badge>
                 <Badge variant={spot.priceTier === "free" ? "free" : "tier"}>
                   {spot.priceTier === "free" ? "Free" : spot.priceTier}
                 </Badge>
                 
                 {/* Optional Distance Vector mapped natively rendering purely conditional mathematical locks */}
                 {showDistance && spot.distance !== undefined && (
                   <span className="text-[12px] text-[#5f5f5d] font-medium ml-1">
                     {(spot.distance / 1000).toFixed(1)}km
                   </span>
                 )}
               </div>
             </div>
             
             <p className="text-[#5f5f5d] text-[14px] line-clamp-2 mt-1">
               {spot.description}
             </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
