import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseBrowserConfig } from "./config";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseBrowserConfig();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
