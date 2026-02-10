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

function MapLoading({ height }: { height: string }) {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-md border"
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  );
}

const MapContent = dynamic(() => import("../maps/MapContent"), {
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
    </div>
  );
}