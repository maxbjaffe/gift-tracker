import { createClient } from "@supabase/supabase-js";

// Platform Supabase client — server-side only
// Used for reference taxonomy data (ref_interest_*, ref_enum_options)
export function createPlatformClient() {
  const url = process.env.PLATFORM_SUPABASE_URL;
  const key = process.env.PLATFORM_SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing PLATFORM_SUPABASE_URL or PLATFORM_SUPABASE_SERVICE_KEY"
    );
  }

  return createClient(url, key);
}
