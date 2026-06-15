import Link from "next/link";
import { getPlaces } from "@/lib/data";
import PlaceCard from "@/components/place/PlaceCard";

export default async function HomePage() {
  const featuredPlaces = (await getPlaces({ staff_trained: true })).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="text-5xl">🌾</div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Find safe places to eat<br />with coeliac disease
          </h1>
          <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto">
            Community-verified reviews of coeliac-safe cafes, restaurants, and bakeries.
            Know before you go — dedicated kitchens, fryers, staff training, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/map"
              className="bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              🗺️ Browse Map
            </Link>
            <Link
              href="/places"
              className="bg-green-600 border border-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-500 transition-colors"
            >
              📋 Browse List
            </Link>
            <Link
              href="/add-place"
              className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              + Add a Place
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-white border-b border-stone-200 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: "🍳", label: "Dedicated fryer info" },
            { icon: "👨‍🍳", label: "Staff training verified" },
            { icon: "🧑‍🤝‍🧑", label: "Community reviews" },
            { icon: "⚠️", label: "Cross-contact notes" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="text-3xl">{item.icon}</div>
              <p className="text-sm font-medium text-stone-700">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured places */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900">Highly Rated &amp; Safe</h2>
            <Link href="/places" className="text-sm text-green-700 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 border-t border-green-100 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Know a safe spot?</h2>
          <p className="text-stone-600">
            Help the community by adding a place and sharing your experience.
            Every review makes a real difference for someone with coeliac disease.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/add-place"
              className="bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              + Add a Place
            </Link>
            <Link
              href="/signup"
              className="border border-green-600 text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
