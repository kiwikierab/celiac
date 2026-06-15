"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPhoto, syncProfileFromAuthUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";
import { useAuthSession } from "@/lib/useAuthSession";
import type { Photo } from "@/types";
import ReportButton from "@/components/ui/ReportButton";

interface PhotoGalleryProps {
  placeId: string;
  placeName: string;
  photos: Photo[];
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export default function PhotoGallery({
  placeId,
  placeName,
  photos: initialPhotos,
}: PhotoGalleryProps) {
  const router = useRouter();
  const { isConfigured, user } = useAuthSession();
  const [photos, setPhotos] = useState(initialPhotos);
  const [pending, setPending] = useState(false);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      await syncProfileFromAuthUser(user);
      const supabase = createClient();
      const { photosBucket } = getSupabaseBrowserConfig();
      const filePath = `${user.id}/${placeId}/${Date.now()}-${sanitizeFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from(photosBucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(photosBucket).getPublicUrl(filePath);

      const createdPhoto = await addPhoto({
        place_id: placeId,
        user_id: user.id,
        url: publicUrl,
        storage_path: filePath,
        alt: alt.trim() || `${placeName} photo`,
      });

      setPhotos((current) => [createdPhoto, ...current]);
      setAlt("");
      event.target.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload this photo.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-stone-800">Photos</h2>
        {isConfigured && user && (
          <label className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:border-green-400 hover:text-green-700 cursor-pointer transition-colors">
            <span>{pending ? "Uploading…" : "+ Add photo"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={pending}
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      {isConfigured && user && (
        <div className="mb-3">
          <input
            type="text"
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            placeholder="Optional photo description"
            className="w-full sm:max-w-sm rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.alt ?? placeName}
                className="rounded-xl object-cover aspect-video w-full"
              />
              <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                <span>{photo.user_name ?? "Community member"}</span>
                <ReportButton entityId={photo.id} entityType="photo" compact />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
          No photos yet.
        </div>
      )}
    </section>
  );
}
