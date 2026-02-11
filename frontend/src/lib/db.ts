import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from "./config";

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  return client;
}
