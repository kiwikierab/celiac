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
    <div className="surface-card space-y-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-stone-800">
            <Link href={`/users/${review.user_id}`} className="transition-colors hover:text-[color:var(--brand)]">
              {review.user_name}
            </Link>
          </p>
          <p className="text-xs text-[color:var(--muted)]">{formatDate(review.created_at)}</p>
        </div>
        <div className="text-right">
          <div className="text-yellow-500 text-sm">{starsString(review.overall_rating)}</div>
          <p className="text-xs text-[color:var(--muted)]">{review.overall_rating}/5 overall</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-stone-600">
        <span>
          🛡️ Safety{" "}
          <span className="font-semibold text-stone-800">{review.safety_rating}/5</span>
        </span>
        <span>
          😋 Taste{" "}
          <span className="font-semibold text-stone-800">{review.taste_rating}/5</span>
        </span>
        {review.would_return && (
          <span className="font-medium text-[color:var(--brand)]">✓ Would return</span>
        )}
      </div>

      {review.notes && <p className="text-sm text-stone-700">{review.notes}</p>}

      <div className="flex flex-wrap gap-2 text-xs">
        {review.staff_knowledgeable && (
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel-sage)] px-3 py-1 text-[color:var(--brand)]">
            Staff knowledgeable
          </span>
        )}
        {review.cross_contact_mentioned && (
          <span className="rounded-full border border-[color:var(--stroke)] bg-[#fff1ec] px-3 py-1 text-[#b44f3b]">
            Cross-contact discussed
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[color:var(--muted)]">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </p>
        <ReportButton entityId={review.id} entityType="review" compact />
      </div>

      {comments.length > 0 && (
        <div className="surface-soft space-y-2 p-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-stone-700">
                  <Link href={`/users/${comment.user_id}`} className="font-medium hover:text-[color:var(--brand)]">
                    {comment.user_name}
                  </Link>{" "}
                  {comment.body}
                </p>
                <p className="text-xs text-[color:var(--muted)]">{formatDate(comment.created_at)}</p>
              </div>
              <ReportButton entityId={comment.id} entityType="review_comment" compact />
            </div>
          ))}
        </div>
      )}

      {isConfigured && user && (
        <div className="surface-soft space-y-2 p-3">
          <textarea
            rows={2}
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Add a comment to this review"
            className="form-input"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={handleCommentSubmit}
            disabled={pending}
            className="btn-primary self-start text-xs"
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </div>
      )}
    </div>
  );
}
