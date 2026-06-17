import Link from "next/link";
import { redirect } from "next/navigation";
import PlaceCard from "@/components/place/PlaceCard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/utils";
import { getProfileContributions, syncProfileFromAuthUser } from "@/lib/data";
import type { Photo, Place, Review } from "@/types";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="surface-card space-y-4 px-6 py-8">
        <h1 className="display-title text-stone-900">Profile</h1>
        <p className="text-stone-600">
          Supabase auth is not configured yet, so profile data is only available in demo mode.
        </p>
        <Link href="/places" className="font-medium text-[color:var(--brand)] hover:underline">
          Browse places →
        </Link>
        </div>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  await syncProfileFromAuthUser(user);
  const { profile, places, reviews, photos } = await getProfileContributions(user.id);
  const displayName =
    profile?.display_name || profile?.username || user.user_metadata.name || user.email;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <section className="surface-card space-y-3 p-6">
        <p className="text-sm font-semibold text-[color:var(--brand)]">Your profile</p>
        <h1 className="display-title text-stone-900">{displayName}</h1>
        <p className="text-sm text-[color:var(--muted)]">{user.email}</p>
        {profile?.bio && <p className="text-stone-600">{profile.bio}</p>}
        <div className="flex flex-wrap gap-3 text-sm text-stone-600">
          <span>{places.length} places</span>
          <span>{reviews.length} reviews</span>
          <span>{photos.length} photos</span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">Places you added</h2>
          <Link href="/add-place" className="btn-secondary text-sm">
            + Add another place
          </Link>
        </div>
        {places.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place: Place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">You haven&apos;t added any places yet.</p>
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
            <p className="text-sm text-stone-500">No photos uploaded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
