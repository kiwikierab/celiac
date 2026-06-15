import Link from "next/link";
import AuthNav from "@/components/ui/AuthNav";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
          <span>🌾</span>
          <span>CeliacSafe</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/map"
            className="text-sm text-stone-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
          >
            Map
          </Link>
          <Link
            href="/places"
            className="text-sm text-stone-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
          >
            List
          </Link>
          <Link
            href="/add-place"
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add Place
          </Link>
          <AuthNav />
        </div>
      </div>
    </nav>
  );
}
