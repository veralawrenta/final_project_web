"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  height?: string;
  className?: string;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
}) {
  const [address, setAddress] = useState<string>("");

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "PropertyApp/1.0",
          },
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        return data.display_name;
      }
      return "";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "";
    }
  }, []);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const addr = await reverseGeocode(lat, lng);
      if (onLocationSelect) {
        onLocationSelect(lat, lng, addr);
      }
    },
  });

  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  onLocationSelect,
  height = "400px",
  className = "",
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    };
  }, [latitude, longitude]);

  const handleLocationSelect = useCallback(
    async (lat: number, lng: number, address?: string) => {
      setPosition([lat, lng]);
      if (address) {
        setSelectedAddress(address);
        onLocationSelect?.(lat, lng, address);
      };
    },
    [onLocationSelect]
  );

  const center = position || (latitude && longitude ? [latitude, longitude] : defaultCenter);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={position ? 15 : 13}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {position && (
            <Marker position={position}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Selected Location</p>
                  {selectedAddress && (
                    <p className="text-xs text-muted-foreground mb-1">{selectedAddress}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        <div className="absolute top-4 left-4 z-999 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md border border-border shadow-sm">
          <p className="text-xs text-muted-foreground">
            Click on the map to select a location
          </p>
        </div>
      </div>
      {selectedAddress && (
        <div className="mt-2 p-2 bg-muted rounded-md">
          <p className="text-sm font-medium">Selected Address:</p>
          <p className="text-sm text-muted-foreground">{selectedAddress}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
