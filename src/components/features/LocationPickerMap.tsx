"use client";

import React from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onMapClick: (e: any) => void;
  onDragEnd: (e: any) => void;
  mapRef: React.RefObject<any>;
  londonCenter: any;
  mapStyle: string;
  londonBounds: any;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onMapClick,
  onDragEnd,
  mapRef,
  londonCenter,
  mapStyle,
  londonBounds,
}: LocationPickerMapProps) {
  return (
    <Map
      ref={mapRef}
      initialViewState={londonCenter}
      mapStyle={mapStyle}
      maxBounds={londonBounds}
      attributionControl={false}
      minPitch={0}
      maxPitch={0}
      dragRotate={false}
      style={{ width: "100%", height: "100%" }}
      onClick={onMapClick}
      cursor={latitude ? "grab" : "crosshair"}
    >
      <NavigationControl position="top-right" showCompass={false} />
      {latitude !== null && longitude !== null && (
        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
          draggable
          onDragEnd={onDragEnd}
        >
          <MapPin className="w-8 h-8 text-[#1c1c1c] fill-[#1c1c1c] drop-shadow-sm" />
        </Marker>
      )}
    </Map>
  );
}
