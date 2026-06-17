"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getPlaces } from "@/lib/data";
import FilterBar from "@/components/ui/FilterBar";
import { calculateDistanceKm } from "@/lib/utils";
import type { Place, PlaceFilters } from "@/types";

const PlacesMap = dynamic(() => import("@/components/map/PlacesMap"), {
  ssr: false,
  loading: () => (
    <div className="surface-soft flex h-full min-h-[520px] items-center justify-center text-sm text-[color:var(--muted)]">
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
        .sort(
          (a, b) =>
            (a.distance_km ?? Number.MAX_SAFE_INTEGER) -
            (b.distance_km ?? Number.MAX_SAFE_INTEGER)
        );

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
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="surface-card px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="eyebrow">Map-led explore</span>
                <h1 className="display-title mt-3 text-stone-900">Browse safe places with the full map experience</h1>
                <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
                  Compare venues geographically, apply coeliac safety filters, and keep a
                  quick shortlist close by while you explore New Zealand.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/places" className="btn-secondary">
                  Back to list
                </Link>
                <Link href="/add-place" className="btn-accent">
                  + Add place
                </Link>
              </div>
            </div>

            <div className="surface-soft p-4">
              <div className="flex flex-wrap items-center gap-3">
                <FilterBar filters={filters} onChange={setFilters} />
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
                <span className="ml-auto text-sm font-medium text-[color:var(--muted)]">
                  {places.length} places
                </span>
              </div>
            </div>

            {locationError && <p className="text-sm text-red-700">{locationError}</p>}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <section className="surface-card overflow-hidden p-4">
            <div className="h-[62vh] min-h-[520px] rounded-[28px] border border-[color:var(--stroke)] bg-[color:var(--panel-sage)]">
              <PlacesMap places={places} center={userLocation ?? undefined} userLocation={userLocation} />
            </div>
          </section>

          <aside className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Shortlist
                </p>
                <h2 className="mt-1 text-xl font-semibold text-stone-900">Places on this view</h2>
              </div>
              <Link href="/places" className="btn-muted text-sm">
                List view
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {places.length > 0 ? (
                places.slice(0, 5).map((place) => (
                  <Link
                    key={place.id}
                    href={`/places/${place.id}`}
                    className="surface-soft block p-4 transition-transform duration-150 hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{place.name}</p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {place.city} · {place.review_count ?? 0} reviews
                        </p>
                      </div>
                      <span className="rounded-full bg-[color:var(--panel-sage)] px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                        {place.avg_safety_rating?.toFixed(1) ?? "—"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="surface-soft px-4 py-10 text-center text-sm text-[color:var(--muted)]">
                  No places match the current filters.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
