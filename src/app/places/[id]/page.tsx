import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPlaceById,
  getReviewsForPlace,
  getMenuItemsForPlace,
  getPhotosForPlace,
  getCommentsForReviews,
} from "@/lib/data";
import SafetyBadge from "@/components/place/SafetyBadge";
import ReviewCard from "@/components/review/ReviewCard";
import MapWrapper from "@/components/map/MapWrapper";
import PhotoGallery from "@/components/place/PhotoGallery";
import ReportButton from "@/components/ui/ReportButton";
import { starsString, formatDate, categoryLabels } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [place, reviews, menuItems, photos] = await Promise.all([
    getPlaceById(id),
    getReviewsForPlace(id),
    getMenuItemsForPlace(id),
    getPhotosForPlace(id),
  ]);

  if (!place) notFound();

  const commentsByReview = await getCommentsForReviews(reviews.map((review) => review.id));

  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <nav className="flex gap-1 text-sm text-[color:var(--muted)]">
          <Link href="/places" className="hover:text-[color:var(--brand)]">
            Places
          </Link>
          <span>/</span>
          <span className="text-stone-700">{place.name}</span>
        </nav>

        <section className="surface-card px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">
                {categoryLabels[place.category] ?? place.category} in {place.city}
              </span>
              <h1 className="display-title mt-4 text-stone-900">{place.name}</h1>
              <p className="mt-3 text-base leading-7 text-[color:var(--muted)]">
                {place.address}, {place.city}, {place.country}
              </p>

              {place.avg_overall_rating != null && (
                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  <span className="chip">{starsString(place.avg_overall_rating)} {place.avg_overall_rating.toFixed(1)} overall</span>
                  {place.avg_safety_rating != null && (
                    <span className="chip">🛡️ {place.avg_safety_rating.toFixed(1)} safety</span>
                  )}
                  {place.avg_taste_rating != null && (
                    <span className="chip">😋 {place.avg_taste_rating.toFixed(1)} taste</span>
                  )}
                  <span className="chip">{place.review_count ?? 0} reviews</span>
                </div>
              )}

              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Added {formatDate(place.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/places/${place.id}/review`} className="btn-primary">
                + Write review
              </Link>
              <ReportButton entityId={place.id} entityType="place" />
            </div>
          </div>

          {place.description && (
            <div className="surface-soft mt-6 p-5">
              <h2 className="text-lg font-semibold text-stone-900">About this venue</h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">{place.description}</p>
            </div>
          )}

          {(place.website || place.phone) && (
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  🌐 Website
                </a>
              )}
              {place.phone && (
                <a href={`tel:${place.phone}`} className="btn-secondary">
                  📞 {place.phone}
                </a>
              )}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.86fr)]">
          <div className="space-y-8">
            <SafetyBadge place={place} />

            <section className="surface-card p-5">
              <h2 className="text-lg font-semibold text-stone-900">Location</h2>
              <div className="mt-4 overflow-hidden rounded-[28px] border border-[color:var(--stroke)]">
                <div className="h-64 bg-[color:var(--panel-sage)]">
                  <MapWrapper
                    places={[place]}
                    center={[place.lat, place.lng]}
                    zoom={15}
                    selectedId={place.id}
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted)]">
                📍 {place.address}, {place.city}, {place.country}
              </p>
            </section>

            {menuItems.length > 0 && (
              <section className="surface-card p-5">
                <h2 className="text-lg font-semibold text-stone-900">Menu highlights</h2>
                <div className="mt-4 space-y-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="surface-soft flex items-start justify-between gap-3 p-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-stone-800">{item.name}</p>
                          {item.is_dedicated_gf && (
                            <span className="rounded-full bg-[color:var(--panel-sage)] px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                              Dedicated GF
                            </span>
                          )}
                          {item.is_gluten_free && !item.is_dedicated_gf && (
                            <span className="rounded-full bg-[#fff1ec] px-3 py-1 text-xs font-semibold text-[#b44f3b]">
                              GF
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-xs text-[color:var(--muted)]">{item.description}</p>
                        )}
                        {item.notes && (
                          <p className="mt-1 text-xs text-[#8f5722]">⚠️ {item.notes}</p>
                        )}
                      </div>
                      {item.price && (
                        <span className="shrink-0 text-sm font-medium text-stone-700">
                          {item.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <PhotoGallery placeId={place.id} placeName={place.name} photos={photos} />
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">Community reviews</span>
                <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                  Reviews ({reviews.length})
                </h2>
              </div>
              <Link href={`/places/${place.id}/review`} className="btn-secondary text-sm">
                + Write review
              </Link>
            </div>

            {reviews.length === 0 ? (
              <div className="surface-card px-6 py-12 text-center text-[color:var(--muted)]">
                <p className="text-lg font-semibold text-stone-900">No reviews yet.</p>
                <p className="mt-2 text-sm">Be the first to share how safe it felt.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    comments={commentsByReview[review.id] ?? []}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
