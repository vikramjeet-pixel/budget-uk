"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import Map, { MapRef, Marker, Source, Layer, LayerProps } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { CITIES, City } from "@/data/cities";
import { useWorldMapStats } from "@/hooks/useWorldMapStats";
import { ComingSoonModal } from "@/components/features/ComingSoonModal";
import { Plus, Minus, Maximize2 } from "lucide-react";
import { 
  trackMapCityClick, 
  trackMapSpotClick, 
  trackMapZoomLevel, 
  trackMapHeatmapToggle 
} from "@/lib/analytics";

interface WorldMapProps {
  className?: string;
  onCityClick?: (city: City) => void;
  selectedCitySlug?: string;
  spots?: any[];
  activeSpotId?: string;
  onSpotClick?: (spot: any) => void;
  showHeatmap?: boolean;
}

const WORLD_CENTER = { lng: -5, lat: 50, zoom: 3 };

export function WorldMap({ 
  className, 
  onCityClick, 
  selectedCitySlug,
  spots = [],
  activeSpotId,
  onSpotClick,
  showHeatmap = false
}: WorldMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(3);
  const { stats } = useWorldMapStats();
  const [comingSoonCity, setComingSoonCity] = useState<City | null>(null);

  // ─── Heatmap Layer ──────────────────────────────────────────────────────────
  
  const spotGeoJSON = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: spots.map(spot => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [spot.location.longitude, spot.location.latitude]
      },
      properties: {
        weight: spot.voteCount || 1
      }
    }))
  }), [spots]);

  const heatmapLayer: LayerProps = {
    id: 'spot-heatmap',
    type: 'heatmap',
    source: 'spots',
    maxzoom: 15,
    minzoom: 10,
    layout: {
      visibility: showHeatmap ? 'visible' : 'none'
    },
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 100, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 15, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(247, 244, 237, 0)',
        0.2, '#f7f4ed',      // cool = cream
        0.5, '#e8d5c4',    // mid = warmer cream
        1, '#c8a882'       // hot = peach/tan
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 15, 15, 40],
      'heatmap-opacity': 0.8
    }
  };

  // ─── Controls ───────────────────────────────────────────────────────────────

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleReset = () => {
    mapRef.current?.flyTo({ 
      center: [WORLD_CENTER.lng, WORLD_CENTER.lat], 
      zoom: WORLD_CENTER.zoom,
      duration: 1500 
    });
    if (onCityClick) {
        // We don't have a "null" city to pass, so we might need a reset callback
    }
  };

  // ─── Interactivity ──────────────────────────────────────────────────────────

  const handleMarkerClick = (city: City) => {
    trackMapCityClick(city.name);
    if (city.comingSoon) {
      setComingSoonCity(city);
    } else {
      mapRef.current?.flyTo({
        center: [city.lng, city.lat],
        zoom: 12,
        duration: 1500
      });
      if (onCityClick) onCityClick(city);
    }
  };

  useEffect(() => {
    if (selectedCitySlug) {
      const city = CITIES.find(c => c.slug === selectedCitySlug);
      if (city) {
        mapRef.current?.flyTo({
          center: [city.lng, city.lat],
          zoom: 12,
          duration: 1500
        });
      }
    }
  }, [selectedCitySlug]);

  // ─── Analytics Effects ──────────────────────────────────────────────────────

  useEffect(() => {
    trackMapHeatmapToggle(showHeatmap);
  }, [showHeatmap]);

  useEffect(() => {
    const timer = setTimeout(() => {
      trackMapZoomLevel(zoom);
    }, 1000); // Debounce zoom tracking
    return () => clearTimeout(timer);
  }, [zoom]);

  return (
    <div 
      className={cn("relative w-full h-full overflow-hidden bg-[#ede9e1]", className)}
      style={{ filter: "sepia(0.05) saturate(0.95)" }}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: WORLD_CENTER.lng,
          latitude: WORLD_CENTER.lat,
          zoom: WORLD_CENTER.zoom,
        }}
        onMove={evt => setZoom(evt.viewState.zoom)}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="spots" type="geojson" data={spotGeoJSON}>
          <Layer {...heatmapLayer} />
        </Source>

        {/* City Markers (World View) */}
        {zoom < 10 && CITIES.map(city => {
          const isLive = !city.comingSoon;
          const count = stats[city.slug] || 0;
          
          return (
            <Marker
              key={city.slug}
              longitude={city.lng}
              latitude={city.lat}
              onClick={e => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(city);
              }}
            >
              <div 
                className={cn(
                  "group relative flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-110 px-3 py-2 rounded-full shadow-lg border",
                  isLive 
                    ? "bg-[#1c1c1c] text-[#fcfbf8] border-[#1c1c1c]" 
                    : "bg-[#f7f4ed] text-[#1c1c1c]/60 border-passive",
                  selectedCitySlug === city.slug && "ring-2 ring-[#1c1c1c] ring-offset-2"
                )}
              >
                <span className="text-[12px] font-semibold whitespace-nowrap">
                  {city.name} {isLive ? `${count} spots` : "Coming Soon"}
                </span>
                {isLive && (
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] border border-white" />
                )}
              </div>
            </Marker>
          );
        })}

        {/* Individual Spot Markers (City View) */}
        {zoom >= 10 && spots.map(spot => (
          <Marker
            key={spot.id}
            longitude={spot.location.longitude}
            latitude={spot.location.latitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              trackMapSpotClick(spot.name, spot.city);
              if (onSpotClick) onSpotClick(spot);
            }}
          >
            <div 
              className={cn(
                "group relative flex items-center justify-center cursor-pointer transition-all duration-200",
                activeSpotId === spot.id ? "scale-125 z-50" : "scale-100 hover:scale-110"
              )}
            >
              <div className="absolute -inset-[2px] bg-white/40 rounded-xl blur-[1px] group-hover:bg-white/60" />
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-lg border-2 border-white shadow-md bg-[#1c1c1c] text-white",
                activeSpotId === spot.id && "ring-2 ring-[#1c1c1c] ring-offset-2"
              )}>
                <span className="text-[16px]">{spot.priceTier}</span>
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {/* Custom Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-[#fcfbf8] border border-passive rounded-xl flex items-center justify-center shadow-lg hover:bg-[#f7f4ed] transition-colors"
        >
          <Plus className="w-5 h-5 text-[#1c1c1c]" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-[#fcfbf8] border border-passive rounded-xl flex items-center justify-center shadow-lg hover:bg-[#f7f4ed] transition-colors"
        >
          <Minus className="w-5 h-5 text-[#1c1c1c]" />
        </button>
        <button 
          onClick={handleReset}
          className="w-10 h-10 bg-[#fcfbf8] border border-passive rounded-xl flex items-center justify-center shadow-lg hover:bg-[#f7f4ed] transition-colors"
        >
          <Maximize2 className="w-5 h-5 text-[#1c1c1c]" />
        </button>
      </div>

      <ComingSoonModal 
        city={comingSoonCity}
        open={!!comingSoonCity}
        onOpenChange={(open) => !open && setComingSoonCity(null)}
      />
    </div>
  );
}
