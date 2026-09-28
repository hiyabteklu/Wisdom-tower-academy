"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getFullProfile,
  updateFullProfile,
  ensureProfile,
  AVATAR_PRESETS,
  EDUCATION_LEVELS,
  ACADEMIC_STREAMS,
  ETHIOPIAN_REGIONS,
  type UserProfileRecord,
} from "@/lib/profile";
import {
  loadPreferences,
  savePreferences,
  DEFAULT_PREFS,
  type UserPreferences,
} from "@/lib/preferences";
import StudentAvatar from "@/components/StudentAvatar";
import { flushOfflineQueue } from "@/lib/contentWithOffline";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Database,
  Download,
  Eye,
  FileText,
  HardDrive,
  Key,
  Layers,
  Lock,
  LogOut,
  Moon,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  Trash2,
  User as UserIcon,
  Volume2,
  Zap,
} from "lucide-react";

type SettingsSection =
  | "profile"
  | "app"
  | "study"
  | "notifications"
  | "storage"
  | "security";

const SECTIONS: {
  id: SettingsSection;
  label: string;
  icon: typeof UserIcon;
  badge?: string;
  desc: string;
}[] = [
  { id: "profile", label: "Academic Profile", icon: UserIcon, desc: "Identity, school & stream" },
  { id: "app", label: "App & Webview", icon: Smartphone, badge: "App", desc: "AMOLED, text scale & data" },
  { id: "study", label: "Study & Goals", icon: Target, desc: "Daily goals & time targets" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Study alerts & updates" },
  { id: "storage", label: "Offline & Storage", icon: HardDrive, desc: "Sync, cache & data size" },
  { id: "security", label: "Security & Data", icon: Lock, desc: "Password, export & session" },
];

function Toggle({
  on,
  onChange,
  label,
  disabled = false,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 shrink-0 ${
        on ? "bg-cyan-500 shadow-sm shadow-cyan-500/30" : "bg-white/15"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          on ? "translate-x-5.5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsSection) || "profile";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<SettingsSection>(
    SECTIONS.some((s) => s.id === initialTab) ? initialTab : "profile"
  );

  // Profile State
  const [profile, setProfile] = useState<Partial<UserProfileRecord>>({
    full_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    education_level: "",
    school_name: "",
    town_region: "",
    stream: "",
    bio: "",
    target_exam: "",
    target_score: "",
    daily_study_goal_minutes: 45,
    preferred_study_time: "evening",
    avatar_preset: "scholar-cyan",
    avatar_url: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Preferences State (Stored in localStorage and synced)
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [savedFlash, setSavedFlash] = useState(false);

  // Password Update State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Storage State
  const [storageSize, setStorageSize] = useState<string>("Calculating...");
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Initialize and load user data
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/settings");
        return;
      }

      await ensureProfile(session.user);
      const full = await getFullProfile(session.user.id);

      if (!cancelled) {
        setUser(session.user);
        setPrefs(loadPreferences());

        const meta = session.user.user_metadata || {};
        setProfile({
          full_name: full?.full_name || meta.full_name || meta.name || "",
          first_name: full?.first_name || meta.first_name || "",
          last_name: full?.last_name || meta.last_name || "",
          phone: full?.phone || meta.phone || "",
          education_level: full?.education_level || meta.education_level || "",
          school_name: full?.school_name || meta.school_name || "",
          town_region: full?.town_region || meta.town_region || "",
          stream: full?.stream || meta.stream || "",
          bio: full?.bio || meta.bio || "",
          target_exam: full?.target_exam || meta.target_exam || "",
          target_score: full?.target_score || meta.target_score || "",
          daily_study_goal_minutes:
            full?.daily_study_goal_minutes || meta.daily_study_goal_minutes || 45,
          preferred_study_time:
            full?.preferred_study_time || meta.preferred_study_time || "evening",
          avatar_preset:
            full?.avatar_preset || meta.avatar_preset || "scholar-cyan",
          avatar_url: full?.avatar_url || meta.avatar_url || "",
        });

        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Calculate local storage footprint
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalBytes += (localStorage.getItem(key) || "").length * 2;
        }
      }
      if (totalBytes < 1024) {
        setStorageSize(`${totalBytes} B`);
      } else if (totalBytes < 1024 * 1024) {
        setStorageSize(`${(totalBytes / 1024).toFixed(1)} KB`);
      } else {
        setStorageSize(`${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
      }
    } catch {
      setStorageSize("Available");
    }
  }, []);

  // Update client preference & save
  const updatePref = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        savePreferences(next);
        setSavedFlash(true);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (!savedFlash) return;
    const t = setTimeout(() => setSavedFlash(false), 2000);
    return () => clearTimeout(t);
  }, [savedFlash]);

  // Save Full Academic Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileFeedback(null);

    // Compute full name if individual names are populated
    let computedFullName = profile.full_name?.trim() || "";
    if (!computedFullName && (profile.first_name || profile.last_name)) {
      computedFullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
    }

    const updates: Partial<UserProfileRecord> = {
      ...profile,
      full_name: computedFullName,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    };

    const res = await updateFullProfile(user.id, updates);

    if (res.success) {
      setProfileFeedback({ type: "success", msg: "Academic profile saved successfully." });
      setSavedFlash(true);
    } else {
      setProfileFeedback({
        type: "error",
        msg: res.error || "Could not save profile. Check your connection.",
      });
    }

    setSavingProfile(false);
  };

  // Change Password Action
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "Passwords do not match. Please re-enter.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMsg({
        type: "success",
        text: "Password updated successfully. Use this password for future logins.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setPasswordMsg({ type: "error", text: msg });
    }
    setPasswordLoading(false);
  };

  // Sync Offline Queue
  const handleSyncOffline = async () => {
    setSyncingOffline(true);
    setSyncMsg(null);
    try {
      await flushOfflineQueue();
      setSyncMsg("All offline study progress has been synchronized to cloud.");
    } catch {
      setSyncMsg("Sync completed with local cache.");
    }
    setSyncingOffline(false);
  };

  // Clear Offline Storage
  const handleClearCache = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Are you sure you want to clear cached study notes and offline data? Your online account progress remains completely safe."
      )
    ) {
      localStorage.removeItem("wta_offline_resources_v1");
      localStorage.removeItem("wta_offline_progress_v1");
      localStorage.removeItem("wta_offline_sync_queue_v1");
      setStorageSize("0 KB");
      setSyncMsg("Offline cache cleared.");
    }
  };

  // Export Academic Records JSON
  const handleExportData = () => {
    if (!user) return;
    const dataToExport = {
      exportDate: new Date().toISOString(),
      studentIdentity: {
        userId: user.id,
        email: user.email,
        profile,
      },
      appPreferences: prefs,
      system: "Wisdom Tower Academy v3.2",
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wta-academic-record-${user.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-wisdom-muted font-medium">Loading your academic settings...</p>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 md:py-14 min-h-[85vh] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="mb-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-wisdom-card via-wisdom-navy to-wisdom-card p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StudentAvatar
              avatarPreset={profile.avatar_preset}
              avatarUrl={profile.avatar_url}
              name={profile.full_name}
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-black text-white truncate">
                  {profile.full_name || "Enrolled Student"}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                  Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-wisdom-muted truncate">
                {profile.education_level || "Academic Scholar"}
                {profile.school_name ? ` · ${profile.school_name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            <Link
              href="/account"
              className="btn-secondary text-xs sm:text-sm px-3.5 py-2 border-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Account
            </Link>
          </div>
        </div>

        {/* Layout Grid: Left Sidebar Tabs / Right Dynamic Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Navigation Tabs (Horizontal on mobile, Vertical on desktop) */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 sticky lg:top-24 z-10">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all shrink-0 lg:shrink lg:w-full cursor-pointer ${
                    active
                      ? "bg-cyan-500/15 border border-cyan-400/40 text-white shadow-lg shadow-cyan-500/10 font-bold"
                      : "border border-white/5 text-wisdom-muted hover:bg-white/5 hover:text-white font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 ${active ? "text-cyan-300" : "text-wisdom-muted"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm truncate">{s.label}</span>
                      {s.badge && (
                        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:block text-[11px] text-wisdom-muted/70 truncate mt-0.5">
                      {s.desc}
                    </span>
                  </div>
                  {active && (
                    <ChevronRight className="w-4 h-4 ml-auto text-cyan-300 hidden lg:block shrink-0" />
                  )}
                </button>
              );
            })}

            <div className="hidden lg:block pt-4 mt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </nav>

          {/* Settings Detail Pane */}
          <main className="rounded-3xl border border-white/10 bg-wisdom-card/90 backdrop-blur-md p-5 sm:p-8 shadow-2xl">
            {/* 1. ACADEMIC PROFILE TAB */}
            {section === "profile" && (
              <div>
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-cyan-300" />
                      Academic & Student Identity
                    </h2>
                    <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                      Customize your Ethiopian curriculum profile, academic level, and avatar.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Preset Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                      Choose Your Academic Avatar
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AVATAR_PRESETS.map((p) => {
                        const selected = profile.avatar_preset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                avatar_preset: p.id,
                                avatar_url: null,
                              }))
                            }
                            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                              selected
                                ? `border-cyan-400 bg-cyan-500/15 ${p.glow} ring-2 ring-cyan-400/30`
                                : "border-white/10 bg-white/[0.02] hover:border-white/20"
                            }`}
                          >
                            <StudentAvatar avatarPreset={p.id} size="sm" showGlow={false} />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{p.name}</p>
                              <p className="text-[10px] text-wisdom-muted truncate">{p.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.first_name || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, first_name: e.target.value }))
                        }
                        placeholder="e.g. Abebe"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.last_name || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, last_name: e.target.value }))
                        }
                        placeholder="e.g. Bikila"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Contact Phone & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Phone Number (Ethiopia)
                      </label>
                      <input
                        type="tel"
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="09... or +251..."
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                      />
                      <p className="text-[11px] text-wisdom-muted mt-1">
                        Used for payment verification & SMS order delivery.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email || "No email linked"}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-wisdom-muted text-sm cursor-not-allowed font-mono"
                      />
                      <p className="text-[11px] text-wisdom-muted mt-1">
                        Primary authentication identity.
                      </p>
                    </div>
                  </div>

                  {/* Education Level & Stream */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Education Level
                      </label>
                      <select
                        value={profile.education_level || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, education_level: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-wisdom-navy text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        <option value="">Select your academic level</option>
                        {EDUCATION_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Stream / Field of Study
                      </label>
                      <select
                        value={profile.stream || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, stream: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-wisdom-navy text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        <option value="">Select your discipline stream</option>
                        {ACADEMIC_STREAMS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* School/University & Region */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        School / University Name
                      </label>
                      <input
                        type="text"
                        value={profile.school_name || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, school_name: e.target.value }))
                        }
                        placeholder="e.g. Addis Ababa University (AAU) or High School"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Town / Region
                      </label>
                      <select
                        value={profile.town_region || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, town_region: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-wisdom-navy text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      >
                        <option value="">Select Region</option>
                        {ETHIOPIAN_REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Target Goal & Score */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Target Milestone / Exam
                      </label>
                      <input
                        type="text"
                        value={profile.target_exam || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, target_exam: e.target.value }))
                        }
                        placeholder="e.g. 2026 Matriculation Exam or Freshman Sem 1"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Target Score Goal
                      </label>
                      <input
                        type="text"
                        value={profile.target_score || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, target_score: e.target.value }))
                        }
                        placeholder="e.g. 600+ / 3.9 GPA / Distinction"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Academic Bio / Motto */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Academic Motto / Bio
                    </label>
                    <textarea
                      rows={2}
                      value={profile.bio || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      placeholder="Share a short study mantra, dream university, or professional vision..."
                      className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                    />
                  </div>

                  {/* Feedback Message */}
                  {profileFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-medium border ${
                        profileFeedback.type === "success"
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {profileFeedback.msg}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary px-7 py-3 text-sm flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Academic Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. APP & WEBVIEW DISPLAY TAB */}
            {section === "app" && (
              <div>
                <div className="pb-6 mb-6 border-b border-white/10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-2">
                    <Smartphone className="w-3 h-3" />
                    Webview & Mobile App Optimization
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Display & Ergonomics
                  </h2>
                  <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                    Fine-tuned for running inside Android WebViews and mobile screens.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* AMOLED True-Black Mode */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-purple-400" />
                        <p className="text-sm font-bold text-white">AMOLED True-Black Mode</p>
                      </div>
                      <p className="text-xs text-wisdom-muted">
                        Sets background to pure #000000 black. Saves battery on OLED/AMOLED mobile screens.
                      </p>
                    </div>
                    <Toggle
                      label="AMOLED Mode"
                      on={prefs.amoledMode}
                      onChange={(v) => updatePref("amoledMode", v)}
                    />
                  </div>

                  {/* Data Saver Mode */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <p className="text-sm font-bold text-white">Ethiopian Cellular Data Saver</p>
                      </div>
                      <p className="text-xs text-wisdom-muted">
                        Limits non-essential image preloading to conserve mobile package data.
                      </p>
                    </div>
                    <Toggle
                      label="Data Saver"
                      on={prefs.dataSaver}
                      onChange={(v) => updatePref("dataSaver", v)}
                    />
                  </div>

                  {/* Font Size Scaling */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div>
                      <p className="text-sm font-bold text-white">Font Size Scaling</p>
                      <p className="text-xs text-wisdom-muted">
                        Adjust reading comfort across mobile phones and tablets.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "compact", label: "Compact", scale: "14.5px" },
                        { id: "normal", label: "Standard", scale: "16px" },
                        { id: "large", label: "Large", scale: "17.5px" },
                        { id: "xlarge", label: "Extra Large", scale: "19px" },
                      ].map((item) => {
                        const active = (prefs.fontSize || "normal") === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              updatePref(
                                "fontSize",
                                item.id as "compact" | "normal" | "large" | "xlarge"
                              )
                            }
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              active
                                ? "border-cyan-400 bg-cyan-500/20 text-white font-bold"
                                : "border-white/10 bg-white/5 text-wisdom-muted hover:text-white"
                            }`}
                          >
                            <span className="block text-xs">{item.label}</span>
                            <span className="text-[10px] text-wisdom-muted/70">{item.scale}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Preview */}
                    <div className="mt-3 p-3.5 rounded-xl border border-white/8 bg-black/30">
                      <p className="text-xs text-wisdom-muted mb-1 font-mono uppercase tracking-wider">
                        Live Note Preview:
                      </p>
                      <p className="text-white/90 leading-relaxed">
                        “The new modular curriculum prioritizes critical problem solving and analytical competencies.”
                      </p>
                    </div>
                  </div>

                  {/* Reading Font Family */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div>
                      <p className="text-sm font-bold text-white">Textbook Reading Font</p>
                      <p className="text-xs text-wisdom-muted">
                        Choose your preferred typography for long study notes and chapter summaries.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "sans", label: "Modern Sans", desc: "Clean & Crisp" },
                        { id: "serif", label: "Academic Serif", desc: "Booklike" },
                        { id: "mono", label: "Technical Mono", desc: "Engineers" },
                      ].map((font) => {
                        const active = (prefs.readingFont || "sans") === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() =>
                              updatePref("readingFont", font.id as "sans" | "serif" | "mono")
                            }
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              active
                                ? "border-cyan-400 bg-cyan-500/20 text-white font-bold"
                                : "border-white/10 bg-white/5 text-wisdom-muted hover:text-white"
                            }`}
                          >
                            <span className="block text-xs">{font.label}</span>
                            <span className="text-[10px] text-wisdom-muted/70">{font.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sound Effects */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <p className="text-sm font-bold text-white">Sound Effects & Haptics</p>
                      </div>
                      <p className="text-xs text-wisdom-muted">
                        Audio cues on quiz answer submissions and Pomodoro focus timer bells.
                      </p>
                    </div>
                    <Toggle
                      label="Sound Effects"
                      on={prefs.soundEffects}
                      onChange={(v) => updatePref("soundEffects", v)}
                    />
                  </div>

                  {/* Reduced Motion */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Reduced Motion</p>
                      <p className="text-xs text-wisdom-muted">
                        Minimizes 3D tilts and animations for smoother rendering on budget smartphones.
                      </p>
                    </div>
                    <Toggle
                      label="Reduced Motion"
                      on={prefs.reducedMotion}
                      onChange={(v) => updatePref("reducedMotion", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. STUDY TARGETS & GOALS TAB */}
            {section === "study" && (
              <div>
                <div className="pb-6 mb-6 border-b border-white/10">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-300" />
                    Daily Study Goals & Pomodoro
                  </h2>
                  <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                    Set your daily minute milestones and focus habits.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Daily Study Goal */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Daily Target Study Time</p>
                      <span className="text-sm font-extrabold text-cyan-300 font-mono">
                        {prefs.studyGoalMinutes || 45} mins / day
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[15, 30, 45, 60, 90, 120].map((mins) => {
                        const active = (prefs.studyGoalMinutes || 45) === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => updatePref("studyGoalMinutes", mins)}
                            className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                              active
                                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                                : "border-white/10 bg-white/5 text-wisdom-muted hover:text-white"
                            }`}
                          >
                            {mins}m
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-wisdom-muted">
                      Your streak counter increments as you read chapter notes and solve exam banks.
                    </p>
                  </div>

                  {/* Preferred Study Time */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <p className="text-sm font-bold text-white">Optimal Study Time Window</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "morning", label: "Morning", time: "5 AM - 9 AM" },
                        { id: "afternoon", label: "Afternoon", time: "1 PM - 5 PM" },
                        { id: "evening", label: "Evening", time: "6 PM - 10 PM" },
                        { id: "night", label: "Late Night", time: "11 PM - 3 AM" },
                      ].map((slot) => {
                        const active =
                          (prefs.preferredStudyTime || "evening") === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              updatePref(
                                "preferredStudyTime",
                                slot.id as "morning" | "afternoon" | "evening" | "night"
                              )
                            }
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              active
                                ? "border-cyan-400 bg-cyan-500/20 text-white font-bold"
                                : "border-white/10 bg-white/5 text-wisdom-muted hover:text-white"
                            }`}
                          >
                            <span className="block text-xs">{slot.label}</span>
                            <span className="text-[10px] text-wisdom-muted/70">{slot.time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Focus Session Pomodoro Duration */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white">Default Focus Timer Length</p>
                      <span className="text-sm font-mono text-amber-300 font-bold">
                        {prefs.focusSessionDuration || 25} minutes
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { mins: 25, label: "Pomodoro (25m)", note: "Short sprint" },
                        { mins: 45, label: "Deep Work (45m)", note: "High yield" },
                        { mins: 60, label: "Full Exam (60m)", note: "Simulated exam" },
                      ].map((item) => {
                        const active = (prefs.focusSessionDuration || 25) === item.mins;
                        return (
                          <button
                            key={item.mins}
                            type="button"
                            onClick={() => updatePref("focusSessionDuration", item.mins)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              active
                                ? "border-cyan-400 bg-cyan-500/20 text-white font-bold"
                                : "border-white/10 bg-white/5 text-wisdom-muted hover:text-white"
                            }`}
                          >
                            <span className="block text-xs font-semibold">{item.label}</span>
                            <span className="text-[10px] text-wisdom-muted/70">{item.note}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {section === "notifications" && (
              <div>
                <div className="pb-6 mb-6 border-b border-white/10">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-cyan-300" />
                    Notification Center
                  </h2>
                  <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                    Control learning milestones, payment updates, and exam alerts.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: "notifDailyStudy" as const,
                      title: "Daily Study & Streak Reminders",
                      desc: "Keep your momentum alive with notifications for daily minute milestones.",
                    },
                    {
                      key: "notifPayment" as const,
                      title: "Order & Payment Verification Updates",
                      desc: "Real-time alerts when your Telebirr / CBE payment receipt is verified and unlocked.",
                    },
                    {
                      key: "notifExams" as const,
                      title: "New Exam Banks & Chapter Solutions",
                      desc: "Receive updates when fresh midterms, finals, or COC/Exit Exam questions are published.",
                    },
                    {
                      key: "notifScholarships" as const,
                      title: "Scholarship & University Admissions",
                      desc: "Alerts for newly published fully funded international and Ethiopian university opportunities.",
                    },
                    {
                      key: "notifMarketing" as const,
                      title: "Educational Newsletters",
                      desc: "Occasional strategy guides on exam techniques and university placement.",
                    },
                  ].map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{row.title}</p>
                        <p className="text-xs text-wisdom-muted mt-0.5">{row.desc}</p>
                      </div>
                      <Toggle
                        label={row.title}
                        on={Boolean(prefs[row.key])}
                        onChange={(v) => updatePref(row.key, v)}
                      />
                    </div>
                  ))}

                  {/* Email Digest Frequency */}
                  <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Email Digest Frequency</p>
                      <p className="text-xs text-wisdom-muted">
                        Weekly summary of your completed reading time and questions attempted.
                      </p>
                    </div>
                    <select
                      value={prefs.emailDigest || "weekly"}
                      onChange={(e) =>
                        updatePref(
                          "emailDigest",
                          e.target.value as "off" | "daily" | "weekly"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl border border-white/15 bg-wisdom-navy text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="off">Off</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. OFFLINE & STORAGE MANAGER TAB */}
            {section === "storage" && (
              <div>
                <div className="pb-6 mb-6 border-b border-white/10">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-cyan-300" />
                    Offline Storage & Data Sync
                  </h2>
                  <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                    Manage local device storage used for studying without internet in Ethiopia.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Storage Status Card */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <p className="text-sm font-bold text-white">Device Offline Cache Size</p>
                      </div>
                      <p className="text-xs text-wisdom-muted">
                        Includes downloaded chapter summaries, flashcard sets, and progress timestamps.
                      </p>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 font-mono font-bold text-sm self-start sm:self-center">
                      {storageSize}
                    </div>
                  </div>

                  {/* Sync Offline Queue */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">Flush Offline Queue</p>
                        <p className="text-xs text-wisdom-muted">
                          Upload any quiz answers or reading seconds accumulated while offline.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSyncOffline}
                        disabled={syncingOffline}
                        className="btn-secondary text-xs px-4 py-2 border-cyan-400/30 text-cyan-300 flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingOffline ? "animate-spin" : ""}`} />
                        {syncingOffline ? "Syncing..." : "Sync to Cloud Now"}
                      </button>
                    </div>
                  </div>

                  {/* Reset Cache */}
                  <div className="p-5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-rose-300">Clear Offline Cache</p>
                        <p className="text-xs text-wisdom-muted">
                          Frees up phone storage. Cloud records and purchased packages are untouched.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Local Cache
                      </button>
                    </div>
                  </div>

                  {syncMsg && (
                    <div className="p-3.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium">
                      {syncMsg}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. SECURITY & DATA TAB */}
            {section === "security" && (
              <div>
                <div className="pb-6 mb-6 border-b border-white/10">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-300" />
                    Security & Data Governance
                  </h2>
                  <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                    Manage passwords, review authenticated sessions, and export records.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Change Password Form */}
                  <form
                    onSubmit={handlePasswordChange}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <p className="text-sm font-bold text-white">Change Account Password</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {passwordMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs font-medium border ${
                          passwordMsg.type === "success"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {passwordMsg.text}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={passwordLoading || !newPassword}
                        className="btn-primary text-xs px-5 py-2.5 cursor-pointer disabled:opacity-50"
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>

                  {/* Active Session Info */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <p className="text-sm font-bold text-white">Active Session Details</p>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs text-wisdom-muted font-mono">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="block text-slate-400 text-[10px] uppercase font-sans font-bold">
                          Identity Provider
                        </span>
                        <span className="text-white font-semibold capitalize">
                          {user.app_metadata?.provider || "Email"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="block text-slate-400 text-[10px] uppercase font-sans font-bold">
                          Account Created
                        </span>
                        <span className="text-white">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "Recent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Export Academic Data */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-cyan-400" />
                        <p className="text-sm font-bold text-white">Export Academic Records</p>
                      </div>
                      <p className="text-xs text-wisdom-muted">
                        Download a complete JSON export of your student profile and progress history.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="btn-secondary text-xs px-4 py-2 border-white/15 text-white flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </button>
                  </div>

                  {/* Session Sign-Out */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">End Active Session</p>
                      <p className="text-xs text-wisdom-muted">
                        Safely sign out from this device or webview app.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-xl border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
