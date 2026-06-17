"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { addReview, syncProfileFromAuthUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthSession } from "@/lib/useAuthSession";

export default function WriteReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session, loading: authLoading, isConfigured } = useAuthSession();

  const [form, setForm] = useState({
    overall_rating: 4,
    safety_rating: 4,
    taste_rating: 4,
    notes: "",
    staff_knowledgeable: false,
    cross_contact_mentioned: false,
    would_return: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPending(true);
    setSubmitError(null);

    try {
      if (isConfigured && session?.user) {
        await syncProfileFromAuthUser(session.user);
      }

      await addReview({
        ...form,
        place_id: id,
        user_id: session?.user.id ?? "demo-user",
      });

      setSubmitted(true);
      setTimeout(() => router.push(`/places/${id}`), 1500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit this review.");
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="surface-card space-y-4 px-6 py-10">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-stone-800">Review submitted!</h2>
        <p className="text-stone-500">Redirecting back to the place…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <nav className="flex gap-1 text-sm text-[color:var(--muted)]">
        <Link href="/places" className="hover:text-[color:var(--brand)]">Places</Link>
        <span>/</span>
        <Link href={`/places/${id}`} className="hover:text-[color:var(--brand)]">Place</Link>
        <span>/</span>
        <span className="text-stone-700">Write Review</span>
      </nav>

      <section className="surface-card px-6 py-7 sm:px-8">
        <span className="eyebrow">Share your experience</span>
        <h1 className="display-title mt-4 text-stone-900">Write a review</h1>
        <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
          Help the community stay safe. Your experience matters.
        </p>
      </section>

      {isSupabaseConfigured() ? (
        authLoading ? (
          <div className="status-note">
            Checking your session…
          </div>
        ) : session?.user ? (
          <div className="status-success">
            Posting as <strong>{session.user.email}</strong>.
          </div>
        ) : (
          <div className="status-warning">
            <strong>Sign in required.</strong> Please{" "}
            <Link href={`/login?next=/places/${id}/review`} className="underline">sign in</Link> to post a review.
          </div>
        )
      ) : (
        <div className="status-note">
          Demo mode: reviews are not persisted until Supabase is configured.
        </div>
      )}

      <form onSubmit={handleSubmit} className="surface-card space-y-6 px-6 py-7 sm:px-8">
        <div className="space-y-4">
          <RatingField
            label="Overall Rating"
            value={form.overall_rating}
            onChange={(v) => setForm({ ...form, overall_rating: v })}
          />
          <RatingField
            label="🛡️ Safety Rating"
            hint="How safe did you feel eating here as a coeliac?"
            value={form.safety_rating}
            onChange={(v) => setForm({ ...form, safety_rating: v })}
          />
          <RatingField
            label="😋 Taste Rating"
            value={form.taste_rating}
            onChange={(v) => setForm({ ...form, taste_rating: v })}
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-stone-800">
            Celiac Safety Observations
          </legend>
          <CheckboxField
            id="staff_knowledgeable"
            label="Staff were knowledgeable about coeliac disease"
            checked={form.staff_knowledgeable}
            onChange={(v) => setForm({ ...form, staff_knowledgeable: v })}
          />
          <CheckboxField
            id="cross_contact"
            label="Cross-contact precautions were discussed"
            checked={form.cross_contact_mentioned}
            onChange={(v) => setForm({ ...form, cross_contact_mentioned: v })}
          />
          <CheckboxField
            id="would_return"
            label="I would return to this venue"
            checked={form.would_return}
            onChange={(v) => setForm({ ...form, would_return: v })}
          />
        </fieldset>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-stone-800 mb-1">
            Your Review
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Tell others about your experience — what made it safe or unsafe, what you ordered, etc."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="form-input resize-none"
          />
        </div>

        {submitError && (
          <div className="status-danger">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || (isSupabaseConfigured() && !session?.user)}
          className="btn-primary w-full"
        >
          {pending ? "Submitting…" : "Submit Review"}
        </button>
      </form>
      </div>
    </div>
  );
}

function RatingField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-stone-800 mb-1">{label}</label>
      {hint && <p className="mb-1 text-xs text-[color:var(--muted)]">{hint}</p>}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            className={`w-9 h-9 rounded-full text-lg border transition-colors ${
              n <= value
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                : "bg-white border-[color:var(--stroke)] text-stone-400 hover:border-[color:var(--accent)]"
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 self-center text-sm text-[color:var(--muted)]">{value}/5</span>
      </div>
    </div>
  );
}

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="surface-soft flex cursor-pointer items-center gap-3 p-3 select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-[color:var(--brand)]"
      />
      <span className="text-sm text-stone-700">{label}</span>
    </label>
  );
}
