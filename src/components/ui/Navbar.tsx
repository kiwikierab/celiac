import Link from "next/link";
import AuthNav from "@/components/ui/AuthNav";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 px-4 pt-3">
      <div className="surface-card mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--panel-sage)] text-xl">
            🌾
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold text-[color:var(--brand)]">
              CeliacSafe
            </span>
            <span className="hidden text-xs text-[color:var(--muted)] sm:block">
              New Zealand gluten-free finds
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/map"
            className="btn-muted hidden text-sm sm:inline-flex"
          >
            Map
          </Link>
          <Link
            href="/places"
            className="btn-muted text-sm"
          >
            Explore
          </Link>
          <Link
            href="/add-place"
            className="btn-primary text-sm"
          >
            + Add Place
          </Link>
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
