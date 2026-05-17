export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is required.");
  }
  return value;
}

export function getSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
  }
  return value;
}

export function getSupabaseServiceRoleOrAnonKey() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const value = serviceRole ?? anon;
  if (!value) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
  }
  return value;
}

export function assertSupabaseConfiguration() {
  getSupabaseUrl();
  getSupabaseServiceRoleOrAnonKey();
}
