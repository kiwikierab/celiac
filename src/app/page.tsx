import Link from "next/link";
import { getPlaces } from "@/lib/data";
import PlaceCard from "@/components/place/PlaceCard";

export default async function HomePage() {
  const allPlaces = await getPlaces({});
  const featuredPlaces = allPlaces.filter((place) => place.staff_trained).slice(0, 3);
  const totalReviews = allPlaces.reduce((sum, place) => sum + (place.review_count ?? 0), 0);

  return (
    <div className="px-4 py-8 md:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="surface-card overflow-hidden px-6 py-8 sm:px-8 md:px-10 md:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div className="space-y-6">
              <span className="eyebrow">New Zealand-only gluten-free discovery</span>
              <div className="space-y-4">
                <h1 className="hero-title max-w-3xl text-stone-900">
                  Find warm, trusted places to eat with coeliac confidence.
                </h1>
                <p className="subtle-copy max-w-2xl text-lg leading-8">
                  Browse community-verified cafés, bakeries, and restaurants across New
                  Zealand with clear notes on dedicated fryers, trained staff, and
                  cross-contact precautions.
                </p>
              </div>

              <div className="surface-soft max-w-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--brand)]">
                      Start exploring
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      Search the trusted list or open the map to plan your next safe meal.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/places" className="btn-primary">
                      Explore places
                    </Link>
                    <Link href="/map" className="btn-secondary">
                      Open map
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="chip">🍳 Dedicated fryer notes</span>
                <span className="chip">🧑‍🍳 Staff training signals</span>
                <span className="chip">📍 NZ-only venue discovery</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    Venues
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">{allPlaces.length}</p>
                </div>
                <div className="surface-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    Reviews
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">{totalReviews}</p>
                </div>
                <div className="surface-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    Focus
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-900">Coeliac-safe</p>
                </div>
              </div>
            </div>

            <div className="surface-sage relative overflow-hidden p-5 sm:p-6">
              <div className="absolute -right-12 top-6 h-28 w-28 rounded-full bg-[color:var(--accent-soft)] blur-2xl" />
              <div className="absolute -left-10 bottom-4 h-28 w-28 rounded-full bg-white/60 blur-2xl" />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand)]">
                      Featured safe picks
                    </p>
                    <h2 className="display-title mt-2 text-stone-900">Plan a feel-good food stop</h2>
                  </div>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                    Trusted by locals
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="surface-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                      Today&apos;s browse
                    </p>
                    <div className="mt-4 space-y-3">
                      {featuredPlaces.map((place, index) => (
                        <div
                          key={place.id}
                          className="rounded-[24px] border border-[color:var(--stroke)] bg-white/80 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{place.name}</p>
                              <p className="mt-1 text-xs text-[color:var(--muted)]">
                                {place.city} · {place.review_count ?? 0} reviews
                              </p>
                            </div>
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--panel-sage)] text-sm font-semibold text-[color:var(--brand)]">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card flex min-h-[280px] flex-col justify-between p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                        Explore mode
                      </p>
                      <div className="mt-4 rounded-[28px] border border-[color:var(--stroke)] bg-[linear-gradient(180deg,#f7f1e8_0%,#e2ecdc_100%)] p-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-20 rounded-[24px] bg-white/80" />
                          <div className="h-28 rounded-[28px] bg-[color:var(--accent-soft)]" />
                          <div className="h-20 rounded-[24px] bg-white/80" />
                        </div>
                        <div className="mt-4 rounded-full bg-[color:var(--brand)]/90 px-4 py-3 text-sm font-semibold text-white">
                          List + map browsing made for safe food discovery
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
                      <span className="chip">Map view</span>
                      <span className="chip">Safety badges</span>
                      <span className="chip">Cross-contact notes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Trusted safety signals",
              copy: "Dedicated fryer, kitchen separation, and staff knowledge are surfaced before you choose a venue.",
              icon: "🛡️",
            },
            {
              title: "Browse by mood and location",
              copy: "Flip between a beautiful list and a map-led browse experience without losing the practical details.",
              icon: "🗺️",
            },
            {
              title: "Built for the NZ community",
              copy: "Every place, address lookup, and browsing flow stays focused on New Zealand.",
              icon: "🥝",
            },
          ].map((item) => (
            <article key={item.title} className="surface-soft p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--panel-sage)] text-2xl">
                {item.icon}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-stone-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Community favourites</span>
              <h2 className="display-title mt-3 text-stone-900">Highly rated &amp; safety-forward</h2>
            </div>
            <Link href="/places" className="btn-secondary self-start">
              View all places
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

        <section className="surface-card px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">Contribute back</span>
              <h2 className="display-title mt-3 text-stone-900">Know a safe spot worth sharing?</h2>
              <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
                Add a place, upload a photo, or leave a review so the next person can eat
                out with less stress and more confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/add-place" className="btn-primary">
                + Add a place
              </Link>
              <Link href="/signup" className="btn-accent">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
