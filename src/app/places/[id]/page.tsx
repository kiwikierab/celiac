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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-500 flex gap-1">
        <Link href="/places" className="hover:text-green-700">
          Places
        </Link>
        <span>/</span>
        <span className="text-stone-700">{place.name}</span>
      </nav>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{place.name}</h1>
            <p className="text-stone-500 mt-1">
              {categoryLabels[place.category] ?? place.category} ·{" "}
              {place.address}, {place.city}
            </p>
          </div>
          <Link
            href={`/places/${place.id}/review`}
            className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Write Review
          </Link>
        </div>
        <ReportButton entityId={place.id} entityType="place" />

        {/* Ratings summary */}
        {place.avg_overall_rating != null && (
          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
            <span>
              <span className="text-yellow-500">
                {starsString(place.avg_overall_rating)}
              </span>{" "}
              <strong>{place.avg_overall_rating.toFixed(1)}</strong> overall
            </span>
            {place.avg_safety_rating != null && (
              <span>
                🛡️ <strong>{place.avg_safety_rating.toFixed(1)}</strong> safety
              </span>
            )}
            {place.avg_taste_rating != null && (
              <span>
                😋 <strong>{place.avg_taste_rating.toFixed(1)}</strong> taste
              </span>
            )}
            <span>{place.review_count ?? 0} reviews</span>
          </div>
        )}

        {/* Meta */}
        <p className="text-xs text-stone-400">
          Added {formatDate(place.created_at)}
        </p>
      </div>

      {/* ⚠️ SAFETY FIRST — prominently above description */}
      <SafetyBadge place={place} />

      {/* Description */}
      {place.description && (
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-2">About</h2>
          <p className="text-stone-600 leading-relaxed">{place.description}</p>
        </div>
      )}

      {/* Contact */}
      {(place.website || place.phone) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline"
            >
              🌐 Website
            </a>
          )}
          {place.phone && (
            <a href={`tel:${place.phone}`} className="text-green-700 hover:underline">
              📞 {place.phone}
            </a>
          )}
        </div>
      )}

      <PhotoGallery placeId={place.id} placeName={place.name} photos={photos} />

      {/* Mini map */}
      <section>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Location</h2>
        <div className="h-56 rounded-xl overflow-hidden border border-stone-200">
          <MapWrapper
            places={[place]}
            center={[place.lat, place.lng]}
            zoom={15}
            selectedId={place.id}
          />
        </div>
        <p className="text-sm text-stone-500 mt-2">
          📍 {place.address}, {place.city}, {place.country}
        </p>
      </section>

      {/* Menu items */}
      {menuItems.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-stone-800 mb-3">
            Menu Highlights
          </h2>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between bg-white border border-stone-200 rounded-xl p-3 gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-800 text-sm">{item.name}</p>
                    {item.is_dedicated_gf && (
                      <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 border border-green-200">
                        Dedicated GF
                      </span>
                    )}
                    {item.is_gluten_free && !item.is_dedicated_gf && (
                      <span className="text-xs bg-lime-100 text-lime-700 rounded-full px-2 py-0.5 border border-lime-200">
                        GF
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                  )}
                  {item.notes && (
                    <p className="text-xs text-amber-600 mt-0.5">⚠️ {item.notes}</p>
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

      {/* Reviews */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">
            Reviews ({reviews.length})
          </h2>
          <Link
            href={`/places/${place.id}/review`}
            className="text-sm text-green-700 hover:underline"
          >
            + Write a review
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-white border border-stone-200 rounded-xl text-stone-500">
            <p>No reviews yet. Be the first!</p>
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
  );
}
