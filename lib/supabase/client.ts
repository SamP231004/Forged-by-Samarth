import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "./config";

let client: SupabaseClient | undefined;

/** Browser client, shared across components so there's one realtime socket. */
export function createClient() {
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
