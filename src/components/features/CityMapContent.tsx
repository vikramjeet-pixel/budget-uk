"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const MapView = dynamic(() => import("@/components/features/Map"), { ssr: false });
import { useSpots } from "@/hooks/useSpots";
import { useNearbySpots } from "@/hooks/useNearbySpots";
import { SpotCard } from "@/components/features/SpotCard";
import { CategoryPills } from "@/components/features/CategoryPills";
import { NeighbourhoodFilter } from "@/components/features/NeighbourhoodFilter";
import { PriceDietaryFilter } from "@/components/features/PriceDietaryFilter";
import { LocationToast } from "@/components/features/LocationToast";
import { SpotDrawer } from "@/components/features/SpotDrawer";
import { EditorialCallout } from "@/components/features/EditorialCallout";
import { SpotCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, MapPin, MessageSquare, Brain } from "lucide-react";
import { City } from "@/data/cities";
import { cn } from "@/lib/utils";

interface CityMapContentProps {
  city: City;
}

export function CityMapContent({ city }: CityMapContentProps) {
  const searchParams = useSearchParams();
  const [activeSpotId, setActiveSpotId] = useState<string | undefined>(undefined);
  const [drawerSpotId, setDrawerSpotId] = useState<string | undefined>(undefined);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);
  
  const currentCats = searchParams.get("cat")?.split(",").filter(Boolean) || [];
  const selectedNbhs = searchParams.get("nbh")?.split(",").filter(Boolean) || [];
  const selectedBors = searchParams.get("bor")?.split(",").filter(Boolean) || [];
  const selectedPrices = searchParams.get("price")?.split(",").filter(Boolean) || [];
  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const isNearMe = searchParams.get("nearby") === "true";

  useEffect(() => {
    if (isNearMe && !userLocation && !showLocationToast) {
       const hasGeo = typeof window !== "undefined" && window.isSecureContext && "geolocation" in navigator;
       if (hasGeo) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation([position.coords.latitude, position.coords.longitude]);
              setShowLocationToast(false);
            },
            (err) => {
              console.warn("Location structurally denied:", err);
              setShowLocationToast(true);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
       } else {
          setShowLocationToast(true);
       }
    } else if (!isNearMe && (userLocation || showLocationToast)) {
       setUserLocation(null);
       setShowLocationToast(false);
    }
  }, [isNearMe, userLocation, showLocationToast]);

  // Pass city to useSpots if the hook supports it (I should check)
  const { spots: standardSpots, loading: standardLoading } = useSpots(
    city.slug,
    currentCats,
    [...selectedNbhs, ...selectedBors],
    selectedPrices,
    selectedTags,
    !isNearMe
  );

  const { spots: nearbySpots, loading: nearbyLoading } = useNearbySpots(
    city.slug,
    userLocation?.[0] ?? null,
    userLocation?.[1] ?? null,
    2000,
    currentCats.length === 1 ? currentCats[0] : undefined,
    isNearMe && userLocation !== null
  );

  const spots = isNearMe ? nearbySpots : standardSpots;
  const loading = isNearMe 
    ? (nearbyLoading || (isNearMe && !userLocation && !showLocationToast) || showLocationToast) 
    : standardLoading;

  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  return (
    <div className="relative h-[calc(100vh-72px)] w-full overflow-hidden bg-[#fcfbf8]">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        {showLocationToast && (
           <LocationToast 
              onClose={() => setShowLocationToast(false)} 
              onLocationFound={(loc) => {
                 setUserLocation(loc);
                 setShowLocationToast(false);
              }} 
           />
        )}

        <MapView 
          spots={spots} 
          activeSpotId={drawerSpotId || activeSpotId}
          userLocation={userLocation}
          onMarkerClick={(spot) => {
            setDrawerSpotId(spot ? spot.id : undefined);
          }}
          initialCenter={{ lat: city.lat, lng: city.lng }}
        />
      </div>

      {/* Floating Left Sidebar Controls */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-[340px] z-20 flex flex-col gap-3 pointer-events-none">
        {/* Spot Count Pill */}
        <div className="w-fit px-5 py-3 bg-[#fcfbf8]/95 backdrop-blur-md rounded-2xl border border-white shadow-xl pointer-events-auto">
          <span className="text-[14px] md:text-[15px] font-bold text-[#1c1c1c]">
            {loading ? "..." : spots.length} spots
          </span>
        </div>
        
        {/* Search Pill */}
        <div className="relative w-full max-w-[280px] pointer-events-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5d]" />
          <input 
            type="text"
            placeholder="Search spots..."
            className="w-full bg-[#fcfbf8]/95 backdrop-blur-md border border-white rounded-2xl pl-11 pr-4 py-3 text-[14px] outline-none transition-all shadow-xl"
          />
        </div>

        {/* Near Me Pill */}
        <div className="w-fit pointer-events-auto">
          <button 
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (isNearMe) params.delete("nearby");
              else params.set("nearby", "true");
              window.history.replaceState({}, "", `?${params.toString()}`);
            }}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold transition-all border shadow-xl",
              isNearMe 
                ? "bg-[#1c1c1c] text-white border-[#1c1c1c]" 
                : "bg-[#fcfbf8]/95 backdrop-blur-md text-[#1c1c1c] border-white"
            )}
          >
            <MapPin className={cn("w-4 h-4", isNearMe ? "text-green-400" : "text-[#1c1c1c]")} />
            Near Me
          </button>
        </div>

        {/* Categories (Standalone) */}
        <div className="w-full pointer-events-auto -ml-2">
          <CategoryPills />
        </div>
      </div>

      {/* Results List / Bottom Sheet */}
      <div className={cn(
        "absolute z-30 flex flex-col transition-all duration-500 ease-in-out",
        "bottom-0 left-0 right-0 md:bottom-auto md:top-[280px] md:left-6 md:right-auto md:w-[340px] md:max-h-[calc(100%-300px)]",
        isSheetExpanded ? "h-[70vh]" : "h-[80px] md:h-auto"
      )}>
        {/* Mobile Summary (Visible when collapsed) */}
        <div 
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          className="md:hidden absolute inset-x-0 top-0 h-[80px] bg-white border-t border-passive rounded-t-[24px] shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center gap-0.5 pointer-events-auto cursor-pointer"
        >
          <div className="w-12 h-1 bg-passive/20 rounded-full mb-2" />
          <span className="text-[14px] font-bold text-[#1c1c1c]">
            {spots.length} spots found
          </span>
          <span className="text-[11px] font-medium text-[#5f5f5d]">
            {isSheetExpanded ? "Swipe down to collapse" : "Swipe up to explore"}
          </span>
          
          {/* Floating Action Buttons (Mobile) */}
          <div className="absolute -top-16 left-4 right-4 flex justify-between pointer-events-none">
            <button className="w-12 h-12 bg-[#2d5a4c] rounded-full flex items-center justify-center shadow-lg text-white pointer-events-auto">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 bg-white border border-passive rounded-full flex items-center justify-center shadow-lg text-[#1c1c1c] pointer-events-auto">
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Filter Row (Hidden on mobile) */}
        <div className="hidden md:flex flex-wrap gap-2 mb-2 pointer-events-auto">
          <NeighbourhoodFilter citySlug={city.slug} />
          <PriceDietaryFilter />
        </div>

        {/* The List Container */}
        <div className={cn(
          "grow w-full bg-[#fcfbf8] md:bg-transparent md:rounded-none pointer-events-auto flex flex-col overflow-hidden",
          "mt-[80px] md:mt-0 px-4 md:px-0"
        )}>
          {!loading && spots.length > 0 && (
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-8 md:pb-0 pr-1 pt-2">
              {spots.slice(0, 20).map((spot) => (
                <div 
                  key={spot.id}
                  onClick={() => {
                    setDrawerSpotId(spot.id);
                    setIsSheetExpanded(false); // Collapse on selection
                  }}
                  className="cursor-pointer transform transition-transform active:scale-[0.98]"
                >
                  <SpotCard 
                    spot={spot}
                    isActive={activeSpotId === spot.id || drawerSpotId === spot.id}
                    showDistance={isNearMe}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <SpotDrawer 
        spot={spots.find((s) => s.id === drawerSpotId) || null} 
        onClose={() => setDrawerSpotId(undefined)} 
      />
    </div>
  );
}
