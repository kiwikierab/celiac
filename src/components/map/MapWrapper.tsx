"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/types";

// Leaflet must be loaded client-side only — this wrapper ensures SSR is skipped
const PlacesMap = dynamic(() => import("@/components/map/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="surface-soft flex h-full w-full items-center justify-center text-sm text-[color:var(--muted)]">
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
