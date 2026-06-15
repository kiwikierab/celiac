"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getPlaces } from "@/lib/data";
import FilterBar from "@/components/ui/FilterBar";
import { calculateDistanceKm } from "@/lib/utils";
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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getPlaces(filters).then((allPlaces) => {
      if (!userLocation) {
        setPlaces(allPlaces);
        return;
      }

      const nearbyPlaces = allPlaces
        .map((place) => ({
          ...place,
          distance_km: calculateDistanceKm(userLocation, [place.lat, place.lng]),
        }))
        .filter((place) => (place.distance_km ?? Number.MAX_SAFE_INTEGER) <= radiusKm)
        .sort((a, b) => (a.distance_km ?? Number.MAX_SAFE_INTEGER) - (b.distance_km ?? Number.MAX_SAFE_INTEGER));

      setPlaces(nearbyPlaces);
    });
  }, [filters, radiusKm, userLocation]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation([coords.latitude, coords.longitude]);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationError(error.message || "Unable to get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Filter bar */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-stone-600 shrink-0">Filter:</span>
          <FilterBar filters={filters} onChange={setFilters} />
          <button
            type="button"
            onClick={requestLocation}
            disabled={locating}
            className="text-sm border border-stone-300 text-stone-600 px-3 py-2 rounded-lg hover:border-green-400 hover:text-green-700 transition-colors"
          >
            {locating ? "Finding you…" : userLocation ? "Refresh near me" : "Near me"}
          </button>
          {userLocation && (
            <select
              value={radiusKm}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              className="border border-stone-300 text-stone-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {[5, 10, 25, 50].map((radius) => (
                <option key={radius} value={radius}>
                  Within {radius} km
                </option>
              ))}
            </select>
          )}
          {userLocation && (
            <button
              type="button"
              onClick={() => setUserLocation(null)}
              className="text-sm text-stone-500 hover:text-green-700"
            >
              Clear
            </button>
          )}
          {locationError && <span className="text-sm text-red-600">{locationError}</span>}
          <span className="ml-auto text-xs text-stone-400">{places.length} places</span>
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative">
        <PlacesMap places={places} center={userLocation ?? undefined} userLocation={userLocation} />

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
