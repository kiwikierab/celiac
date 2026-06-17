"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getPlaces } from "@/lib/data";
import PlaceCard from "@/components/place/PlaceCard";
import FilterBar from "@/components/ui/FilterBar";
import { calculateDistanceKm } from "@/lib/utils";
import type { Place, PlaceFilters } from "@/types";

const PlacesMap = dynamic(() => import("@/components/map/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="surface-soft flex h-full min-h-[320px] items-center justify-center text-sm text-[color:var(--muted)]">
      Loading map…
    </div>
  ),
});

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
          .sort(
            (a, b) =>
              (a.distance_km ?? Number.MAX_SAFE_INTEGER) -
              (b.distance_km ?? Number.MAX_SAFE_INTEGER)
          );
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
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="surface-card px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="eyebrow">Browse safe spots</span>
                <h1 className="display-title mt-3 text-stone-900">Editorial list meets map-first explore</h1>
                <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
                  Search New Zealand venues, refine the safety signals that matter to you,
                  and keep the map in view while you compare places.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/places" className="btn-primary">
                  List view
                </Link>
                <Link href="/map" className="btn-secondary">
                  Full map
                </Link>
                <Link href="/add-place" className="btn-accent">
                  + Add place
                </Link>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <input
                type="search"
                placeholder="Search by name or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locating}
                  className="btn-secondary text-sm"
                >
                  {locating ? "Finding you…" : userLocation ? "Refresh near me" : "Near me"}
                </button>
                {userLocation && (
                  <select
                    value={radiusKm}
                    onChange={(event) => setRadiusKm(Number(event.target.value))}
                    className="form-input min-w-[150px]"
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
                    className="btn-muted text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {locationError && <p className="text-sm text-red-700">{locationError}</p>}

            <div className="surface-soft p-4">
              <FilterBar filters={filters} onChange={setFilters} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[color:var(--muted)]">
                {places.length} place{places.length !== 1 ? "s" : ""} ready to browse
              </p>
              <span className="hidden rounded-full bg-[color:var(--panel-sage)] px-3 py-1 text-xs font-semibold text-[color:var(--brand)] sm:inline-flex">
                NZ-focused results
              </span>
            </div>

            {places.length === 0 ? (
              <div className="surface-card px-6 py-14 text-center text-[color:var(--muted)]">
                <div className="text-4xl">🔍</div>
                <p className="mt-4 text-lg font-semibold text-stone-900">
                  No places match your filters.
                </p>
                <p className="mt-2 text-sm">
                  Try adjusting the filters or{" "}
                  <Link href="/add-place" className="font-semibold text-[color:var(--brand)] underline">
                    add a new place
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="surface-card p-4">
              <div className="flex items-center justify-between gap-3 px-2 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    Explore snapshot
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-stone-900">Keep the map in view</h2>
                </div>
                <Link href="/map" className="btn-muted text-sm">
                  Expand
                </Link>
              </div>
              <div className="overflow-hidden rounded-[28px] border border-[color:var(--stroke)]">
                <div className="h-[360px] bg-[color:var(--panel-sage)]">
                  <PlacesMap places={places} center={userLocation ?? undefined} userLocation={userLocation} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
