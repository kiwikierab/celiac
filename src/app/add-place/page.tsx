"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PlaceCategory } from "@/types";

const CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "cafe", label: "Café" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bakery", label: "Bakery" },
  { value: "takeaway", label: "Takeaway" },
  { value: "other", label: "Other" },
];

const defaultForm = {
  name: "",
  address: "",
  city: "",
  country: "Australia",
  category: "cafe" as PlaceCategory,
  website: "",
  phone: "",
  description: "",
  gluten_free_menu: false,
  dedicated_fryer: false,
  dedicated_kitchen: false,
  staff_trained: false,
  cross_contact_notes: "",
};

export default function AddPlacePage() {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // TODO: Connect to Supabase — insert into places table
    // const supabase = createClient();
    // const { data } = await supabase.from("places").insert({ ...form, submitted_by: session.user.id }).select().single();
    // router.push(`/places/${data.id}`);

    // Mock: just show success
    setSubmitted(true);
    setTimeout(() => router.push("/places"), 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-stone-800">Place submitted!</h2>
        <p className="text-stone-500">Thank you for contributing to the community.</p>
      </div>
    );
  }

  const field = (key: keyof typeof defaultForm) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <nav className="text-sm text-stone-500 flex gap-1">
        <Link href="/places" className="hover:text-green-700">Places</Link>
        <span>/</span>
        <span className="text-stone-700">Add a Place</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Add a New Place</h1>
        <p className="text-sm text-stone-500 mt-1">
          Help the community discover coeliac-safe venues.
        </p>
      </div>

      {/* Auth notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> You are submitting as a guest (auth coming soon).{" "}
        <Link href="/login" className="underline">Sign in</Link> to track your contributions.
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-stone-800 border-b border-stone-200 pb-2 w-full">
            Basic Information
          </legend>

          <FormField label="Place Name *" error={errors.name}>
            <input
              type="text"
              placeholder="e.g. The Gluten-Free Grain"
              {...field("name")}
              className={inputCls(!!errors.name)}
            />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as PlaceCategory })}
                className={inputCls()}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Phone">
              <input type="tel" placeholder="+61 3 9000 0000" {...field("phone")} className={inputCls()} />
            </FormField>
          </div>

          <FormField label="Address *" error={errors.address}>
            <input type="text" placeholder="123 Main Street" {...field("address")} className={inputCls(!!errors.address)} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="City *" error={errors.city}>
              <input type="text" placeholder="Melbourne" {...field("city")} className={inputCls(!!errors.city)} />
            </FormField>
            <FormField label="Country">
              <input type="text" {...field("country")} className={inputCls()} />
            </FormField>
          </div>

          <FormField label="Website">
            <input type="url" placeholder="https://example.com" {...field("website")} className={inputCls()} />
          </FormField>

          <FormField label="Description">
            <textarea rows={3} placeholder="Brief description of the venue…" {...field("description")} className={inputCls()} />
          </FormField>
        </fieldset>

        {/* Celiac safety */}
        <fieldset className="space-y-4">
          <legend className="text-base font-semibold text-stone-800 border-b border-stone-200 pb-2 w-full">
            🛡️ Celiac Safety
          </legend>

          <div className="grid sm:grid-cols-2 gap-3">
            <CheckboxField
              id="gf_menu"
              label="Gluten-Free Menu Available"
              checked={form.gluten_free_menu}
              onChange={(v) => setForm({ ...form, gluten_free_menu: v })}
            />
            <CheckboxField
              id="ded_fryer"
              label="Dedicated Fryer"
              checked={form.dedicated_fryer}
              onChange={(v) => setForm({ ...form, dedicated_fryer: v })}
            />
            <CheckboxField
              id="ded_kitchen"
              label="Dedicated Kitchen / Prep Area"
              checked={form.dedicated_kitchen}
              onChange={(v) => setForm({ ...form, dedicated_kitchen: v })}
            />
            <CheckboxField
              id="staff_trained"
              label="Staff Trained on Coeliac"
              checked={form.staff_trained}
              onChange={(v) => setForm({ ...form, staff_trained: v })}
            />
          </div>

          <FormField label="Cross-Contact Notes">
            <textarea
              rows={3}
              placeholder="Any details about cross-contact risk, shared equipment, or specific precautions…"
              {...field("cross_contact_notes")}
              className={inputCls()}
            />
          </FormField>
        </fieldset>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Submit Place
        </button>
      </form>
    </div>
  );
}

function inputCls(hasError = false) {
  return `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${
    hasError ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"
  }`;
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
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
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none bg-white border border-stone-200 rounded-xl p-3 hover:border-green-300 transition-colors">
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
