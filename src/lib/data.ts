/**
 * Data layer — mock implementation.
 *
 * All functions here mirror what a Supabase-backed version would look like.
 * To connect real data, replace each function body with the corresponding
 * Supabase query, e.g.:
 *
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data } = await supabase.from("places").select("*");
 *
 * See /src/lib/supabase/ for client helpers once you add Supabase.
 */

import type { Place, Review, MenuItem, Photo, PlaceFilters } from "@/types";
import {
  mockPlaces,
  mockReviews,
  mockMenuItems,
  mockPhotos,
} from "@/data/mockData";

// ─── Places ───────────────────────────────────────────────────────────────────

export async function getPlaces(filters?: PlaceFilters): Promise<Place[]> {
  let places = [...mockPlaces];

  if (filters) {
    if (filters.gluten_free_menu) {
      places = places.filter((p) => p.gluten_free_menu);
    }
    if (filters.dedicated_fryer) {
      places = places.filter((p) => p.dedicated_fryer);
    }
    if (filters.dedicated_kitchen) {
      places = places.filter((p) => p.dedicated_kitchen);
    }
    if (filters.staff_trained) {
      places = places.filter((p) => p.staff_trained);
    }
    if (filters.category) {
      places = places.filter((p) => p.category === filters.category);
    }
    if (filters.min_safety_rating) {
      places = places.filter(
        (p) => (p.avg_safety_rating ?? 0) >= (filters.min_safety_rating ?? 0)
      );
    }
  }

  return places;
}

export async function getPlaceById(id: string): Promise<Place | null> {
  return mockPlaces.find((p) => p.id === id) ?? null;
}

export async function addPlace(
  place: Omit<Place, "id" | "created_at">
): Promise<Place> {
  // TODO: Replace with Supabase insert when ready
  const newPlace: Place = {
    ...place,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  // In mock mode, this does nothing persistent — refresh will reset
  return newPlace;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviewsForPlace(placeId: string): Promise<Review[]> {
  return mockReviews.filter((r) => r.place_id === placeId);
}

export async function addReview(
  review: Omit<Review, "id" | "created_at">
): Promise<Review> {
  // TODO: Replace with Supabase insert when ready
  const newReview: Review = {
    ...review,
    id: String(Date.now()),
    created_at: new Date().toISOString(),
  };
  return newReview;
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export async function getMenuItemsForPlace(placeId: string): Promise<MenuItem[]> {
  return mockMenuItems.filter((m) => m.place_id === placeId);
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function getPhotosForPlace(placeId: string): Promise<Photo[]> {
  return mockPhotos.filter((ph) => ph.place_id === placeId);
}
