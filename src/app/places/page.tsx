"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlaces } from "@/lib/data";
import PlaceCard from "@/components/place/PlaceCard";
import FilterBar from "@/components/ui/FilterBar";
import { calculateDistanceKm } from "@/lib/utils";
import type { Place, PlaceFilters } from "@/types";

export default function PlacesListPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>({ category: "" });
  const [search, setSearch] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getPlaces(filters).then((all) => {
      let nextPlaces = all;

      if (search.trim()) {
        const q = search.toLowerCase();
        nextPlaces = nextPlaces.filter(
          (place) =>
            place.name.toLowerCase().includes(q) || place.city.toLowerCase().includes(q)
        );
      }

      if (userLocation) {
        nextPlaces = nextPlaces
          .map((place) => ({
            ...place,
            distance_km: calculateDistanceKm(userLocation, [place.lat, place.lng]),
          }))
          .filter((place) => (place.distance_km ?? Number.MAX_SAFE_INTEGER) <= radiusKm)
          .sort((a, b) => (a.distance_km ?? Number.MAX_SAFE_INTEGER) - (b.distance_km ?? Number.MAX_SAFE_INTEGER));
      }

      setPlaces(nextPlaces);
    });
  }, [filters, radiusKm, search, userLocation]);

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
        setLocationError(error.message || "Unable to get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Browse Places</h1>
          <p className="text-sm text-stone-500 mt-0.5">{places.length} places found</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/map"
            className="text-sm border border-stone-300 text-stone-600 px-3 py-2 rounded-lg hover:border-green-400 hover:text-green-700 transition-colors"
          >
            🗺️ Map View
          </Link>
          <Link
            href="/add-place"
            className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Add Place
          </Link>
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search by name or city…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:max-w-sm border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={requestLocation}
          disabled={locating}
          className="border border-stone-300 text-stone-700 px-3 py-2 rounded-lg hover:border-green-400 hover:text-green-700 transition-colors text-sm"
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
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-3">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Grid */}
      {places.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No places match your filters.</p>
          <p className="text-sm mt-1">Try removing some filters or{" "}
            <Link href="/add-place" className="text-green-700 hover:underline">add a new place</Link>.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}
