"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { distanceBetween } from "geofire-common";
import { useSpots } from "@/hooks/useSpots";
import { useDebounce } from "@/hooks/useDebounce";
import { SpotCard } from "@/components/features/SpotCard";
import { CategoryPills } from "@/components/features/CategoryPills";
import { NeighbourhoodFilter } from "@/components/features/NeighbourhoodFilter";
import { PriceDietaryFilter } from "@/components/features/PriceDietaryFilter";
import { SortDropdown, type SortKey } from "@/components/features/SortDropdown";
import { SpotDrawer } from "@/components/features/SpotDrawer";
import { Search } from "lucide-react";
import type { Spot } from "@/types";

const PRICE_ORDER: Record<string, number> = {
  free: 0, "£": 1, "££": 2, "£££": 3, "££££": 4,
};

function applySort(
  spots: Spot[],
  sortKey: SortKey,
  userLocation: [number, number] | null
): Spot[] {
  const list = [...spots];
  switch (sortKey) {
    case "nearest":
      if (!userLocation) return list;
      return list.sort((a, b) => {
        const da = distanceBetween([a.location.latitude, a.location.longitude], userLocation);
        const db = distanceBetween([b.location.latitude, b.location.longitude], userLocation);
        return da - db;
      });
    case "cheapest":
      return list.sort(
        (a, b) => (PRICE_ORDER[a.priceTier] ?? 99) - (PRICE_ORDER[b.priceTier] ?? 99)
      );
    case "newest":
      return list.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    default: // popular — voteCount desc, createdAt as tiebreak
      return list.sort((a, b) => {
        if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
  }
}

function SpotsGridContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [drawerSpotId, setDrawerSpotId] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const currentCats    = searchParams.get("cat")?.split(",").filter(Boolean) || [];
  const selectedNbhs   = searchParams.get("nbh")?.split(",").filter(Boolean) || [];
  const selectedBors   = searchParams.get("bor")?.split(",").filter(Boolean) || [];
  const selectedPrices = searchParams.get("price")?.split(",").filter(Boolean) || [];
  const selectedTags   = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const sortKey        = (searchParams.get("sort") as SortKey) || "popular";

  // Local input state initialised from URL; debounced value drives URL update.
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(searchInput, 250);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => { /* silently ignore — Nearest sort just won't reorder */ },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  // Auto-request location if "nearest" is already in URL on mount.
  useEffect(() => {
    if (sortKey === "nearest" && !userLocation) requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey]);

  const { spots: rawSpots, loading } = useSpots({
    categories: currentCats,
    neighbourhoods: selectedNbhs,
    boroughs: selectedBors,
    priceTiers: selectedPrices,
    tags: selectedTags,
  });

  // TODO: When the spot index exceeds ~500 docs, replace this client-side filter
  // with an Algolia or Typesense call. Swap point: src/hooks/useSpots.ts —
  // remove the onSnapshot + client filter and call the search client instead.
  const filteredSpots = debouncedQuery
    ? rawSpots.filter(spot =>
        spot.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        spot.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        spot.neighbourhood?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        spot.tags?.some(t => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
      )
    : rawSpots;

  const sortedSpots = applySort(filteredSpots, sortKey, userLocation);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Sticky sub-nav — top-18 sits flush below the fixed header */}
      <div className="sticky top-18 z-30 bg-[#fcfbf8]/95 backdrop-blur-md border-b border-passive px-4 py-3 flex flex-col gap-3 shadow-sm">

        {/* Search + sort — above category pills per spec */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5d]" />
            <input
              type="text"
              placeholder="Search places, areas, or tags…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full bg-[#fcfbf8] border border-passive rounded-full pl-9 pr-4 py-1.5 text-[14px] outline-none focus:border-[#1c1c1c] focus:shadow-md transition-all shadow-sm text-[#1c1c1c]"
            />
          </div>
          <SortDropdown
            isNearestAvailable={userLocation !== null}
            onNearestRequest={requestLocation}
          />
        </div>

        <CategoryPills />

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <NeighbourhoodFilter />
            <PriceDietaryFilter />
          </div>

          <span className="t-caption text-[#5f5f5d]">
            {loading
              ? "Loading spots…"
              : `${rawSpots.length} spot${rawSpots.length === 1 ? "" : "s"} in London · ${filteredSpots.length} match`}
          </span>
        </div>
      </div>

      <main className="grow p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="w-full py-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-passive border-t-[#1c1c1c] rounded-full animate-spin" />
          </div>
        ) : sortedSpots.length === 0 ? (
          <div className="w-full py-20 text-center text-[#5f5f5d]">
            No spots match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {sortedSpots.map(spot => (
              <SpotCard
                key={spot.id}
                spot={spot}
                query={debouncedQuery}
                isActive={drawerSpotId === spot.id}
                onClick={() => setDrawerSpotId(spot.id)}
              />
            ))}
          </div>
        )}
      </main>

      <SpotDrawer
        spot={rawSpots.find(s => s.id === drawerSpotId) ?? null}
        onClose={() => setDrawerSpotId(undefined)}
      />
    </div>
  );
}

export default function SpotsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-passive border-t-[#1c1c1c] rounded-full animate-spin" />
      </div>
    }>
      <SpotsGridContent />
    </Suspense>
  );
}
