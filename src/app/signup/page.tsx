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
      <div className="surface-card w-full max-w-md space-y-6 px-6 py-8">
        <div className="text-center">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="display-title text-stone-900">Join CeliacSafe</h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Create an account to add places and write reviews
          </p>
        </div>

        {submitted ? (
          <div className="status-success text-center">
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
                className="form-input"
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
                className="form-input"
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
                className="form-input"
              />
            </div>

            {error && (
              <div className="status-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full"
            >
              {pending ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[color:var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[color:var(--brand)] hover:underline">
            Sign in
          </Link>
        </p>

        <div className="surface-soft p-3 text-center text-xs text-[color:var(--muted)]">
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
