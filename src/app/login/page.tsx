"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncProfileFromAuthUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuthSession } from "@/lib/useAuthSession";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useAuthSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectTo =
    typeof window === "undefined"
      ? "/profile"
      : new URLSearchParams(window.location.search).get("next") || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      setSubmitted(true);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        await syncProfileFromAuthUser(data.user);
      }

      router.refresh();
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  };

  if (user && !sessionLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="text-4xl">✅</div>
          <h1 className="text-2xl font-bold text-stone-900">You&apos;re already signed in</h1>
          <p className="text-sm text-stone-500">Continue to your profile or head back home.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/profile" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors">
              View Profile
            </Link>
            <Link href="/" className="border border-stone-300 text-stone-700 font-semibold py-2.5 px-4 rounded-xl transition-colors hover:border-green-400 hover:text-green-700">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-sm text-stone-500 mt-1">Sign in to your CeliacSafe account</p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-800 text-sm">
            <strong>Demo mode only.</strong> Supabase integration is not yet configured.
            <br />
            <Link href="/" className="underline mt-2 inline-block">Back to home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
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
              disabled={pending || sessionLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {pending ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-stone-500">
          No account?{" "}
          <Link href="/signup" className="text-green-700 font-medium hover:underline">
            Create one
          </Link>
        </p>

        <div className="text-center text-xs text-stone-400 bg-stone-100 rounded-xl p-3">
          {isSupabaseConfigured() ? (
            <>🔒 Auth is backed by Supabase.</>
          ) : (
            <>🔒 Auth requires Supabase configuration. See <code>src/lib/supabase/</code> for setup.</>
          )}
        </div>
      </div>
    </div>
  );
}
