import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/** Upsert the signed-in user into public.profiles so admin can list registered users */
export async function ensureProfile(user: User) {
  if (!user?.id) return;

  const meta = user.user_metadata || {};
  const firstName = meta.first_name || null;
  const lastName = meta.last_name || null;
  const fullName =
    meta.full_name ||
    meta.name ||
    (firstName && lastName ? `${firstName} ${lastName}` : null) ||
    (user.email && !user.email.endsWith("@phone.wta.local")
      ? user.email.split("@")[0]
      : null);

  const phone = meta.phone || null;
  const educationLevel = meta.education_level || null;

  // Real email only — synthetic phone identities stay null on email column
  const email =
    user.email && !user.email.endsWith("@phone.wta.local") ? user.email : null;

  const avatarUrl = meta.avatar_url || meta.picture || null;

  const row: Record<string, unknown> = {
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  };

  if (email) row.email = email;
  if (phone) row.phone = phone;
  if (firstName) row.first_name = firstName;
  if (lastName) row.last_name = lastName;
  if (educationLevel) row.education_level = educationLevel;

  const { error } = await supabase.from("profiles").upsert(row, { onConflict: "id" });

  if (error) {
    console.warn("[ensureProfile]", error.message);
  }
}
