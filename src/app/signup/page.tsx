"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { syncProfileFromAuthUser } from "@/lib/data";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      setSubmitted(true);
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (data.session && data.user) {
        await syncProfileFromAuthUser(data.user);
        setMessage("Account created. You can now start contributing.");
      } else {
        setMessage("Account created. Check your email to confirm your address before signing in.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold text-stone-900">Join CeliacSafe</h1>
          <p className="text-sm text-stone-500 mt-1">
            Create an account to add places and write reviews
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-800 text-sm">
            <strong>{message ?? "Demo mode only."}</strong> {!isSupabaseConfigured() && " Supabase integration is not yet configured."}
            <br />
            <Link href={isSupabaseConfigured() ? "/login" : "/"} className="underline mt-2 inline-block">
              {isSupabaseConfigured() ? "Continue to sign in" : "Back to home"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {pending ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="text-green-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <div className="text-center text-xs text-stone-400 bg-stone-100 rounded-xl p-3">
          {isSupabaseConfigured() ? (
            <>🔒 New accounts are stored in Supabase Auth.</>
          ) : (
            <>🔒 Auth requires Supabase configuration. See <code>src/lib/supabase/</code> for setup.</>
          )}
        </div>
      </div>
    </div>
  );
}
