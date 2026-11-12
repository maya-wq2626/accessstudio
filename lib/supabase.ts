import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Project = {
  id: string;
  title: string;
  first_name: string | null;
  kind: string | null;
  subject: string | null;
  look: string | null;
  prompt: string | null;
  html: string;
  hidden: boolean;
  created_at: string;
};

/** Server-side Supabase client using the service role key. All reads and
 *  writes go through server code only, never from the browser. Returns
 *  null when Supabase is not configured yet, so pages can show a friendly
 *  "not set up yet" state instead of crashing. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
