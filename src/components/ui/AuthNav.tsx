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
          className="btn-muted hidden text-sm sm:inline-flex"
        >
          Demo Mode
        </Link>
        <Link
          href="/login"
          className="btn-muted text-sm"
        >
          Sign In
        </Link>
      </>
    );
  }

  if (loading) {
    return <span className="px-3 text-xs text-[color:var(--muted)]">Loading…</span>;
  }

  if (!user) {
    return (
      <>
        <Link
          href="/signup"
          className="btn-muted hidden text-sm sm:inline-flex"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="btn-muted text-sm"
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
        className="btn-muted text-sm"
      >
        Profile
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        className="btn-muted text-sm"
      >
        Sign Out
      </button>
    </>
  );
}
