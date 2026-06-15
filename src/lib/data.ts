import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  MenuItem,
  Photo,
  Place,
  PlaceFilters,
  Report,
  Review,
  ReviewComment,
  UserProfile,
} from "@/types";
import {
  mockMenuItems,
  mockPhotos,
  mockPlaces,
  mockReviews,
} from "@/data/mockData";

type DbClient = SupabaseClient<Database>;
type PlaceRow = Database["public"]["Tables"]["places"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type MenuItemRow = Database["public"]["Tables"]["menu_items"]["Row"];
type PhotoRow = Database["public"]["Tables"]["photos"]["Row"];
type ReviewCommentRow = Database["public"]["Tables"]["review_comments"]["Row"];

const VISIBLE_STATUS = "visible";

function queryTable(client: DbClient, table: keyof Database["public"]["Tables"]) {
  return (client as any).from(table as string);
}

async function getSupabaseClient(): Promise<DbClient | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (typeof window !== "undefined") {
    return createClient();
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  return createServerSupabaseClient();
}

function average(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function applyPlaceFilters(places: Place[], filters?: PlaceFilters) {
  let filtered = [...places];

  if (!filters) {
    return filtered;
  }

  if (filters.gluten_free_menu) {
    filtered = filtered.filter((place) => place.gluten_free_menu);
  }

  if (filters.dedicated_fryer) {
    filtered = filtered.filter((place) => place.dedicated_fryer);
  }

  if (filters.dedicated_kitchen) {
    filtered = filtered.filter((place) => place.dedicated_kitchen);
  }

  if (filters.staff_trained) {
    filtered = filtered.filter((place) => place.staff_trained);
  }

  if (filters.category) {
    filtered = filtered.filter((place) => place.category === filters.category);
  }

  if (filters.min_safety_rating) {
    filtered = filtered.filter(
      (place) => (place.avg_safety_rating ?? 0) >= (filters.min_safety_rating ?? 0)
    );
  }

  if (filters.max_distance_km) {
    filtered = filtered.filter(
      (place) =>
        place.distance_km == null || place.distance_km <= (filters.max_distance_km ?? Number.MAX_SAFE_INTEGER)
    );
  }

  return filtered;
}

function buildMockPlaceWithMetrics(place: Place, reviews: Review[]): Place {
  const reviewCount = reviews.length;
  return {
    ...place,
    avg_overall_rating: average(reviews.map((review) => review.overall_rating)) ?? place.avg_overall_rating,
    avg_safety_rating: average(reviews.map((review) => review.safety_rating)) ?? place.avg_safety_rating,
    avg_taste_rating: average(reviews.map((review) => review.taste_rating)) ?? place.avg_taste_rating,
    review_count: reviewCount || place.review_count,
  };
}

function mapProfile(row: ProfileRow | null | undefined): UserProfile | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username ?? undefined,
    display_name: row.display_name ?? undefined,
    avatar_url: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    city: row.city ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function profileDisplayName(profile: UserProfile | null | undefined, fallbackId: string) {
  return (
    profile?.display_name ||
    profile?.username ||
    `Member ${fallbackId.slice(0, 8)}`
  );
}

function mapPlace(row: PlaceRow, reviews: ReviewRow[]): Place {
  const placeReviews = reviews.filter((review) => review.place_id === row.id);
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    country: row.country,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    category: row.category as Place["category"],
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    description: row.description ?? undefined,
    submitted_by: row.submitted_by ?? undefined,
    created_at: row.created_at,
    gluten_free_menu: row.gluten_free_menu,
    dedicated_fryer: row.dedicated_fryer,
    dedicated_kitchen: row.dedicated_kitchen,
    staff_trained: row.staff_trained,
    cross_contact_notes: row.cross_contact_notes ?? undefined,
    avg_overall_rating: average(placeReviews.map((review) => review.overall_rating)),
    avg_safety_rating: average(placeReviews.map((review) => review.safety_rating)),
    avg_taste_rating: average(placeReviews.map((review) => review.taste_rating)),
    review_count: placeReviews.length,
    moderation_status: row.moderation_status as Place["moderation_status"],
  };
}

function mapMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    place_id: row.place_id,
    name: row.name,
    description: row.description ?? undefined,
    is_gluten_free: row.is_gluten_free,
    is_dedicated_gf: row.is_dedicated_gf,
    price: row.price ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapPhoto(row: PhotoRow, profile?: UserProfile | null): Photo {
  return {
    id: row.id,
    place_id: row.place_id,
    user_id: row.user_id,
    url: row.url,
    storage_path: row.storage_path,
    alt: row.alt ?? undefined,
    created_at: row.created_at,
    moderation_status: row.moderation_status as Photo["moderation_status"],
    user_name: profileDisplayName(profile, row.user_id),
    user_profile: profile ?? null,
  };
}

async function getProfilesByIds(client: DbClient, userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserProfile>();
  }

  const { data, error } = await queryTable(client, "profiles")
    .select("*")
    .in("id", [...new Set(userIds)]);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProfileRow[];

  return new Map<string, UserProfile>(rows.map((row) => [row.id, mapProfile(row)!]));
}

function mapReview(row: ReviewRow, profile?: UserProfile | null): Review {
  return {
    id: row.id,
    place_id: row.place_id,
    user_id: row.user_id,
    user_name: profileDisplayName(profile, row.user_id),
    overall_rating: row.overall_rating,
    safety_rating: row.safety_rating,
    taste_rating: row.taste_rating,
    notes: row.notes ?? undefined,
    staff_knowledgeable: row.staff_knowledgeable,
    cross_contact_mentioned: row.cross_contact_mentioned,
    would_return: row.would_return,
    created_at: row.created_at,
    moderation_status: row.moderation_status as Review["moderation_status"],
    user_profile: profile ?? null,
  };
}

function mapComment(row: ReviewCommentRow, profile?: UserProfile | null): ReviewComment {
  return {
    id: row.id,
    review_id: row.review_id,
    user_id: row.user_id,
    user_name: profileDisplayName(profile, row.user_id),
    body: row.body,
    created_at: row.created_at,
    moderation_status: row.moderation_status as ReviewComment["moderation_status"],
    user_profile: profile ?? null,
  };
}

function usernameFromUser(user: User) {
  const preferred =
    user.user_metadata.username ||
    user.user_metadata.user_name ||
    user.user_metadata.name ||
    user.user_metadata.full_name ||
    user.email?.split("@")[0] ||
    `member-${user.id.slice(0, 8)}`;

  return String(preferred)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export async function syncProfileFromAuthUser(user: User): Promise<UserProfile | null> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      id: user.id,
      username: usernameFromUser(user),
      display_name:
        user.user_metadata.name ||
        user.user_metadata.full_name ||
        user.email?.split("@")[0] ||
        "Community member",
      avatar_url: user.user_metadata.avatar_url,
      created_at: new Date().toISOString(),
    };
  }

  const payload = {
    id: user.id,
    username: usernameFromUser(user),
    display_name:
      user.user_metadata.name ||
      user.user_metadata.full_name ||
      user.email?.split("@")[0] ||
      "Community member",
    avatar_url: user.user_metadata.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await queryTable(client, "profiles")
    .upsert([payload], { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

export async function getPlaces(filters?: PlaceFilters): Promise<Place[]> {
  const client = await getSupabaseClient();

  if (!client) {
    const places = mockPlaces.map((place) =>
      buildMockPlaceWithMetrics(
        place,
        mockReviews.filter((review) => review.place_id === place.id)
      )
    );

    return applyPlaceFilters(places, filters);
  }

  const { data: placeRows, error: placeError } = await queryTable(client, "places")
    .select("*")
    .eq("moderation_status", VISIBLE_STATUS)
    .order("created_at", { ascending: false });

  if (placeError) {
    throw placeError;
  }

  const typedPlaceRows = (placeRows ?? []) as PlaceRow[];
  const placeIds = typedPlaceRows.map((place) => place.id);
  const reviewRows =
    placeIds.length === 0
      ? []
      : (
          await queryTable(client, "reviews")
            .select("*")
            .eq("moderation_status", VISIBLE_STATUS)
            .in("place_id", placeIds)
        ).data ?? [];
  const typedReviewRows = reviewRows as ReviewRow[];

  return applyPlaceFilters(typedPlaceRows.map((place) => mapPlace(place, typedReviewRows)), filters);
}

export async function getPlaceById(id: string): Promise<Place | null> {
  const client = await getSupabaseClient();

  if (!client) {
    const place = mockPlaces.find((entry) => entry.id === id);
    if (!place) {
      return null;
    }

    return buildMockPlaceWithMetrics(
      place,
      mockReviews.filter((review) => review.place_id === id)
    );
  }

  const { data: placeRow, error: placeError } = await queryTable(client, "places")
    .select("*")
    .eq("id", id)
    .eq("moderation_status", VISIBLE_STATUS)
    .single();

  if (placeError) {
    if (placeError.code === "PGRST116") {
      return null;
    }
    throw placeError;
  }

  const { data: reviewRows, error: reviewError } = await queryTable(client, "reviews")
    .select("*")
    .eq("place_id", id)
    .eq("moderation_status", VISIBLE_STATUS);

  if (reviewError) {
    throw reviewError;
  }

  return mapPlace(placeRow, reviewRows ?? []);
}

export async function addPlace(
  place: Omit<Place, "id" | "created_at">
): Promise<Place> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      ...place,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    };
  }

  const payload = {
    name: place.name,
    address: place.address,
    city: place.city,
    country: place.country,
    lat: place.lat,
    lng: place.lng,
    category: place.category,
    website: place.website ?? null,
    phone: place.phone ?? null,
    description: place.description ?? null,
    submitted_by: place.submitted_by ?? null,
    gluten_free_menu: place.gluten_free_menu,
    dedicated_fryer: place.dedicated_fryer,
    dedicated_kitchen: place.dedicated_kitchen,
    staff_trained: place.staff_trained,
    cross_contact_notes: place.cross_contact_notes ?? null,
    moderation_status: VISIBLE_STATUS,
  };

  const { data, error } = await queryTable(client, "places")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapPlace(data, []);
}

export async function getReviewsForPlace(placeId: string): Promise<Review[]> {
  const client = await getSupabaseClient();

  if (!client) {
    return mockReviews.filter((review) => review.place_id === placeId);
  }

  const { data: reviewRows, error } = await queryTable(client, "reviews")
    .select("*")
    .eq("place_id", placeId)
    .eq("moderation_status", VISIBLE_STATUS)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const typedReviewRows = (reviewRows ?? []) as ReviewRow[];
  const profiles = await getProfilesByIds(
    client,
    typedReviewRows.map((review) => review.user_id)
  );

  return typedReviewRows.map((review) => mapReview(review, profiles.get(review.user_id) ?? null));
}

export async function addReview(
  review: Omit<Review, "id" | "created_at" | "user_name" | "user_profile">
): Promise<Review> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      ...review,
      id: String(Date.now()),
      user_name: `Member ${review.user_id.slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await queryTable(client, "reviews")
    .insert({
      place_id: review.place_id,
      user_id: review.user_id,
      overall_rating: review.overall_rating,
      safety_rating: review.safety_rating,
      taste_rating: review.taste_rating,
      notes: review.notes ?? null,
      staff_knowledgeable: review.staff_knowledgeable,
      cross_contact_mentioned: review.cross_contact_mentioned,
      would_return: review.would_return,
      moderation_status: VISIBLE_STATUS,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const profile = (await getProfilesByIds(client, [data.user_id])).get(data.user_id) ?? null;
  return mapReview(data, profile);
}

export async function getMenuItemsForPlace(placeId: string): Promise<MenuItem[]> {
  const client = await getSupabaseClient();

  if (!client) {
    return mockMenuItems.filter((item) => item.place_id === placeId);
  }

  const { data, error } = await queryTable(client, "menu_items")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as MenuItemRow[]).map(mapMenuItem);
}

export async function getPhotosForPlace(placeId: string): Promise<Photo[]> {
  const client = await getSupabaseClient();

  if (!client) {
    return mockPhotos.filter((photo) => photo.place_id === placeId);
  }

  const { data: photoRows, error } = await queryTable(client, "photos")
    .select("*")
    .eq("place_id", placeId)
    .eq("moderation_status", VISIBLE_STATUS)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const typedPhotoRows = (photoRows ?? []) as PhotoRow[];
  const profiles = await getProfilesByIds(
    client,
    typedPhotoRows.map((photo) => photo.user_id)
  );

  return typedPhotoRows.map((photo) => mapPhoto(photo, profiles.get(photo.user_id) ?? null));
}

export async function addPhoto(
  photo: Omit<Photo, "id" | "created_at" | "user_name" | "user_profile">
): Promise<Photo> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      ...photo,
      id: String(Date.now()),
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await queryTable(client, "photos")
    .insert({
      place_id: photo.place_id,
      user_id: photo.user_id,
      storage_path: photo.storage_path ?? photo.url,
      url: photo.url,
      alt: photo.alt ?? null,
      moderation_status: VISIBLE_STATUS,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const profile = (await getProfilesByIds(client, [data.user_id])).get(data.user_id) ?? null;
  return mapPhoto(data, profile);
}

export async function getCommentsForReview(reviewId: string): Promise<ReviewComment[]> {
  const grouped = await getCommentsForReviews([reviewId]);
  return grouped[reviewId] ?? [];
}

export async function getCommentsForReviews(reviewIds: string[]) {
  const client = await getSupabaseClient();

  if (!client) {
    return Object.fromEntries(
      reviewIds.map((reviewId) => [reviewId, [] as ReviewComment[]])
    ) as Record<string, ReviewComment[]>;
  }

  if (reviewIds.length === 0) {
    return {} as Record<string, ReviewComment[]>;
  }

  const { data: commentRows, error } = await queryTable(client, "review_comments")
    .select("*")
    .eq("moderation_status", VISIBLE_STATUS)
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const typedCommentRows = (commentRows ?? []) as ReviewCommentRow[];
  const profiles = await getProfilesByIds(
    client,
    typedCommentRows.map((comment) => comment.user_id)
  );

  return typedCommentRows.reduce<Record<string, ReviewComment[]>>((groups, comment) => {
    const mapped = mapComment(comment, profiles.get(comment.user_id) ?? null);
    groups[comment.review_id] ||= [];
    groups[comment.review_id].push(mapped);
    return groups;
  }, {});
}

export async function addReviewComment(
  comment: Omit<ReviewComment, "id" | "created_at" | "user_name" | "user_profile">
): Promise<ReviewComment> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      ...comment,
      id: String(Date.now()),
      user_name: `Member ${comment.user_id.slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await queryTable(client, "review_comments")
    .insert({
      review_id: comment.review_id,
      user_id: comment.user_id,
      body: comment.body,
      moderation_status: VISIBLE_STATUS,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const profile = (await getProfilesByIds(client, [data.user_id])).get(data.user_id) ?? null;
  return mapComment(data, profile);
}

export async function addReport(
  report: Omit<Report, "id" | "created_at" | "status">
): Promise<Report> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      ...report,
      id: String(Date.now()),
      status: "open",
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await queryTable(client, "reports")
    .insert({
      reporter_id: report.reporter_id,
      entity_type: report.entity_type,
      entity_id: report.entity_id,
      reason: report.reason,
      status: "open",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    reporter_id: data.reporter_id,
    entity_type: data.entity_type as Report["entity_type"],
    entity_id: data.entity_id,
    reason: data.reason,
    status: data.status as Report["status"],
    created_at: data.created_at,
  };
}

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      id,
      display_name: `Community member ${id.slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await queryTable(client, "profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw error;
  }

  return mapProfile(data);
}

export async function getProfileContributions(userId: string) {
  const client = await getSupabaseClient();

  if (!client) {
    return {
      places: mockPlaces.filter((place) => place.submitted_by === userId),
      reviews: mockReviews.filter((review) => review.user_id === userId),
      photos: mockPhotos.filter((photo) => photo.user_id === userId),
    };
  }

  const [profile, placeRows, reviewRows, photoRows] = await Promise.all([
    getProfileById(userId),
    queryTable(client, "places")
      .select("*")
      .eq("submitted_by", userId)
      .order("created_at", { ascending: false }),
    queryTable(client, "reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("moderation_status", VISIBLE_STATUS)
      .order("created_at", { ascending: false }),
    queryTable(client, "photos")
      .select("*")
      .eq("user_id", userId)
      .eq("moderation_status", VISIBLE_STATUS)
      .order("created_at", { ascending: false }),
  ]);

  if (placeRows.error) {
    throw placeRows.error;
  }

  if (reviewRows.error) {
    throw reviewRows.error;
  }

  if (photoRows.error) {
    throw photoRows.error;
  }

  const profileMap = new Map<string, UserProfile>();
  if (profile) {
    profileMap.set(profile.id, profile);
  }

  return {
    profile,
    places: ((placeRows.data ?? []) as PlaceRow[]).map((place) =>
      mapPlace(place, (reviewRows.data ?? []) as ReviewRow[])
    ),
    reviews: ((reviewRows.data ?? []) as ReviewRow[]).map((review) =>
      mapReview(review, profileMap.get(userId) ?? null)
    ),
    photos: ((photoRows.data ?? []) as PhotoRow[]).map((photo) =>
      mapPhoto(photo, profileMap.get(userId) ?? null)
    ),
  };
}
