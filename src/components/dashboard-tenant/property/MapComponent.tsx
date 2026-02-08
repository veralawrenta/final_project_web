"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

// Simple loading component
function MapLoading({ height }: { height: string }) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center bg-muted rounded-lg"
    >
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  );
}

// The actual map - loaded only on client
const MapContent = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => <MapLoading height="350px" />,
});

export function InteractiveMap({
  latitude,
  longitude,
  onLocationChange,
  height = "300px",
  className = "",
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <MapLoading height={height} />;
  }

  return (
    <div className={className}>
      <MapContent
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        height={height}
      />
      <p className="text-xs text-muted-foreground mt-2">
        💡 Click or drag marker to set location
      </p>
    </div>
  );
}