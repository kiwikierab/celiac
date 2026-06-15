"use client";

import { useState } from "react";
import Link from "next/link";
import { addReviewComment, syncProfileFromAuthUser } from "@/lib/data";
import { useAuthSession } from "@/lib/useAuthSession";
import { starsString, formatDate } from "@/lib/utils";
import type { Review, ReviewComment } from "@/types";
import ReportButton from "@/components/ui/ReportButton";

interface ReviewCardProps {
  review: Review;
  comments?: ReviewComment[];
}

export default function ReviewCard({
  review,
  comments: initialComments = [],
}: ReviewCardProps) {
  const { isConfigured, user } = useAuthSession();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCommentSubmit = async () => {
    if (!user) {
      return;
    }

    if (!newComment.trim()) {
      setError("Please add a comment.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await syncProfileFromAuthUser(user);
      const created = await addReviewComment({
        review_id: review.id,
        user_id: user.id,
        body: newComment.trim(),
      });
      setComments((current) => [...current, created]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add this comment.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-stone-800 text-sm">
            <Link href={`/users/${review.user_id}`} className="hover:text-green-700 transition-colors">
              {review.user_name}
            </Link>
          </p>
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

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </p>
        <ReportButton entityId={review.id} entityType="review" compact />
      </div>

      {comments.length > 0 && (
        <div className="space-y-2 rounded-xl bg-stone-50 border border-stone-200 p-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-stone-700">
                  <Link href={`/users/${comment.user_id}`} className="font-medium hover:text-green-700">
                    {comment.user_name}
                  </Link>{" "}
                  {comment.body}
                </p>
                <p className="text-xs text-stone-400">{formatDate(comment.created_at)}</p>
              </div>
              <ReportButton entityId={comment.id} entityType="review_comment" compact />
            </div>
          ))}
        </div>
      )}

      {isConfigured && user && (
        <div className="rounded-xl border border-stone-200 p-3 space-y-2">
          <textarea
            rows={2}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Add a comment to this review"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleCommentSubmit}
            disabled={pending}
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </div>
      )}
    </div>
  );
}
