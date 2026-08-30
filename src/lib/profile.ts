import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/** Upsert the signed-in user into public.profiles so admin can list registered users */
export async function ensureProfile(user: User) {
  if (!user?.id || !user.email) return;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email.split("@")[0];

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.warn("[ensureProfile]", error.message);
  }
}
