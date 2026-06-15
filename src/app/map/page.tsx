"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getPlaces } from "@/lib/data";
import FilterBar from "@/components/ui/FilterBar";
import type { Place, PlaceFilters } from "@/types";

// Leaflet must be loaded client-side only
const PlacesMap = dynamic(() => import("@/components/map/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stone-200 animate-pulse rounded-xl flex items-center justify-center text-stone-500">
      Loading map…
    </div>
  ),
});

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>({ category: "" });

  useEffect(() => {
    getPlaces(filters).then(setPlaces);
  }, [filters]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Filter bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-stone-600 shrink-0">Filter:</span>
          <FilterBar filters={filters} onChange={setFilters} />
          <span className="ml-auto text-xs text-stone-400">{places.length} places</span>
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative">
        <PlacesMap places={places} />

        {/* Floating list link */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <Link
            href="/places"
            className="bg-white shadow-lg rounded-full px-5 py-2 text-sm font-medium text-green-700 border border-stone-200 hover:bg-green-50 transition-colors"
          >
            📋 Switch to List View
          </Link>
        </div>
      </div>
    </div>
  );
}
