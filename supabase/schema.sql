create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  country text not null default 'Australia',
  lat double precision,
  lng double precision,
  category text not null default 'other',
  website text,
  phone text,
  description text,
  submitted_by uuid references public.profiles (id) on delete set null,
  gluten_free_menu boolean not null default false,
  dedicated_fryer boolean not null default false,
  dedicated_kitchen boolean not null default false,
  staff_trained boolean not null default false,
  cross_contact_notes text,
  moderation_status text not null default 'visible' check (moderation_status in ('visible', 'flagged', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 5),
  safety_rating integer not null check (safety_rating between 1 and 5),
  taste_rating integer not null check (taste_rating between 1 and 5),
  notes text,
  staff_knowledgeable boolean not null default false,
  cross_contact_mentioned boolean not null default false,
  would_return boolean not null default true,
  moderation_status text not null default 'visible' check (moderation_status in ('visible', 'flagged', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  name text not null,
  description text,
  is_gluten_free boolean not null default false,
  is_dedicated_gf boolean not null default false,
  price text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  url text not null,
  alt text,
  moderation_status text not null default 'visible' check (moderation_status in ('visible', 'flagged', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  moderation_status text not null default 'visible' check (moderation_status in ('visible', 'flagged', 'hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  entity_type text not null check (entity_type in ('place', 'review', 'review_comment', 'photo')),
  entity_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    regexp_replace(lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))), '[^a-z0-9]+', '-', 'g'),
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    username = excluded.username,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace view public.place_summaries as
select
  p.*,
  avg(r.overall_rating)::numeric(10,2) as avg_overall_rating,
  avg(r.safety_rating)::numeric(10,2) as avg_safety_rating,
  avg(r.taste_rating)::numeric(10,2) as avg_taste_rating,
  count(r.id)::int as review_count
from public.places p
left join public.reviews r
  on r.place_id = p.id
 and r.moderation_status = 'visible'
group by p.id;

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.reviews enable row level security;
alter table public.menu_items enable row level security;
alter table public.photos enable row level security;
alter table public.review_comments enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public"
on public.profiles
for select
using (true);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "visible places are public" on public.places;
create policy "visible places are public"
on public.places
for select
using (moderation_status = 'visible');

drop policy if exists "authenticated users add places" on public.places;
create policy "authenticated users add places"
on public.places
for insert
with check (auth.uid() is not null and auth.uid() = submitted_by);

drop policy if exists "owners update places" on public.places;
create policy "owners update places"
on public.places
for update
using (auth.uid() = submitted_by)
with check (auth.uid() = submitted_by);

drop policy if exists "menu items are public" on public.menu_items;
create policy "menu items are public"
on public.menu_items
for select
using (true);

drop policy if exists "visible reviews are public" on public.reviews;
create policy "visible reviews are public"
on public.reviews
for select
using (moderation_status = 'visible');

drop policy if exists "authenticated users add reviews" on public.reviews;
create policy "authenticated users add reviews"
on public.reviews
for insert
with check (auth.uid() = user_id);

drop policy if exists "owners update reviews" on public.reviews;
create policy "owners update reviews"
on public.reviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "visible photos are public" on public.photos;
create policy "visible photos are public"
on public.photos
for select
using (moderation_status = 'visible');

drop policy if exists "authenticated users add photos" on public.photos;
create policy "authenticated users add photos"
on public.photos
for insert
with check (auth.uid() = user_id);

drop policy if exists "owners update photos" on public.photos;
create policy "owners update photos"
on public.photos
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "visible comments are public" on public.review_comments;
create policy "visible comments are public"
on public.review_comments
for select
using (moderation_status = 'visible');

drop policy if exists "authenticated users add comments" on public.review_comments;
create policy "authenticated users add comments"
on public.review_comments
for insert
with check (auth.uid() = user_id);

drop policy if exists "owners update comments" on public.review_comments;
create policy "owners update comments"
on public.review_comments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "authenticated users add reports" on public.reports;
create policy "authenticated users add reports"
on public.reports
for insert
with check (auth.uid() = reporter_id);

drop policy if exists "reporters view own reports" on public.reports;
create policy "reporters view own reports"
on public.reports
for select
using (auth.uid() = reporter_id);

insert into storage.buckets (id, name, public)
values ('place-photos', 'place-photos', true)
on conflict (id) do nothing;

drop policy if exists "public can view place photos" on storage.objects;
create policy "public can view place photos"
on storage.objects
for select
using (bucket_id = 'place-photos');

drop policy if exists "authenticated users upload place photos" on storage.objects;
create policy "authenticated users upload place photos"
on storage.objects
for insert
with check (
  bucket_id = 'place-photos'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "owners manage place photos" on storage.objects;
create policy "owners manage place photos"
on storage.objects
for update
using (
  bucket_id = 'place-photos'
  and auth.uid() is not null
  and owner = auth.uid()
)
with check (
  bucket_id = 'place-photos'
  and auth.uid() is not null
  and owner = auth.uid()
);

drop policy if exists "owners delete place photos" on storage.objects;
create policy "owners delete place photos"
on storage.objects
for delete
using (
  bucket_id = 'place-photos'
  and auth.uid() is not null
  and owner = auth.uid()
);
