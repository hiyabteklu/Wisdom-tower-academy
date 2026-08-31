import { createClient, type SupportedStorage } from "@supabase/supabase-js";

/**
 * Browser Supabase client — session persists in localStorage.
 *
 * IMPORTANT: storage methods must read window at call time (not once at
 * module init). Evaluating localStorage during SSR leaves storage=undefined
 * and users must sign in every visit.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

const STORAGE_KEY = "wt-academy-auth-v1";

/** Always touch localStorage at read/write time (safe on server + client). */
const authStorage: SupportedStorage = {
  getItem: (key) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* private mode / quota */
    }
  },
  removeItem: (key) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: authStorage,
    storageKey: STORAGE_KEY,
  },
});

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  return Boolean(url) && !url.includes("placeholder");
}

export async function recoverSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.warn("[auth] getSession", error.message);
    // Proactively refresh if session exists but access token may be stale
    if (data.session) {
      const expiresAt = data.session.expires_at ?? 0;
      const soon = Math.floor(Date.now() / 1000) + 60;
      if (expiresAt < soon) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        return refreshed.session ?? data.session;
      }
    }
    return data.session;
  } catch (e) {
    console.warn("[auth] recoverSession", e);
    return null;
  }
}
