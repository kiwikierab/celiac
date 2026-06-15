/**
 * Supabase browser client.
 *
 * To activate:
 * 1. Install: npm install @supabase/supabase-js
 * 2. Add to .env.local:
 *      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * 3. Uncomment the code below and remove the placeholder.
 */

// import { createBrowserClient } from "@supabase/ssr";
// import type { Database } from "./database.types";

// export function createClient() {
//   return createBrowserClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }

/** Placeholder — remove when Supabase is configured. */
export function createClient() {
  throw new Error(
    "Supabase is not yet configured. See src/lib/supabase/client.ts for setup instructions."
  );
}
