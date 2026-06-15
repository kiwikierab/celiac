import type { Review } from "@/types";
import { starsString, formatDate } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-stone-800 text-sm">{review.user_name}</p>
          <p className="text-xs text-stone-400">{formatDate(review.created_at)}</p>
        </div>
        <div className="text-right">
          <div className="text-yellow-500 text-sm">{starsString(review.overall_rating)}</div>
          <p className="text-xs text-stone-500">{review.overall_rating}/5 overall</p>
        </div>
      </div>

      {/* Ratings row */}
      <div className="flex gap-4 text-xs text-stone-600">
        <span>
          🛡️ Safety{" "}
          <span className="font-semibold text-stone-800">{review.safety_rating}/5</span>
        </span>
        <span>
          😋 Taste{" "}
          <span className="font-semibold text-stone-800">{review.taste_rating}/5</span>
        </span>
        {review.would_return && (
          <span className="text-green-600 font-medium">✓ Would return</span>
        )}
      </div>

      {/* Notes */}
      {review.notes && <p className="text-sm text-stone-700">{review.notes}</p>}

      {/* Celiac signals */}
      <div className="flex flex-wrap gap-2 text-xs">
        {review.staff_knowledgeable && (
          <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
            Staff knowledgeable
          </span>
        )}
        {review.cross_contact_mentioned && (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
            Cross-contact discussed
          </span>
        )}
      </div>
    </div>
  );
}
