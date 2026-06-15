/**
 * Utility helpers for ratings, tags, and celiac safety signals.
 */

import type { Place } from "@/types";

/** Convert a numeric rating (1-5) to a display label. */
export function ratingLabel(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Good";
  if (rating >= 2.5) return "Fair";
  if (rating >= 1.5) return "Poor";
  return "Very Poor";
}

/** Returns a Tailwind color class based on safety rating. */
export function safetyColor(rating: number): string {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-lime-600";
  if (rating >= 2.5) return "text-yellow-600";
  if (rating >= 1.5) return "text-orange-600";
  return "text-red-600";
}

/** Returns a background Tailwind color class based on safety rating. */
export function safetyBgColor(rating: number): string {
  if (rating >= 4.5) return "bg-green-100 text-green-800";
  if (rating >= 3.5) return "bg-lime-100 text-lime-800";
  if (rating >= 2.5) return "bg-yellow-100 text-yellow-800";
  if (rating >= 1.5) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

/** Render stars as a string of filled/empty characters. */
export function starsString(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/** Returns active safety feature tags for a place. */
export function getSafetyTags(place: Place): string[] {
  const tags: string[] = [];
  if (place.dedicated_kitchen) tags.push("Dedicated Kitchen");
  if (place.dedicated_fryer) tags.push("Dedicated Fryer");
  if (place.gluten_free_menu) tags.push("GF Menu");
  if (place.staff_trained) tags.push("Trained Staff");
  return tags;
}

/** Returns a short overall safety summary for a place. */
export function safetySummary(place: Place): string {
  const score =
    (place.dedicated_kitchen ? 2 : 0) +
    (place.dedicated_fryer ? 1 : 0) +
    (place.gluten_free_menu ? 1 : 0) +
    (place.staff_trained ? 1 : 0);

  if (score >= 4) return "Very Safe";
  if (score >= 3) return "Generally Safe";
  if (score >= 2) return "Use Caution";
  return "High Risk";
}

/** Format an ISO date string to a short readable format. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Calculate distance between two coordinates in kilometers. */
export function calculateDistanceKm(
  from: [number, number],
  to: [number, number]
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to[0] - from[0]);
  const dLng = toRadians(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from[0])) *
      Math.cos(toRadians(to[0])) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format a distance value for UI display. */
export function formatDistanceKm(distanceKm: number): string {
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m away`
    : `${distanceKm.toFixed(1)} km away`;
}

/** Category display labels. */
export const categoryLabels: Record<string, string> = {
  cafe: "Café",
  restaurant: "Restaurant",
  bakery: "Bakery",
  takeaway: "Takeaway",
  other: "Other",
};
