import { notFound } from "next/navigation";
import Link from "next/link";
import PlaceCard from "@/components/place/PlaceCard";
import { formatDate } from "@/lib/utils";
import { getProfileContributions } from "@/lib/data";
import type { Photo, Place, Review } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { profile, places, reviews, photos } = await getProfileContributions(id);

  if (!profile && places.length === 0 && reviews.length === 0 && photos.length === 0) {
    notFound();
  }

  const displayName = profile?.display_name || profile?.username || `Community member ${id.slice(0, 8)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <section className="surface-card space-y-3 p-6">
        <p className="text-sm font-semibold text-[color:var(--brand)]">Community profile</p>
        <h1 className="display-title text-stone-900">{displayName}</h1>
        {profile?.bio && <p className="text-stone-600">{profile.bio}</p>}
        <div className="flex flex-wrap gap-3 text-sm text-stone-600">
          <span>{places.length} places</span>
          <span>{reviews.length} reviews</span>
          <span>{photos.length} photos</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-900">Places added</h2>
        {places.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place: Place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">No public places yet.</p>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Recent reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review: Review) => (
                <Link
                  key={review.id}
                  href={`/places/${review.place_id}`}
                  className="surface-soft block p-4 transition-transform duration-150 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-stone-800">{review.overall_rating}/5 overall</p>
                    <span className="text-xs text-[color:var(--muted)]">{formatDate(review.created_at)}</span>
                  </div>
                  {review.notes && <p className="mt-2 text-sm text-stone-600">{review.notes}</p>}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No reviews yet.</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Recent photos</h2>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo: Photo) => (
                <Link key={photo.id} href={`/places/${photo.place_id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt ?? "Contribution photo"}
                    className="surface-soft aspect-video w-full object-cover p-1"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No photos yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
