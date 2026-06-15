"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthSession } from "@/lib/useAuthSession";

export default function AuthNav() {
  const router = useRouter();
  const { user, loading, isConfigured } = useAuthSession();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  if (!isConfigured) {
    return (
      <>
        <Link
          href="/signup"
          className="hidden sm:inline-flex text-sm text-stone-500 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Demo Mode
        </Link>
        <Link
          href="/login"
          className="text-sm text-stone-500 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Sign In
        </Link>
      </>
    );
  }

  if (loading) {
    return <span className="text-xs text-stone-400 px-3">Loading…</span>;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/signup"
          className="hidden sm:inline-flex text-sm text-stone-500 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="text-sm text-stone-500 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
        >
          Sign In
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/profile"
        className="text-sm text-stone-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
      >
        Profile
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm text-stone-500 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
      >
        Sign Out
      </button>
    </>
  );
}
