const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_PHOTOS_BUCKET = "place-photos";

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function isSupabaseConfigured() {
  return Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL") && readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function getSupabaseBrowserConfig() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return {
    url,
    anonKey,
    appUrl: readEnv("NEXT_PUBLIC_APP_URL") ?? DEFAULT_APP_URL,
    photosBucket: readEnv("NEXT_PUBLIC_SUPABASE_PHOTOS_BUCKET") ?? DEFAULT_PHOTOS_BUCKET,
  };
}

export function getSupabaseServerConfig() {
  return {
    ...getSupabaseBrowserConfig(),
    serviceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
