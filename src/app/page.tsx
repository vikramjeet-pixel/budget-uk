"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CITIES, City } from "@/data/cities";
import { Badge } from "@/components/ui/Badge";
import { WorldMap } from "@/components/features/WorldMap";
import { GlobalSearchBar } from "@/components/features/GlobalSearchBar";
import { useWorldMapStats } from "@/hooks/useWorldMapStats";
import { useSpots } from "@/hooks/useSpots";
import { SpotDrawer } from "@/components/features/SpotDrawer";
import { ChevronDown, ChevronUp, MapPin, ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DirectoryPage() {
  const router = useRouter();
  const { stats } = useWorldMapStats();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [drawerSpotId, setDrawerSpotId] = useState<string | undefined>(undefined);

  // Fetch spots for the selected city if any
  const { spots } = useSpots(selectedCity?.slug || "");

  const liveCities = CITIES.filter(c => !c.comingSoon);
  const comingSoonCities = CITIES.filter(c => c.comingSoon);

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
  };

  const handleReset = () => {
    setSelectedCity(null);
  };

  const [cityQuery, setCityQuery] = useState("");

  const filteredLiveCities = useMemo(() => {
    return liveCities.filter(c => c.name.toLowerCase().includes(cityQuery.toLowerCase()));
  }, [liveCities, cityQuery]);

  const filteredComingSoonCities = useMemo(() => {
    return comingSoonCities.filter(c => c.name.toLowerCase().includes(cityQuery.toLowerCase()));
  }, [comingSoonCities, cityQuery]);

  return (
    <div className="min-h-screen bg-[#fcfbf8] flex flex-col">
      {/* Hero Header */}
      <header className="bg-[#f7f4ed] border-b border-passive pt-16 pb-10 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="t-h1 text-[#1c1c1c] tracking-tighter mb-3">
            BudgetUK — Cheap Spots Across the UK
          </h1>
          <p className="t-body text-[#5f5f5d] text-base max-w-2xl mx-auto mb-6">
            Explore budget-friendly places in 20 UK cities. Curated by locals, verified for value.
          </p>
          <GlobalSearchBar />
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-charcoal rounded-full blur-[120px]" />
        </div>
      </header>

      {/* Interactive Exploration Tool */}
      <main className="grow flex flex-col md:flex-row h-[calc(100vh-320px)] min-h-[600px]">
        {/* Sidebar */}
        <aside className="w-full md:w-[320px] lg:w-[400px] bg-white border-b md:border-b-0 md:border-r border-passive flex flex-col z-20">
          <div className="p-6 border-b border-passive bg-[#fcfbf8]">
            <h2 className="text-[18px] font-bold text-[#1c1c1c] mb-4">Select a City</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5f5f5d]" />
              <input 
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Search cities..."
                className="w-full bg-white border border-passive rounded-xl pl-9 pr-4 py-2 text-[14px] outline-none focus:border-[#1c1c1c] transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Live Cities */}
            <div className="p-2 flex flex-col gap-1">
              {filteredLiveCities.map(city => {
                const count = stats[city.slug] || 0;
                const isActive = selectedCity?.slug === city.slug;
                
                return (
                  <button
                    key={city.slug}
                    onClick={() => handleCityClick(city)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl transition-all text-left",
                      isActive 
                        ? "bg-[#1c1c1c] text-[#fcfbf8] shadow-lg" 
                        : "hover:bg-[#f7f4ed] text-[#1c1c1c]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={cn("w-4 h-4", isActive ? "text-white" : "text-[#5f5f5d]")} />
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold">{city.name}</span>
                        <span className={cn("text-[11px] font-medium uppercase tracking-wider", isActive ? "text-white/60" : "text-[#5f5f5d]")}>
                          {count} spots · Live
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${city.slug}/spots`);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Coming Soon Section */}
            <div className="border-t border-passive mt-2">
              <button 
                onClick={() => setShowComingSoon(!showComingSoon)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#f7f4ed] transition-colors"
              >
                <span className="text-[14px] font-bold text-[#5f5f5d]">Coming Soon</span>
                {(showComingSoon || cityQuery) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {(showComingSoon || cityQuery) && (
                <div className="px-2 pb-4 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {filteredComingSoonCities.map(city => (
                    <button
                      key={city.slug}
                      onClick={() => handleCityClick(city)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f7f4ed] text-left opacity-70 hover:opacity-100 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#5f5f5d]" />
                      <span className="text-[14px] text-[#1c1c1c]">{city.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map Controls Sidebar Overlay */}
          <div className="p-4 bg-[#fcfbf8] border-t border-passive">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#1c1c1c]">Heatmap View</span>
                <span className="text-[10px] text-[#5f5f5d]">Visualize density</span>
              </div>
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-colors",
                  showHeatmap ? "bg-[#22c55e]" : "bg-passive"
                )}
              >
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform",
                  showHeatmap ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        </aside>

        {/* Map Container */}
        <div className="relative grow h-full z-10">
          <WorldMap 
            selectedCitySlug={selectedCity?.slug}
            onCityClick={handleCityClick}
            spots={spots}
            activeSpotId={drawerSpotId}
            onSpotClick={(spot) => setDrawerSpotId(spot.id)}
            showHeatmap={showHeatmap}
          />

          {/* Map Overlays */}
          {selectedCity && (
            <div className="absolute top-4 left-4 z-20">
              <button 
                onClick={handleReset}
                className="bg-[#1c1c1c] text-[#fcfbf8] px-4 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
              >
                <ArrowResetIcon />
                View Other Cities
              </button>
            </div>
          )}
        </div>
      </main>

      <SpotDrawer 
        spot={spots.find(s => s.id === drawerSpotId) || null}
        onClose={() => setDrawerSpotId(undefined)}
      />
    </div>
  );
}

function ArrowResetIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    )
}
