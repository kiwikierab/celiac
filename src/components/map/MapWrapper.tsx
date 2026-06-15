"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/types";

// Leaflet must be loaded client-side only — this wrapper ensures SSR is skipped
const PlacesMap = dynamic(() => import("@/components/map/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-200 animate-pulse rounded-xl flex items-center justify-center text-stone-500 text-sm">
      Loading map…
    </div>
  ),
});

interface MapWrapperProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string;
  userLocation?: [number, number] | null;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <PlacesMap {...props} />;
}
