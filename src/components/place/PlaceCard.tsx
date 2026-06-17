import Link from "next/link";
import {
  safetyBgColor,
  getSafetyTags,
  starsString,
  categoryLabels,
  formatDistanceKm,
} from "@/lib/utils";
import type { Place } from "@/types";

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const tags = getSafetyTags(place);
  const safetyRating = place.avg_safety_rating ?? 0;

  return (
    <Link href={`/places/${place.id}`} className="block group">
      <div className="surface-card flex h-full flex-col gap-4 p-5 transition-transform duration-150 group-hover:-translate-y-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              {categoryLabels[place.category] ?? place.category}
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-stone-900 transition-colors group-hover:text-[color:var(--brand)]">
              {place.name}
            </h3>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {place.city}, {place.country}
            </p>
          </div>
          {safetyRating > 0 && (
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${safetyBgColor(safetyRating)}`}
            >
              Safety {safetyRating.toFixed(1)}
            </span>
          )}
        </div>

        {place.description && (
          <p className="line-clamp-3 text-sm leading-6 text-stone-600">{place.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel-sage)] px-3 py-1 text-xs font-medium text-[color:var(--brand)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>
            {place.avg_overall_rating
              ? starsString(place.avg_overall_rating) + " " + place.avg_overall_rating.toFixed(1)
              : "No ratings yet"}
          </span>
          {place.review_count != null && (
            <span>{place.review_count} review{place.review_count !== 1 ? "s" : ""}</span>
          )}
        </div>
        {place.distance_km != null && (
          <p className="text-sm font-medium text-[color:var(--brand)]">
            {formatDistanceKm(place.distance_km)}
          </p>
        )}
      </div>
    </Link>
  );
}
