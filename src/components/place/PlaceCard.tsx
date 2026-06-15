import Link from "next/link";
import { safetyBgColor, getSafetyTags, starsString, categoryLabels } from "@/lib/utils";
import type { Place } from "@/types";

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const tags = getSafetyTags(place);
  const safetyRating = place.avg_safety_rating ?? 0;

  return (
    <Link href={`/places/${place.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-md hover:border-green-300 transition-all p-4 h-full flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-stone-900 group-hover:text-green-700 transition-colors leading-tight">
              {place.name}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {categoryLabels[place.category] ?? place.category} · {place.city}
            </p>
          </div>
          {safetyRating > 0 && (
            <span
              className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${safetyBgColor(safetyRating)}`}
            >
              Safety {safetyRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-sm text-stone-600 line-clamp-2">{place.description}</p>
        )}

        {/* Safety tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-xs text-stone-500">
          <span>
            {place.avg_overall_rating
              ? starsString(place.avg_overall_rating) + " " + place.avg_overall_rating.toFixed(1)
              : "No ratings yet"}
          </span>
          {place.review_count != null && (
            <span>{place.review_count} review{place.review_count !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
