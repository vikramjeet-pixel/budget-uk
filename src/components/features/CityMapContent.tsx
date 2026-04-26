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
import { City } from "@/data/cities";

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

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative bg-[#fcfbf8]">
      
      {/* Map Pane */}
      <div className="sticky top-0 md:fixed md:top-0 md:left-0 z-0 h-[60vh] w-full md:h-screen md:w-[60%]">
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
          // Pass city center to Map if needed
          initialCenter={{ lat: city.lat, lng: city.lng }}
        />
      </div>

      {/* List Pane */}
      <div className="relative z-10 flex w-full flex-col bg-[#fcfbf8] rounded-t-2xl md:rounded-none shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] md:shadow-none md:absolute md:top-0 md:right-0 md:w-[40%] md:h-screen md:overflow-y-auto border-t md:border-l md:border-t-0 border-[var(--border-passive)] mt-[-20px] md:mt-0 pt-0">
        <div className="w-12 h-1.5 bg-[var(--border-passive)] rounded-[9999px] mx-auto mt-3 mb-2 md:hidden" />

        <div className="sticky top-0 z-20 bg-gradient-to-b from-[#fcfbf8] via-[#fcfbf8] to-transparent pt-4 pb-4 px-4 backdrop-blur-sm flex flex-col gap-1">
          <CategoryPills />
          <div className="flex flex-wrap gap-2">
            <NeighbourhoodFilter citySlug={city.slug} />
            <PriceDietaryFilter />
          </div>
        </div>

        <div className="flex flex-col px-4 pb-20 space-y-4">
          {city.slug === "london" && currentCats.includes("grocery") && (
            <EditorialCallout 
              title="The Meal Deal Hack"
              content="Tesco, Sainsbury&apos;s, and Boots all offer &apos;meal deals&apos;: a main, side, and drink for £3.50–£4.50. This is the cheapest consistent lunch in London."
            />
          )}

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
              ctaHref={`/${city.slug}`}
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
      
      <SpotDrawer 
        spot={spots.find((s) => s.id === drawerSpotId) || null} 
        onClose={() => setDrawerSpotId(undefined)} 
      />
    </div>
  );
}
