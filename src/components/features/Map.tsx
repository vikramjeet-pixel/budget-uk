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
}

const LONDON_BOUNDS: [[number, number], [number, number]] = [
  [-0.510375, 51.286760],
  [0.334015, 51.691874],
];

const parseCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    food: "🍽️", housing: "🏠", workspace: "💻", coffee: "☕", 
    accelerator: "🚀", vc: "💰", gym: "💪", bars: "🍺", 
    grocery: "🛒", entertainment: "🎭", services: "✂️", free: "🎟️"
  };
  return map[category] || "📍";
};

export function MapView({ className, spots = [], activeSpotId, userLocation, onMarkerClick }: MapViewProps) {
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
          longitude: -0.1276,
          latitude: 51.5074,
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
        maxBounds={LONDON_BOUNDS}
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
          const { cluster: isCluster, point_count: pointCount, spot, spotId } = cluster.properties as any;

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
                <div className="flex items-center justify-center bg-[#1c1c1c] text-[#fcfbf8] rounded-[9999px] w-8 h-8 font-medium text-[12px] shadow-[var(--inset-dark)] border border-[#1c1c1c] cursor-pointer hover:scale-110 transition-transform">
                  {pointCount}
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
              <div className={cn(
                "flex items-center justify-center gap-1.5 bg-[#f7f4ed] rounded-[9999px] px-3 py-1.5 text-[12px] font-medium transition-all shadow-[var(--inset-dark)] cursor-pointer whitespace-nowrap",
                activeSpotId === spotId 
                  ? "scale-110 border border-[#1c1c1c]" // Scaling 1.1 with Charcoal lines
                  : "scale-100 border border-[var(--border-passive)] hover:border-[#1c1c1c]" // Standard cream bordered
              )}>
                <span className="text-[14px] leading-none">{parseCategoryIcon(cluster.properties.category)}</span>
                <span className="text-[#1c1c1c] leading-none tracking-tight">
                  {cluster.properties.priceTier === 'free' ? 'Free' : cluster.properties.priceTier}
                </span>
              </div>
            </Marker>
          );
        })}

      </Map>

      <div className="absolute bottom-2 right-2 bg-[#f7f4ed] border border-[var(--border-passive)] text-[#1c1c1c] text-[10px] px-2 py-[2px] rounded-[4px] shadow-sm z-10 opacity-80 hover:opacity-100 transition-opacity flex gap-1">
        <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenFreeMap</a>
        <span>|</span>
        <span>&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a></span>
      </div>
    </div>
  );
}

export default MapView;
