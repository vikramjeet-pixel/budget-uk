"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MapView from "@/components/features/Map";
import { useSpots } from "@/hooks/useSpots";
import { useNearbySpots } from "@/hooks/useNearbySpots";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SpotCard } from "@/components/features/SpotCard";
import { CategoryPills } from "@/components/features/CategoryPills";
import { NeighbourhoodFilter } from "@/components/features/NeighbourhoodFilter";
import { PriceDietaryFilter } from "@/components/features/PriceDietaryFilter";
import { LocationToast } from "@/components/features/LocationToast";
import { SpotDrawer } from "@/components/features/SpotDrawer";
import { SpotCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

function HomePageContent() {
  const searchParams = useSearchParams();
  const [activeSpotId, setActiveSpotId] = useState<string | undefined>(undefined);
  const [drawerSpotId, setDrawerSpotId] = useState<string | undefined>(undefined);
  
  // Geolocation Bounds natively tracking variables explicitly
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);
  
  const currentCats = searchParams.get("cat")?.split(",").filter(Boolean) || [];
  const selectedNbhs = searchParams.get("nbh")?.split(",").filter(Boolean) || [];
  const selectedBors = searchParams.get("bor")?.split(",").filter(Boolean) || [];
  const selectedPrices = searchParams.get("price")?.split(",").filter(Boolean) || [];
  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const isNearMe = searchParams.get("nearby") === "true";

  // Watch boundary tracking location natively hitting browser DOM payloads
  useEffect(() => {
    if (isNearMe && !userLocation && !showLocationToast) {
       if (typeof window !== "undefined" && window.isSecureContext && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation([position.coords.latitude, position.coords.longitude]);
              setShowLocationToast(false);
            },
            (err) => {
              console.warn("Location structurally denied organically parsing fallback bounds:", err);
              setShowLocationToast(true);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
          );
       } else {
          // HTTPS constraints or literal browser lack of parameters natively block it
          setShowLocationToast(true);
       }
    } else if (!isNearMe) {
       setUserLocation(null);
       setShowLocationToast(false);
    }
  }, [isNearMe, userLocation, showLocationToast]);

  const { spots: standardSpots, loading: standardLoading } = useSpots(
    !isNearMe ? {
      categories: currentCats,
      neighbourhoods: selectedNbhs,
      boroughs: selectedBors,
      priceTiers: selectedPrices,
      tags: selectedTags,
    } : { status: "paused_hook" }
  );

  const { spots: nearbySpots, loading: nearbyLoading } = useNearbySpots({
    center: userLocation,
    radiusInM: 2000,
    category: currentCats.length === 1 ? currentCats[0] : undefined,
    enabled: isNearMe && userLocation !== null
  });

  const spots = isNearMe ? nearbySpots : standardSpots;
  const loading = isNearMe 
    ? (nearbyLoading || (isNearMe && !userLocation && !showLocationToast) || showLocationToast) 
    : standardLoading;

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative bg-[#fcfbf8]">
      
      {/* Map Pane - Left Desktop / Top Mobile */}
      <div className="sticky top-0 md:fixed md:top-0 md:left-0 z-0 h-[60vh] w-full md:h-screen md:w-[60%]">
        
        {/* Dynamic Fallback Injection Context */}
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
            setDrawerSpotId(spot.id);
            document.getElementById(`spot-card-${spot.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      </div>

      {/* List Pane - Right Desktop / Slides over bottom Mobile */}
      <div className="relative z-10 flex w-full flex-col bg-[#fcfbf8] rounded-t-2xl md:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] md:shadow-none md:absolute md:top-0 md:right-0 md:w-[40%] md:h-screen md:overflow-y-auto border-t md:border-l md:border-t-0 border-[var(--border-passive)] mt-[-20px] md:mt-0 pt-0">
        
        {/* Mobile slide grab-handle */}
        <div className="w-12 h-1.5 bg-[var(--border-passive)] rounded-[9999px] mx-auto mt-3 mb-2 md:hidden" />

        {/* Header & Categories Sticky Block */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-[#fcfbf8] via-[#fcfbf8] to-transparent pt-4 pb-4 px-4 backdrop-blur-sm flex flex-col gap-1">
          <CategoryPills />
          <div className="flex flex-wrap gap-2">
            <NeighbourhoodFilter />
            <PriceDietaryFilter />
          </div>
        </div>

        {/* Spot Feed Map */}
        <div className="flex flex-col px-4 pb-20 space-y-4">
          {loading ? (
            <>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SpotCardSkeleton key={i} />
              ))}
            </>
          ) : spots.length === 0 ? (
            <EmptyState
              message="No spots found — try broadening your filters or exploring a different area."
              cta="Clear filters"
              ctaHref="/"
            />
          ) : (
            spots.map((spot) => (
              <SpotCard 
                key={spot.id}
                spot={spot}
                isActive={activeSpotId === spot.id || drawerSpotId === spot.id}
                onClick={() => setDrawerSpotId(spot.id)}
                onMouseEnter={() => setActiveSpotId(spot.id)}
                onMouseLeave={() => setActiveSpotId(undefined)}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Explicitly Map Interactive Overlays natively mapping states! */}
      <SpotDrawer 
        spot={spots.find((s) => s.id === drawerSpotId) || null} 
        onClose={() => setDrawerSpotId(undefined)} 
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col md:flex-row min-h-screen bg-[#fcfbf8]">
        <div className="h-[60vh] w-full md:h-screen md:w-[60%] shimmer" />
        <div className="flex flex-col gap-4 px-4 pt-4 md:w-[40%]">
          {[0, 1, 2, 3, 4].map((i) => <SpotCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
