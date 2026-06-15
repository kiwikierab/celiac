# 🌾 CeliacSafe

A community web app for finding and reviewing **coeliac-safe** cafes, restaurants, and bakeries.

Built with Next.js, Tailwind CSS, Leaflet/OpenStreetMap, and designed to connect to Supabase for auth, database, and storage.

---

## ✨ Features

- 🗺️ **Map View** — browse places on an OpenStreetMap map
- 📋 **List View** — filter and search places by celiac safety attributes
- 🔍 **Place Detail** — see safety info, reviews, menu items, and photos
- ➕ **Add a Place** — contribute new venues to the community
- ⭐ **Reviews** — safety rating, taste rating, staff knowledge, cross-contact notes
- 🔒 **Auth placeholders** — sign in / sign up UI (Supabase ready)

### Celiac Safety Signals

Each place shows:
- ✅ Dedicated GF kitchen
- ✅ Dedicated fryer
- ✅ Gluten-free menu
- ✅ Staff trained on coeliac disease
- ⚠️ Cross-contact notes

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app works immediately with mock data, no external services needed.

---

## 🔧 Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The app runs fine with an empty `.env.local` (mock data mode). Add Supabase credentials when you are ready to connect a real database.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side admin tasks only |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── map/page.tsx        # Map view
│   ├── places/
│   │   ├── page.tsx        # List view
│   │   └── [id]/
│   │       ├── page.tsx    # Place detail
│   │       └── review/     # Write a review
│   ├── add-place/page.tsx  # Add new place form
│   ├── login/page.tsx      # Sign in
│   └── signup/page.tsx     # Sign up
├── components/
│   ├── map/PlacesMap.tsx   # Leaflet map component
│   ├── place/              # PlaceCard, SafetyBadge
│   ├── review/             # ReviewCard
│   └── ui/                 # Navbar, Footer, FilterBar
├── data/
│   └── mockData.ts         # Sample places, reviews, menu items
├── lib/
│   ├── data.ts             # Data layer (swap for Supabase)
│   ├── utils.ts            # Rating helpers, formatters
│   └── supabase/           # Supabase client stubs
└── types/
    └── index.ts            # TypeScript domain types
```

---

## 🗄️ Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Add credentials to `.env.local`
3. Install the Supabase client: `npm install @supabase/supabase-js @supabase/ssr`
4. Uncomment the code in `src/lib/supabase/client.ts` and `server.ts`
5. Replace mock functions in `src/lib/data.ts` with Supabase queries
6. Create database tables matching the types in `src/types/index.ts`

### Suggested SQL Schema

```sql
-- Places
create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  country text,
  lat float8,
  lng float8,
  category text,
  website text,
  phone text,
  description text,
  submitted_by uuid references auth.users,
  gluten_free_menu boolean default false,
  dedicated_fryer boolean default false,
  dedicated_kitchen boolean default false,
  staff_trained boolean default false,
  cross_contact_notes text,
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references places not null,
  user_id uuid references auth.users not null,
  overall_rating int check (overall_rating between 1 and 5),
  safety_rating int check (safety_rating between 1 and 5),
  taste_rating int check (taste_rating between 1 and 5),
  notes text,
  staff_knowledgeable boolean,
  cross_contact_mentioned boolean,
  would_return boolean,
  created_at timestamptz default now()
);
```

---

## 🗺️ Stack

| Tool | Purpose |
|------|---------|
| [Next.js 15](https://nextjs.org) | React framework (App Router) |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://openstreetmap.org) | Free maps |
| [Supabase](https://supabase.com) | Auth + Postgres DB + Storage |

---

## 🚧 Remaining Follow-up Work

- [ ] Connect Supabase auth (sign in, sign up, session)
- [ ] Connect Supabase database for places and reviews
- [ ] Photo upload with Supabase Storage
- [ ] Geolocation "near me" search
- [ ] Comments on reviews
- [ ] User profile page
- [ ] Moderation / report inaccurate info
- [ ] PWA / offline support
- [ ] Opening hours
- [ ] Admin dashboard

---

## 📄 License

MIT — feel free to use, adapt, and contribute.
