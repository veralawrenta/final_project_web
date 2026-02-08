"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Fix Leaflet marker icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface MapControllerProps {
  position: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
}

function MapController({ position, onLocationChange }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const pos = e.target.getLatLng();
          onLocationChange(pos.lat, pos.lng);
        },
      }}
    />
  );
}

interface MapContentProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height: string;
}

export default function MapContent({
  latitude,
  longitude,
  onLocationChange,
  height,
}: MapContentProps) {
  const position: [number, number] = [latitude || -6.2088, longitude || 106.8456];

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height, width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController position={position} onLocationChange={onLocationChange} />
    </MapContainer>
  );
}