"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addPlace, syncProfileFromAuthUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthSession } from "@/lib/useAuthSession";
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
  suburb: "",
  city: "",
  postcode: "",
  lat: "",
  lng: "",
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

const NZ_COUNTRY_NAME = "New Zealand";
const NZ_MIN_LAT = -53;
const NZ_MAX_LAT = -34;
const NZ_MIN_LNG = 166;
const NZ_MAX_LNG = 179;

interface GeocodeResult {
  address: string;
  city: string;
  suburb?: string;
  postcode?: string;
  lat: number;
  lng: number;
}

export default function AddPlacePage() {
  const router = useRouter();
  const { session, loading: authLoading, isConfigured } = useAuthSession();
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof defaultForm, string>>>({});
  const [pending, setPending] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.lat.trim()) newErrors.lat = "Latitude is required";
    if (!form.lng.trim()) newErrors.lng = "Longitude is required";
    if (form.lat && Number.isNaN(Number(form.lat))) newErrors.lat = "Latitude must be a number";
    if (form.lng && Number.isNaN(Number(form.lng))) newErrors.lng = "Longitude must be a number";
    if (
      form.lat &&
      form.lng &&
      !Number.isNaN(Number(form.lat)) &&
      !Number.isNaN(Number(form.lng)) &&
      !isWithinNewZealandBounds(Number(form.lat), Number(form.lng))
    ) {
      newErrors.lat = "Coordinates must be within New Zealand.";
      newErrors.lng = "Coordinates must be within New Zealand.";
    }
    return newErrors;
  };

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!isWithinNewZealandBounds(coords.latitude, coords.longitude)) {
          setGeoLoading(false);
          setGeoError("Current location is outside New Zealand.");
          return;
        }

        setForm((current) => ({
          ...current,
          lat: coords.latitude.toFixed(6),
          lng: coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setGeoError(error.message || "Unable to read your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddressLookup = async () => {
    const query = [form.address.trim(), form.suburb.trim(), form.city.trim(), form.postcode.trim()]
      .filter(Boolean)
      .join(", ");
    if (!query) {
      setLookupError("Enter a New Zealand address before lookup.");
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setGeoError(null);

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`);
      const data = (await response.json()) as GeocodeResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to find a New Zealand address.");
      }

      const result = data as GeocodeResult;
      setForm((current) => ({
        ...current,
        address: result.address || current.address,
        suburb: result.suburb || current.suburb,
        city: result.city || current.city,
        postcode: result.postcode || current.postcode,
        lat: formatCoordinate(String(result.lat)) || current.lat,
        lng: formatCoordinate(String(result.lng)) || current.lng,
      }));
      setErrors((current) => ({
        ...current,
        address: undefined,
        city: undefined,
        lat: undefined,
        lng: undefined,
      }));
    } catch (error) {
      setLookupError(
        error instanceof Error ? error.message : "Unable to find a New Zealand address."
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setPending(true);
    setSubmitError(null);

    try {
      if (isConfigured && session?.user) {
        await syncProfileFromAuthUser(session.user);
      }

      const created = await addPlace({
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: NZ_COUNTRY_NAME,
        lat: Number(form.lat),
        lng: Number(form.lng),
        category: form.category,
        website: form.website.trim() || undefined,
        phone: form.phone.trim() || undefined,
        description: form.description.trim() || undefined,
        submitted_by: session?.user.id,
        gluten_free_menu: form.gluten_free_menu,
        dedicated_fryer: form.dedicated_fryer,
        dedicated_kitchen: form.dedicated_kitchen,
        staff_trained: form.staff_trained,
        cross_contact_notes: form.cross_contact_notes.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => router.push(`/places/${created.id}`), 1200);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit this place.");
    } finally {
      setPending(false);
    }
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

  const requiresAuth = isSupabaseConfigured();
  const isAuthenticated = Boolean(session?.user);

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
          Help the community discover coeliac-safe venues in New Zealand.
        </p>
      </div>

      {requiresAuth ? (
        authLoading ? (
          <div className="bg-stone-100 border border-stone-200 rounded-xl p-4 text-sm text-stone-600">
            Checking your session…
          </div>
        ) : isAuthenticated ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            Signed in as <strong>{session?.user.email}</strong>. Your contribution will appear on your profile.
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Sign in required.</strong> Please{" "}
            <Link href="/login?next=/add-place" className="underline">sign in</Link> to add a place.
          </div>
        )
      ) : (
        <div className="bg-stone-100 border border-stone-200 rounded-xl p-4 text-sm text-stone-600">
          Demo mode: place submissions are not persisted until Supabase is configured.
        </div>
      )}

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
              <input type="tel" placeholder="+64 9 123 4567" {...field("phone")} className={inputCls()} />
            </FormField>
          </div>

          <FormField label="Address *" error={errors.address}>
            <input
              type="text"
              placeholder="123 Example Street (New Zealand)"
              value={form.address}
              onChange={(e) => {
                const address = e.target.value;
                setForm((current) => ({ ...current, address }));
                setErrors((current) => ({ ...current, address: undefined }));
                setLookupError(null);
              }}
              autoComplete="street-address"
              className={inputCls(!!errors.address)}
            />
          </FormField>

          <div className="grid sm:grid-cols-3 gap-4">
            <FormField label="Suburb">
              <input
                type="text"
                placeholder="Mount Eden"
                value={form.suburb}
                onChange={(e) => setForm((current) => ({ ...current, suburb: e.target.value }))}
                className={inputCls()}
              />
            </FormField>
            <FormField label="City *" error={errors.city}>
              <input type="text" placeholder="Auckland" {...field("city")} className={inputCls(!!errors.city)} />
            </FormField>
            <FormField label="Postcode">
              <input
                type="text"
                placeholder="1024"
                value={form.postcode}
                onChange={(e) => setForm((current) => ({ ...current, postcode: e.target.value }))}
                className={inputCls()}
              />
            </FormField>
          </div>
          <p className="text-xs text-stone-500">Country: {NZ_COUNTRY_NAME} (fixed)</p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={handleAddressLookup}
              disabled={lookupLoading}
              className="border border-stone-300 rounded-xl px-4 py-2 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              {lookupLoading ? "Looking up…" : "Look up NZ address"}
            </button>
            <span className="text-stone-500">Uses New Zealand-only address lookup.</span>
          </div>
          {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Latitude *" error={errors.lat}>
              <input type="text" placeholder="-36.8485" {...field("lat")} className={inputCls(!!errors.lat)} />
            </FormField>
            <FormField label="Longitude *" error={errors.lng}>
              <input type="text" placeholder="174.7633" {...field("lng")} className={inputCls(!!errors.lng)} />
            </FormField>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={captureCurrentLocation}
              disabled={geoLoading}
              className="border border-stone-300 rounded-xl px-4 py-2 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              {geoLoading ? "Locating…" : "Use current location"}
            </button>
            {geoError && <span className="text-red-600">{geoError}</span>}
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

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || (requiresAuth && !isAuthenticated)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {pending ? "Submitting…" : "Submit Place"}
        </button>
      </form>
    </div>
  );
}

function formatCoordinate(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(6) : "";
}

function isWithinNewZealandBounds(lat: number, lng: number) {
  return lat >= NZ_MIN_LAT && lat <= NZ_MAX_LAT && lng >= NZ_MIN_LNG && lng <= NZ_MAX_LNG;
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
