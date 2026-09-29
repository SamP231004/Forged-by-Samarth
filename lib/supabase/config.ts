/** Accepts either the new publishable key or the legacy anon key. */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Chat is switched off (with a friendly notice) until Supabase is configured. */
export const chatEnabled = Boolean(supabaseUrl && supabaseKey);
