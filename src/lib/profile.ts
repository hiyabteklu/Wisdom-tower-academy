import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type AccountIntent = "student" | "client" | "both";
export type StudyStream = "natural" | "social" | "other" | "not_applicable";
export type HearAbout =
  | "telegram"
  | "tiktok"
  | "instagram"
  | "friend"
  | "linkedin"
  | "other";

/** Fields collected on Complete Profile (and editable later). */
export type ProfileDetails = {
  fullName: string;
  phone: string;
  schoolName: string;
  townRegion: string;
  stream: StudyStream;
  hearAbout: HearAbout;
  intent: AccountIntent;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  school_name: string | null;
  town_region: string | null;
  stream: string | null;
  hear_about: string | null;
  account_intent: string | null;
  profile_completed: boolean | null;
  updated_at?: string | null;
};

export function displayNameFromUser(user: User): string {
  return (
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "User"
  );
}

/** True when required onboarding fields are present (metadata or row). */
export function isProfileComplete(
  user: User,
  row?: Partial<ProfileRow> | null
): boolean {
  if (user.user_metadata?.profile_completed === true) return true;
  if (row?.profile_completed === true) return true;

  const phone =
    (user.user_metadata?.phone as string | undefined) || row?.phone || "";
  const school =
    (user.user_metadata?.school_name as string | undefined) || row?.school_name || "";
  const town =
    (user.user_metadata?.town_region as string | undefined) || row?.town_region || "";
  const stream =
    (user.user_metadata?.stream as string | undefined) || row?.stream || "";
  const hear =
    (user.user_metadata?.hear_about as string | undefined) || row?.hear_about || "";
  const intent =
    (user.user_metadata?.account_intent as string | undefined) ||
    row?.account_intent ||
    "";

  return Boolean(
    phone.trim().length >= 9 &&
      school.trim().length >= 2 &&
      town.trim().length >= 2 &&
      stream &&
      hear &&
      intent
  );
}

/**
 * After login/signup/OAuth: send incomplete profiles to onboarding.
 * Preserves ?next= when safe (same-origin path only).
 */
export function postAuthPath(user: User, nextPath?: string | null): string {
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";

  if (!isProfileComplete(user)) {
    if (safeNext && safeNext !== "/" && safeNext !== "/complete-profile") {
      return `/complete-profile?next=${encodeURIComponent(safeNext)}`;
    }
    return "/complete-profile";
  }
  return safeNext || "/";
}

export async function fetchProfileRow(userId: string): Promise<ProfileRow | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as ProfileRow;
  } catch {
    return null;
  }
}

/** Upsert the signed-in user into public.profiles so admin can list registered users */
export async function ensureProfile(user: User) {
  if (!user?.id || !user.email) return;

  const client = getClient();
  const fullName = displayNameFromUser(user);
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const payload: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    full_name: fullName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  };

  // Mirror metadata if already collected
  const meta = user.user_metadata || {};
  if (meta.phone) payload.phone = meta.phone;
  if (meta.school_name) payload.school_name = meta.school_name;
  if (meta.town_region) payload.town_region = meta.town_region;
  if (meta.stream) payload.stream = meta.stream;
  if (meta.hear_about) payload.hear_about = meta.hear_about;
  if (meta.account_intent) payload.account_intent = meta.account_intent;
  if (meta.profile_completed === true) payload.profile_completed = true;

  await client.from("profiles").upsert(payload, { onConflict: "id" });
}

/** Save onboarding answers to auth metadata + profiles table. */
export async function saveCompletedProfile(
  user: User,
  details: ProfileDetails
): Promise<{ ok: boolean; error?: string }> {
  const fullName = details.fullName.trim();
  const phone = details.phone.trim();
  const schoolName = details.schoolName.trim();
  const townRegion = details.townRegion.trim();

  if (fullName.length < 2) return { ok: false, error: "Enter your full name." };
  if (phone.replace(/\s/g, "").length < 9)
    return { ok: false, error: "Enter a valid phone number (e.g. 09…)." };
  if (schoolName.length < 2)
    return { ok: false, error: "Enter your school or university name." };
  if (townRegion.length < 2)
    return { ok: false, error: "Enter your town or region." };

  const { error: authErr } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone,
      school_name: schoolName,
      town_region: townRegion,
      stream: details.stream,
      hear_about: details.hearAbout,
      account_intent: details.intent,
      profile_completed: true,
    },
  });

  if (authErr) {
    return { ok: false, error: authErr.message };
  }

  try {
    const client = getClient();
    await client.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone,
        school_name: schoolName,
        town_region: townRegion,
        stream: details.stream,
        hear_about: details.hearAbout,
        account_intent: details.intent,
        profile_completed: true,
        avatar_url:
          user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch (e) {
    console.warn("[profile] table upsert soft-fail", e);
    // Metadata already saved — still OK for gating
  }

  return { ok: true };
}
