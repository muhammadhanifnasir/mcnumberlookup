import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseServiceRoleOrAnonKey, getSupabaseUrl } from "@/lib/supabase/shared";

export function createSupabaseAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const key = getSupabaseServiceRoleOrAnonKey();

  return createClient<Database>(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
