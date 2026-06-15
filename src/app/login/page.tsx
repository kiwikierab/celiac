"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase Auth
    // const supabase = createClient();
    // const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setSubmitted(true);
  };

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
            <strong>Auth is coming soon!</strong> Supabase integration is not yet configured.
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

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Sign In
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
          🔒 Auth requires Supabase configuration. See <code>src/lib/supabase/</code> for setup.
        </div>
      </div>
    </div>
  );
}
