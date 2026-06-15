"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlaces } from "@/lib/data";
import PlaceCard from "@/components/place/PlaceCard";
import FilterBar from "@/components/ui/FilterBar";
import type { Place, PlaceFilters } from "@/types";

export default function PlacesListPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filters, setFilters] = useState<PlaceFilters>({ category: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPlaces(filters).then((all) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        setPlaces(all.filter((p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)));
      } else {
        setPlaces(all);
      }
    });
  }, [filters, search]);

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
