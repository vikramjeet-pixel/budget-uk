"use client";

import React, { useRef, useState, useMemo } from "react";
import Map, { MapRef, NavigationControl, Marker } from "react-map-gl/maplibre";
import useSupercluster from "use-supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

interface MapViewProps {
  className?: string;
  spots?: any[];
  activeSpotId?: string;
  onMarkerClick?: (spot: any) => void;
  userLocation?: [number, number] | null;
  initialCenter?: { lat: number; lng: number };
}

const LONDON_BOUNDS: [[number, number], [number, number]] = [
  [-0.510375, 51.286760],
  [0.334015, 51.691874],
];

const parseCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    food: "🍽️", housing: "🏠", "student-housing": "🎓", workspace: "💻", coffee: "☕", 
    accelerator: "🚀", vc: "💰", gym: "💪", bars: "🍺", 
    grocery: "🛒", entertainment: "🎭", vintage: "🧥", services: "✂️", free: "🎟️"
  };
  return map[category] || "📍";
};

const getCategoryStyle = (category: string) => {
  const styles: Record<string, string> = {
    food: "bg-[#ef4444]",           // Red
    housing: "bg-[#10b981]",        // Emerald
    "student-housing": "bg-[#6366f1]", // Indigo
    workspace: "bg-[#0ea5e9]",      // Sky Blue
    coffee: "bg-[#7c2d12]",         // Deep Brown
    accelerator: "bg-[#f59e0b]",    // Amber
    vc: "bg-[#8b5cf6]",             // Violet
    gym: "bg-[#1c1c1c]",            // Black
    bars: "bg-[#f43f5e]",           // Rose
    grocery: "bg-[#0d9488]",        // Teal
    entertainment: "bg-[#d946ef]",  // Fuchsia
    vintage: "bg-[#78350f]",        // Vintage Tan/Brown
    services: "bg-[#64748b]",       // Slate
    free: "bg-[#22c55e]",           // Green
  };
  return styles[category] || "bg-[#1c1c1c]";
};

export function MapView({ className, spots = [], activeSpotId, userLocation, onMarkerClick, initialCenter }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  
  // Track viewport boundary dynamically passing native coordinate limitations heavily into supercluster wrappers
  const [zoom, setZoom] = useState(12);
  const [bounds, setBounds] = useState<[number, number, number, number]>([-0.510375, 51.28676, 0.334015, 51.69187]);

  // Construct raw GeoJSON Points mapped securely mirroring your strict spot interface safely
  const points = useMemo(() => spots.map(spot => ({
    type: "Feature" as const,
    properties: { 
      cluster: false, 
      spotId: spot.id, 
      category: spot.category, 
      priceTier: spot.priceTier, 
      spot 
    },
    geometry: {
      type: "Point" as const,
      coordinates: [spot.location.longitude, spot.location.latitude]
    }
  })), [spots]);

  // Fire up external cluster mapping safely clamping logic below Zoom 12 natively
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 60, maxZoom: 11 }
  });

  // Track Native Geolocations bouncing viewports efficiently mapping exactly to the supplied radius internally
  React.useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({ 
        center: [userLocation[1], userLocation[0]], 
        zoom: 13.5, 
        duration: 2000,
        essential: true 
      });
    }
  }, [userLocation]);

  return (
    <div 
      className={cn("relative w-full h-full overflow-hidden bg-[var(--border-passive)]", className)}
      style={{ filter: "sepia(0.1) saturate(0.9)" }}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: initialCenter?.lng ?? -0.1276,
          latitude: initialCenter?.lat ?? 51.5074,
          zoom: 12,
          pitch: 0,
          bearing: 0,
        }}
        onMove={evt => {
          setZoom(evt.viewState.zoom);
          const b = evt.target.getBounds();
          setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        maxBounds={initialCenter ? undefined : LONDON_BOUNDS}
        attributionControl={false} 
        minPitch={0}
        maxPitch={0}
        dragRotate={false}
        touchPitch={false}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl 
          position="top-right" 
          showCompass={false} 
          showZoom={true} 
        />

        {/* User Raw GPS Marker explicitly injecting animated ping cycles cleanly avoiding index clashes */}
        {userLocation && (
          <Marker
            longitude={userLocation[1]}
            latitude={userLocation[0]}
            style={{ zIndex: 100 }}
          >
            <div className="relative flex h-5 w-5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#2563eb] border-2 border-[#fcfbf8] shadow-md"></span>
            </div>
          </Marker>
        )}

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount, spot, spotId, category } = cluster.properties as any;

          // Clustered State natively rolling up bounds dynamically
          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  // Jump accurately directly enclosing the specific underlying targets
                  const expansionZoom = Math.min(supercluster?.getClusterExpansionZoom(cluster.id as number) ?? 20, 20);
                  mapRef.current?.flyTo({ center: [longitude, latitude], zoom: expansionZoom, duration: 500 });
                }}
              >
                <div className="group relative flex items-center justify-center cursor-pointer hover:z-50 transition-transform hover:scale-110">
                  <div className="absolute -inset-[2px] bg-white/60 rounded-full blur-[1px]" />
                  <div className="relative flex items-center justify-center bg-[#1c1c1c] text-[#fcfbf8] rounded-full w-9 h-9 font-bold text-[13px] border-2 border-white shadow-lg">
                    {pointCount}
                  </div>
                </div>
              </Marker>
            );
          }

          // Individual Leaf Vector displaying exact contextual labels securely!
          return (
            <Marker
              key={`spot-${spotId}`}
              longitude={longitude}
              latitude={latitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                if (onMarkerClick) onMarkerClick(spot);
              }}
              style={{ zIndex: activeSpotId === spotId ? 50 : 10 }}
            >
              <div 
                className={cn(
                  "group relative flex items-center justify-center cursor-pointer transition-all duration-200",
                  activeSpotId === spotId ? "scale-125 z-50" : "scale-100 hover:scale-110"
                )}
              >
                {/* Glow/Border Ring */}
                <div className="absolute -inset-[2px] bg-white/40 rounded-xl blur-[1px] group-hover:bg-white/60" />
                
                {/* Square Marker */}
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white shadow-md transition-shadow",
                    getCategoryStyle(category),
                    activeSpotId === spotId ? "shadow-xl border-[3px]" : "shadow-sm"
                  )}
                >
                  <span className="text-[20px] drop-shadow-sm select-none">
                    {parseCategoryIcon(category)}
                  </span>
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Map Legend */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 z-10 flex-col gap-1.5 p-4 bg-[#fcfbf8]/90 backdrop-blur-sm rounded-2xl border border-white shadow-xl max-w-[170px] animate-in fade-in slide-in-from-left-4 duration-500 overflow-y-auto max-h-[90vh]">
        <h4 className="text-[11px] font-bold text-[#1c1c1c] uppercase tracking-wider mb-1 opacity-50 px-1">Legend</h4>
        {[
          { label: "Food", color: "bg-[#ef4444]" },
          { label: "Housing", color: "bg-[#10b981]" },
          { label: "Student Housing", color: "bg-[#6366f1]" },
          { label: "Work Spaces", color: "bg-[#0ea5e9]" },
          { label: "Coffee", color: "bg-[#7c2d12]" },
          { label: "Accelerators", color: "bg-[#f59e0b]" },
          { label: "VCs", color: "bg-[#8b5cf6]" },
          { label: "Gym", color: "bg-[#1c1c1c]" },
          { label: "Bars", color: "bg-[#f43f5e]" },
          { label: "Grocery", color: "bg-[#0d9488]" },
          { label: "Entertainment", color: "bg-[#d946ef]" },
          { label: "Vintage", color: "bg-[#78350f]" },
          { label: "Services", color: "bg-[#64748b]" }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5 px-1 py-0.5 group cursor-default">
            <div className={cn("w-3.5 h-3.5 rounded-[5px] shrink-0 border-2 border-white shadow-sm transition-transform group-hover:scale-110", item.color)} />
            <span className="text-[12px] font-medium text-[#1c1c1c] leading-none tracking-tight">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 right-2 bg-[#f7f4ed] border border-[var(--border-passive)] text-[#1c1c1c] text-[10px] px-2 py-[2px] rounded-[4px] shadow-sm z-10 opacity-80 hover:opacity-100 transition-opacity flex gap-1">
        <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenFreeMap</a>
        <span>|</span>
        <span>&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a></span>
      </div>
    </div>
  );
}

export default MapView;
