"use client";

import React, { useRef, useMemo } from "react";
import Map, { MapRef, Source, Layer, LayerProps } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { EXPANSION_PHASES } from "@/data/expansion";

interface RoadmapMapProps {
  className?: string;
  activePhase?: number;
}

const WORLD_CENTER = { lng: 0, lat: 20, zoom: 1.5 };

export function RoadmapMap({ className, activePhase }: RoadmapMapProps) {
  const mapRef = useRef<MapRef>(null);

  // ─── Expansion Layers ───────────────────────────────────────────────────────

  const countriesInPhase = useMemo(() => {
    if (!activePhase) {
        // Highlight all phases if none selected? Or just UK?
        return { live: ["United Kingdom"], comingSoon: ["Ireland", "France", "Germany", "Netherlands"], planned: ["Spain", "Italy", "Portugal", "United States of America", "Australia", "Thailand", "Vietnam", "Japan"] };
    }
    const phase = EXPANSION_PHASES.find(p => p.phase === activePhase);
    if (!phase) return { live: [], comingSoon: [], planned: [] };
    
    const countries = phase.countries || [];
    if (phase.status === 'live') return { live: ["United Kingdom"], comingSoon: [], planned: [] };
    if (phase.status === 'coming-soon') return { live: [], comingSoon: countries, planned: [] };
    return { live: [], comingSoon: [], planned: countries };
  }, [activePhase]);

  const roadmapLayer: LayerProps = {
    id: 'countries-fill',
    type: 'fill',
    source: 'world',
    paint: {
      'fill-color': [
        'match',
        ['get', 'name'],
        'United Kingdom', '#1c1c1c',
        countriesInPhase.comingSoon, '#f7f4ed',
        countriesInPhase.planned, 'rgba(28, 28, 28, 0.05)',
        'rgba(28, 28, 28, 0.02)'
      ],
      'fill-opacity': 0.8
    }
  };

  const roadmapOutlineLayer: LayerProps = {
    id: 'countries-outline',
    type: 'line',
    source: 'world',
    paint: {
      'line-color': '#1c1c1c',
      'line-width': [
        'match',
        ['get', 'name'],
        ['United Kingdom', ...countriesInPhase.comingSoon], 1,
        0.2
      ],
      'line-opacity': 0.3
    }
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-[#fcfbf8]", className)}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: WORLD_CENTER.lng,
          latitude: WORLD_CENTER.lat,
          zoom: WORLD_CENTER.zoom,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Source 
          id="world" 
          type="geojson" 
          data="https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"
        >
          <Layer {...roadmapLayer} />
          <Layer {...roadmapOutlineLayer} />
        </Source>
      </Map>
    </div>
  );
}
