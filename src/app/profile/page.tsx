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
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <h1 className="text-3xl font-bold text-stone-900">Profile</h1>
        <p className="text-stone-600">
          Supabase auth is not configured yet, so profile data is only available in demo mode.
        </p>
        <Link href="/places" className="text-green-700 hover:underline">
          Browse places →
        </Link>
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
        <p className="text-sm text-green-700 font-semibold">Your profile</p>
        <h1 className="text-3xl font-bold text-stone-900">{displayName}</h1>
        <p className="text-sm text-stone-500">{user.email}</p>
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
          <Link href="/add-place" className="text-sm text-green-700 hover:underline">
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
                  className="block rounded-xl border border-stone-200 bg-white p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-stone-800">{review.overall_rating}/5 overall</p>
                    <span className="text-xs text-stone-400">{formatDate(review.created_at)}</span>
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
                    className="rounded-xl aspect-video object-cover w-full border border-stone-200"
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
