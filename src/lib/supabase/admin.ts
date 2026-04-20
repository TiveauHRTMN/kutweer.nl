import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client voor server-side operaties (Auth beheer).
 * VEREIST: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!key) {
    // We gooien geen harde error tijdens build-time, maar wel bij gebruik
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing! Admin actions will fail.");
  }

  // Admin client bypasses RLS en kan Auth links genereren
  return createClient(url, key || "missing", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
}
