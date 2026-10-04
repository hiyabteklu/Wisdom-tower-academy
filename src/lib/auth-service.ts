import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { authEmailFromIdentifier } from "@/lib/authIdentity";
import { applyDefaultPackagesForLevel } from "@/lib/academic-levels";
import type { User } from "@supabase/supabase-js";

export interface ScholarAccount {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  educationLevel: string;
  passwordHash: string; // Base64 encoded simple hash for local credential verification
  createdAt: string;
}

const STORAGE_SCHOLARS_KEY = "wt_scholar_directory_v2";
const STORAGE_AUTH_SESSION_KEY = "wt-academy-auth-v1";

function hashPassword(pwd: string): string {
  if (typeof window === "undefined") return pwd;
  try {
    return btoa(unescape(encodeURIComponent(pwd)));
  } catch {
    return pwd;
  }
}

export function getLocalScholarAccounts(): ScholarAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_SCHOLARS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalScholarAccount(account: ScholarAccount) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalScholarAccounts().filter(
      (a) => a.email !== account.email && (!a.phone || a.phone !== account.phone)
    );
    existing.push(account);
    window.localStorage.setItem(STORAGE_SCHOLARS_KEY, JSON.stringify(existing));
  } catch {
    /* ignore */
  }
}

export function findLocalScholar(
  identifier: string
): ScholarAccount | undefined {
  const accounts = getLocalScholarAccounts();
  const trimmed = identifier.trim().toLowerCase();

  try {
    const { email, phone } = authEmailFromIdentifier(identifier);
    return accounts.find(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() ||
        (phone && a.phone && a.phone === phone) ||
        a.email.toLowerCase() === trimmed
    );
  } catch {
    return accounts.find(
      (a) =>
        a.email.toLowerCase() === trimmed ||
        (a.phone && a.phone.includes(trimmed))
    );
  }
}

/**
 * Creates and writes a Supabase-compatible session directly to localStorage
 * so that supabase.auth.getSession(), AccountPage, Settings, and Learning immediately recognize the active session.
 */
export function persistScholarSession(account: {
  id: string;
  email: string;
  fullName: string;
  educationLevel: string;
  phone?: string | null;
}) {
  if (typeof window === "undefined") return;

  const nowSec = Math.floor(Date.now() / 1000);
  const sessionPayload = {
    access_token: `wt-token-${account.id}-${nowSec}`,
    token_type: "bearer",
    expires_in: 60 * 60 * 24 * 30, // 30 days
    expires_at: nowSec + 60 * 60 * 24 * 30,
    refresh_token: `wt-refresh-${account.id}`,
    user: {
      id: account.id,
      aud: "authenticated",
      role: "authenticated",
      email: account.email,
      phone: account.phone || "",
      user_metadata: {
        full_name: account.fullName,
        education_level: account.educationLevel,
        phone: account.phone || null,
      },
      app_metadata: { provider: "email" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  try {
    window.localStorage.setItem(
      STORAGE_AUTH_SESSION_KEY,
      JSON.stringify(sessionPayload)
    );
    // Cache profile for getFullProfile fallback
    const profileKey = `wt_profile_${account.id}`;
    const cachedProfile = {
      id: account.id,
      email: account.email,
      full_name: account.fullName,
      phone: account.phone || null,
      education_level: account.educationLevel,
      daily_study_goal_minutes: 45,
      preferred_study_time: "evening",
      avatar_preset: "scholar-cyan",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    window.localStorage.setItem(profileKey, JSON.stringify(cachedProfile));

    // Notify all app listeners
    window.dispatchEvent(new Event("storage"));
  } catch {
    /* ignore */
  }
}

export type AuthResult = {
  success: boolean;
  user?: Partial<User>;
  code?: "user_already_exists" | "invalid_credentials" | "user_not_found" | "generic_error";
  message?: string;
};

/**
 * Perform scholar login with dual Supabase + resilient local fallback
 */
export async function loginScholar(
  identifier: string,
  password: string
): Promise<AuthResult> {
  const cleanId = identifier.trim();
  if (!cleanId || !password) {
    return {
      success: false,
      code: "invalid_credentials",
      message: "Please enter your email or phone number and password.",
    };
  }

  let authEmail = cleanId;
  let phoneNum: string | null = null;
  try {
    const parsed = authEmailFromIdentifier(cleanId);
    authEmail = parsed.email;
    phoneNum = parsed.phone;
  } catch (e) {
    return {
      success: false,
      code: "invalid_credentials",
      message: e instanceof Error ? e.message : "Invalid email or phone number.",
    };
  }

  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (!error && data?.session?.user) {
        // Also sync to local account directory
        const user = data.session.user;
        const education =
          (user.user_metadata?.education_level as string) || "Freshman";
        persistScholarSession({
          id: user.id,
          email: user.email || authEmail,
          fullName:
            (user.user_metadata?.full_name as string) || "Student Scholar",
          educationLevel: education,
          phone: phoneNum || (user.user_metadata?.phone as string) || null,
        });
        return { success: true, user: user as unknown as Partial<User> };
      }
    } catch {
      /* Fallback to local scholar directory */
    }
  }

  // 2. Check local scholar directory
  const localScholar = findLocalScholar(cleanId);
  if (!localScholar) {
    return {
      success: false,
      code: "user_not_found",
      message: "No account found with this email or phone number.",
    };
  }

  const hashed = hashPassword(password);
  if (localScholar.passwordHash !== hashed && localScholar.passwordHash !== password) {
    return {
      success: false,
      code: "invalid_credentials",
      message: "Incorrect password. Please try again.",
    };
  }

  // Credentials matched!
  persistScholarSession({
    id: localScholar.id,
    email: localScholar.email,
    fullName: localScholar.fullName,
    educationLevel: localScholar.educationLevel,
    phone: localScholar.phone,
  });

  return {
    success: true,
    user: {
      id: localScholar.id,
      email: localScholar.email,
      user_metadata: {
        full_name: localScholar.fullName,
        education_level: localScholar.educationLevel,
        phone: localScholar.phone,
      },
    },
  };
}

/**
 * Register scholar with dual Supabase + instant local persistence
 */
export async function registerScholar(params: {
  fullName: string;
  identifier: string;
  password: string;
  educationLevel: string;
}): Promise<AuthResult> {
  const { fullName, identifier, password, educationLevel } = params;
  const cleanId = identifier.trim();

  let authEmail = cleanId;
  let phoneNum: string | null = null;
  try {
    const parsed = authEmailFromIdentifier(cleanId);
    authEmail = parsed.email;
    phoneNum = parsed.phone;
  } catch (e) {
    return {
      success: false,
      code: "invalid_credentials",
      message: e instanceof Error ? e.message : "Invalid email or phone number.",
    };
  }

  // Check if account already exists locally
  const existing = findLocalScholar(cleanId);
  if (existing) {
    return {
      success: false,
      code: "user_already_exists",
      message: "An account with this email or phone number already exists.",
    };
  }

  const scholarId = `wta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newAccount: ScholarAccount = {
    id: scholarId,
    email: authEmail,
    phone: phoneNum,
    fullName: fullName.trim() || "Student Scholar",
    educationLevel,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  // Try server-side or Supabase sign-up in background/best-effort
  if (isSupabaseConfigured()) {
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password,
          fullName: newAccount.fullName,
          educationLevel,
          phone: phoneNum,
        }),
      }).catch(() => null);

      await supabase.auth
        .signUp({
          email: authEmail,
          password,
          options: {
            data: {
              full_name: newAccount.fullName,
              education_level: educationLevel,
              phone: phoneNum,
            },
          },
        })
        .catch(() => null);
    } catch {
      /* ignore */
    }
  }

  // Save scholar account locally
  saveLocalScholarAccount(newAccount);

  // Set active session in localStorage
  persistScholarSession({
    id: newAccount.id,
    email: newAccount.email,
    fullName: newAccount.fullName,
    educationLevel: newAccount.educationLevel,
    phone: newAccount.phone,
  });

  // Apply default My Learning packages based on the academic level!
  applyDefaultPackagesForLevel(educationLevel);

  return {
    success: true,
    user: {
      id: newAccount.id,
      email: newAccount.email,
      user_metadata: {
        full_name: newAccount.fullName,
        education_level: newAccount.educationLevel,
        phone: newAccount.phone,
      },
    },
  };
}
