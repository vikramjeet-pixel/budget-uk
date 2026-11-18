"use client";

import React, { useRef, useState, useMemo } from "react";
import Map, { MapRef, NavigationControl, Marker, Popup, Source, Layer } from "react-map-gl/maplibre";
import useSupercluster from "use-supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Banknote, Beer, Coffee, Drama, Dumbbell, GraduationCap, House, Laptop,
  MapPin, Rocket, Satellite, Scissors, Shirt, ShoppingCart, Ticket, Utensils,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PIN_CATEGORIES,
  PIN_CATEGORY_LABELS,
  VISION_GROUP,
  VISION_GROUP_SWATCHES,
  applyMapBaseTheme,
  getPinStyle,
  type ColorVisionMode,
  type PinCategory,
} from "@/lib/colorVision";
import { useColorVision } from "@/hooks/useColorVision";

export interface MapSpot {
  id?: string;
  name: string;
  category: string;
  neighbourhood: string;
  priceTier: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

interface ClusterPointProperties {
  cluster?: boolean;
  point_count?: number;
  spot?: MapSpot;
  spotId?: string;
  category?: string;
}

interface MapViewProps {
  className?: string;
  spots?: MapSpot[];
  activeSpotId?: string;
  onMarkerClick?: (spot: MapSpot | null) => void;
  userLocation?: [number, number] | null;
  initialCenter?: { lat: number; lng: number };
}

const LONDON_BOUNDS: [[number, number], [number, number]] = [
  [-0.510375, 51.286760],
  [0.334015, 51.691874],
];

/** Emoji icons — used in Default Vision to keep the original look. */
const CATEGORY_EMOJI: Record<PinCategory, string> = {
  food: "🍽️", housing: "🏠", "student-housing": "🎓", workspace: "💻", coffee: "☕",
  accelerator: "🚀", vc: "💰", gym: "💪", bars: "🍺",
  grocery: "🛒", entertainment: "🎭", vintage: "🧥", services: "✂️", free: "🎟️",
};

/**
 * Monochrome glyph icons — used in every colour-vision mode. They take the
 * pin's high-contrast foreground colour, so categories are identifiable by
 * shape as well as shade (essential for achromatopsia).
 */
const CATEGORY_ICONS: Record<PinCategory, LucideIcon> = {
  food: Utensils, housing: House, "student-housing": GraduationCap, workspace: Laptop,
  coffee: Coffee, accelerator: Rocket, vc: Banknote, gym: Dumbbell, bars: Beer,
  grocery: ShoppingCart, entertainment: Drama, vintage: Shirt, services: Scissors, free: Ticket,
};

function CategoryGlyph({ category, mode, size }: { category: string; mode: ColorVisionMode; size: number }) {
  if (mode === "default") {
    return (
      <span className="drop-shadow-sm select-none leading-none" style={{ fontSize: size }} aria-hidden="true">
        {CATEGORY_EMOJI[category as PinCategory] ?? "📍"}
      </span>
    );
  }
  const Icon = CATEGORY_ICONS[category as PinCategory] ?? MapPin;
  const { fg } = getPinStyle(mode, category);
  return <Icon aria-hidden="true" width={size} height={size} strokeWidth={2.25} color={fg} />;
}

export function MapView({ className, spots = [], activeSpotId, userLocation, onMarkerClick, initialCenter }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const visionMode = useColorVision();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [firstSymbolLayerId, setFirstSymbolLayerId] = useState<string | undefined>(undefined);
  
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

  const activeSpot = useMemo(() => spots.find(s => s.id === activeSpotId), [spots, activeSpotId]);

  // Re-theme the MapLibre base vector layers whenever visionMode or satellite mode changes.
  React.useEffect(() => {
    if (!mapLoaded) return;
    const m = mapRef.current?.getMap();
    if (m) applyMapBaseTheme(m, visionMode, isSatellite);
  }, [visionMode, isSatellite, mapLoaded]);

  const userGpsColor = VISION_GROUP_SWATCHES[VISION_GROUP[visionMode]][0];

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden bg-[var(--border-passive)]", className)}
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
        onLoad={(e) => {
          const firstSym = e.target.getStyle()?.layers?.find((l) => l.type === "symbol")?.id;
          setFirstSymbolLayerId(firstSym);
          setMapLoaded(true);
          applyMapBaseTheme(e.target, visionMode, isSatellite);
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

        {isSatellite && (
          <Source
            id="esri-world-imagery"
            type="raster"
            tiles={[
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ]}
            tileSize={256}
            maxzoom={19}
          >
            <Layer
              id="esri-world-imagery-layer"
              type="raster"
              beforeId={firstSymbolLayerId}
              paint={{ "raster-opacity": 1 }}
            />
          </Source>
        )}

        {/* User Raw GPS Marker explicitly injecting animated ping cycles cleanly avoiding index clashes */}
        {userLocation && (
          <Marker
            longitude={userLocation[1]}
            latitude={userLocation[0]}
            style={{ zIndex: 100 }}
          >
            <div className="relative flex h-5 w-5 items-center justify-center">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: userGpsColor }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-[#fcfbf8] shadow-md"
                style={{ backgroundColor: userGpsColor }}
              ></span>
            </div>
          </Marker>
        )}

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount, spot, spotId, category = "gym" } =
            cluster.properties as ClusterPointProperties;

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
                if (onMarkerClick && spot) onMarkerClick(spot);
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
                {(() => {
                  const pin = getPinStyle(visionMode, category);
                  const isActive = activeSpotId === spotId;
                  return (
                    <div
                      role="img"
                      aria-label={PIN_CATEGORY_LABELS[category as PinCategory] ?? category}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-10 rounded-xl shadow-md transition-shadow",
                        isActive ? "shadow-xl" : "shadow-sm"
                      )}
                      style={{
                        backgroundColor: pin.bg,
                        borderColor: pin.border,
                        borderStyle: pin.borderStyle,
                        borderWidth: isActive ? 3 : visionMode === "default" ? 2 : 2.5,
                      }}
                    >
                      <CategoryGlyph category={category} mode={visionMode} size={20} />
                    </div>
                  );
                })()}
              </div>
            </Marker>
          );
        })}

        {/* Map Popover (Screenshot style) */}
        {activeSpot && (
          <Popup
            longitude={activeSpot.location.longitude}
            latitude={activeSpot.location.latitude}
            anchor="bottom"
            onClose={() => onMarkerClick?.(null)}
            closeButton={false}
            offset={20}
            className="z-[60]"
          >
            <div className="bg-white p-4 rounded-[20px] shadow-2xl border border-white min-w-[200px] animate-in zoom-in-95 duration-200">
              <h3 className="text-[16px] font-bold text-[#1c1c1c] leading-tight mb-1">
                {activeSpot.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[12px] text-[#5f5f5d] font-medium mb-1">
                <span>{activeSpot.neighbourhood}</span>
                <span>·</span>
                <span>{activeSpot.priceTier === "free" ? "Free" : activeSpot.priceTier}</span>
              </div>
              <div className="text-[12px] text-[#1c1c1c]/60 font-medium">
                {activeSpot.category.charAt(0).toUpperCase() + activeSpot.category.slice(1)}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 z-10 flex-col gap-1.5 p-4 bg-[#fcfbf8]/90 backdrop-blur-sm rounded-2xl border border-white shadow-xl max-w-[170px] animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto max-h-[90vh]">
        <h4 className="text-[11px] font-bold text-[#1c1c1c] uppercase tracking-wider mb-1 opacity-50 px-1">Legend</h4>
        {PIN_CATEGORIES.map(category => {
          const pin = getPinStyle(visionMode, category);
          const showGlyph = visionMode !== "default";
          return (
            <div key={category} className="flex items-center gap-2.5 px-1 py-0.5 group cursor-default">
              <div
                className={cn(
                  "flex items-center justify-center rounded-[5px] shrink-0 shadow-sm transition-transform group-hover:scale-110",
                  showGlyph ? "w-5 h-5" : "w-3.5 h-3.5"
                )}
                style={{
                  backgroundColor: pin.bg,
                  // White legend borders vanish on the light panel in accessible modes.
                  borderColor: showGlyph && pin.border.toUpperCase() === "#FFFFFF" ? "#1C1C1C" : pin.border,
                  borderStyle: pin.borderStyle,
                  borderWidth: 2,
                }}
              >
                {showGlyph && <CategoryGlyph category={category} mode={visionMode} size={11} />}
              </div>
              <span className="text-[12px] font-medium text-[#1c1c1c] leading-none tracking-tight">
                {PIN_CATEGORY_LABELS[category]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Satellite / Map View Toggle */}
      <button
        type="button"
        onClick={() => setIsSatellite((prev) => !prev)}
        aria-pressed={isSatellite}
        aria-label={isSatellite ? "Switch to standard map view" : "Switch to satellite view"}
        className={cn(
          "absolute top-2.5 right-12 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold shadow-md border transition-colors cursor-pointer",
          isSatellite
            ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]"
            : "bg-[#fcfbf8]/95 backdrop-blur-sm text-[#1c1c1c] border-white hover:bg-[#f7f4ed]"
        )}
      >
        <Satellite className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{isSatellite ? "Map" : "Satellite"}</span>
      </button>

      <div className="absolute bottom-2 right-2 bg-[#f7f4ed] border border-[var(--border-passive)] text-[#1c1c1c] text-[10px] px-2 py-[2px] rounded-[4px] shadow-sm z-10 opacity-80 hover:opacity-100 transition-opacity flex gap-1">
        {isSatellite && (
          <>
            <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Esri</a>
            <span>|</span>
          </>
        )}
        <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenFreeMap</a>
        <span>|</span>
        <span>&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a></span>
      </div>
    </div>
  );
}

export default MapView;
