import { createClient } from "@supabase/supabase-js";

/**
 * Browser / client Supabase client.
 *
 * During `next build`, static prerender (e.g. /_not-found) imports the layout
 * Header which imports this module. createClient() throws if url is empty, so
 * we use inert placeholders when env is unset. Real values must be set in
 * Vercel: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
