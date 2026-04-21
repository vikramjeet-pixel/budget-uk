"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSpots } from "@/hooks/useSpots";
import { SpotCard } from "@/components/features/SpotCard";
import { CategoryPills } from "@/components/features/CategoryPills";
import { NeighbourhoodFilter } from "@/components/features/NeighbourhoodFilter";
import { SpotDrawer } from "@/components/features/SpotDrawer";
import { Search } from "lucide-react";
import { Header } from "@/components/features/Header";

function SpotsGridContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [drawerSpotId, setDrawerSpotId] = useState<string | undefined>(undefined);
  
  // Extract URL States natively routing parameter bounds smoothly
  const currentCats = searchParams.get("cat")?.split(",").filter(Boolean) || [];
  const selectedNbhs = searchParams.get("nbh")?.split(",").filter(Boolean) || [];
  const selectedBors = searchParams.get("bor")?.split(",").filter(Boolean) || [];
  const queryText = searchParams.get("q") || "";
  
  // Standard Array bounds parsing max outputs reliably handling massive maps globally
  const { spots: rawSpots, loading } = useSpots({
    categories: currentCats,
    neighbourhoods: selectedNbhs,
    boroughs: selectedBors
  });
  
  // Client-Side substring fuzzy matching structurally bypassing Firestore's strict index limits!
  const filteredSpots = queryText 
    ? rawSpots.filter(spot => 
        spot.name.toLowerCase().includes(queryText.toLowerCase()) || 
        spot.description.toLowerCase().includes(queryText.toLowerCase()) ||
        spot.neighbourhood?.toLowerCase().includes(queryText.toLowerCase()) ||
        spot.tags?.some((t: string) => t.toLowerCase().includes(queryText.toLowerCase()))
      )
    : rawSpots;

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col">
      <Header />
      
      {/* Heavy Sticky Sub-Nav blocking standard scroll bleeding securely */}
      {/* 64px covers a standard header explicitly preventing overlaps organically */}
      <div className="sticky top-0 md:top-0 z-30 bg-[#fcfbf8]/95 backdrop-blur-md border-b border-[var(--border-passive)] px-4 py-3 flex flex-col gap-3 shadow-sm">
        
        <CategoryPills />
        <NeighbourhoodFilter />
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
           
           {/* Dynamic Number String Math tracking explicit string structures uniquely mapping arrays natively! */}
           <span className="t-caption text-[#5f5f5d]">
             {rawSpots.length > 0 
               ? `${rawSpots.length} target${rawSpots.length === 1 ? '' : 's'} in London · ${filteredSpots.length} match` 
               : "Scanning global parameters..."}
           </span>
           
           <div className="relative w-full md:w-[320px]">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5d]" />
             <input 
               type="text"
               placeholder="Search places, areas, or tags..."
               value={queryText}
               onChange={(e) => {
                 const newParams = new URLSearchParams(searchParams.toString());
                 if (e.target.value) {
                    newParams.set("q", e.target.value);
                 } else {
                    newParams.delete("q");
                 }
                 router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
               }}
               className="w-full bg-[#fcfbf8] border border-[var(--border-interactive)] rounded-full pl-9 pr-4 py-[6px] text-[14px] outline-none focus:border-[#1c1c1c] focus:shadow-md transition-all shadow-sm text-[#1c1c1c]"
             />
           </div>
        </div>
      </div>

      {/* Grid Render Logic natively pinning 3 columns seamlessly executing active structural scales! */}
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="w-full py-20 text-center text-[#5f5f5d] animate-pulse font-medium">Processing node topologies natively...</div>
        ) : filteredSpots.length === 0 ? (
          <div className="w-full py-20 text-center text-[#5f5f5d] font-medium">No intersections mapping your exact configurations strictly.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredSpots.map(spot => (
              <SpotCard 
                key={spot.id} 
                spot={spot} 
                isActive={drawerSpotId === spot.id}
                onClick={() => setDrawerSpotId(spot.id)}
              />
            ))}
          </div>
        )}
      </main>

      <SpotDrawer 
        spot={rawSpots.find(s => s.id === drawerSpotId) || null}
        onClose={() => setDrawerSpotId(undefined)}
      />
    </div>
  );
}

export default function SpotsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen text-center py-40">Loading grid matrix...</div>}>
       <SpotsGridContent />
    </Suspense>
  )
}
