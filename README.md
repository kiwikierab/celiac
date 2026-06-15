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
- 🔒 **Supabase auth** — sign in, sign up, and protected contribution flows
- 📷 **Photo uploads** — upload venue photos to Supabase Storage
- 📍 **Near me search** — geolocation-aware list and map browsing
- 💬 **Review comments** — discuss recent reviews
- 🙋 **Profiles** — public contribution pages and personal profile dashboard
- 🚨 **Reporting** — flag places, reviews, comments, and photos

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

Open [http://localhost:3000](http://localhost:3000).

Without Supabase credentials the app stays in demo mode with mock data. Once configured, it uses real auth, database, and storage features.

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
| `NEXT_PUBLIC_SUPABASE_PHOTOS_BUCKET` | Optional | Storage bucket for place photos (defaults to `place-photos`) |
| `NEXT_PUBLIC_APP_URL` | Optional | App base URL (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_OSM_ADDRESS_SEARCH_URL` | Optional | Nominatim-compatible `/search` endpoint used for add-place address autocomplete |

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
4. Run the SQL in `supabase/schema.sql`
5. Start the app and create an account
6. Add places, upload photos, comment on reviews, and browse with geolocation

### Supabase schema

The full schema, RLS policies, moderation/report tables, and Storage bucket rules live in `supabase/schema.sql`.

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

- [ ] Moderator/admin dashboard for triaging reports
- [ ] PWA / offline support
- [ ] Opening hours

---

## 📄 License

MIT — feel free to use, adapt, and contribute.
