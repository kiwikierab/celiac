"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function WriteReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase — insert into reviews table with user_id from auth session
    // const supabase = createClient();
    // await supabase.from("reviews").insert({ ...form, place_id: id, user_id: session.user.id });
    setSubmitted(true);
    setTimeout(() => router.push(`/places/${id}`), 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold text-stone-800">Review submitted!</h2>
        <p className="text-stone-500">Redirecting back to the place…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <nav className="text-sm text-stone-500 flex gap-1">
        <Link href="/places" className="hover:text-green-700">Places</Link>
        <span>/</span>
        <Link href={`/places/${id}`} className="hover:text-green-700">Place</Link>
        <span>/</span>
        <span className="text-stone-700">Write Review</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Write a Review</h1>
        <p className="text-sm text-stone-500 mt-1">
          Help the community stay safe. Your experience matters.
        </p>
      </div>

      {/* Auth notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> You are posting as a guest (auth coming soon).{" "}
        <Link href="/login" className="underline">Sign in</Link> to link reviews to your account.
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ratings */}
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

        {/* Checkboxes */}
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

        {/* Notes */}
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
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Submit Review
        </button>
      </form>
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
      {hint && <p className="text-xs text-stone-500 mb-1">{hint}</p>}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
            className={`w-9 h-9 rounded-full text-lg border transition-colors ${
              n <= value
                ? "bg-yellow-400 border-yellow-400 text-white"
                : "bg-white border-stone-300 text-stone-400 hover:border-yellow-400"
            }`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-stone-600 self-center">{value}/5</span>
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
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-green-600"
      />
      <span className="text-sm text-stone-700">{label}</span>
    </label>
  );
}
