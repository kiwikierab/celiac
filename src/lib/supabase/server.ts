/**
 * Supabase server client (for Server Components and Route Handlers).
 *
 * To activate:
 * 1. Install: npm install @supabase/ssr
 * 2. Add to .env.local:
 *      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # only for admin tasks
 * 3. Uncomment the code below.
 */

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
// import type { Database } from "./database.types";

// export async function createServerClient() {
//   const cookieStore = await cookies();
//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return cookieStore.getAll(); },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           );
//         },
//       },
//     }
//   );
// }

/** Placeholder — remove when Supabase is configured. */
export async function createServerSupabaseClient() {
  throw new Error(
    "Supabase is not yet configured. See src/lib/supabase/server.ts for setup instructions."
  );
}
