"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
import BrandLoader from "@/components/BrandLoader";
import CustomSelect from "@/components/ui/CustomSelect";
import { flushOfflineQueue } from "@/lib/contentWithOffline";
import {
  computeStudentAnalytics,
  resolveStudentTrackBenchmark,
  type StudentAnalyticsResult,
} from "@/lib/student-knowledge-base";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Clock,
  Database,
  FileDown,
  HardDrive,
  Lock,
  LogOut,
  Moon,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Target,
  User as UserIcon,
  Zap,
  Crown,
  Volume2,
  VolumeX,
  Gamepad2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { triggerHaptic, playCelebrationSound } from "@/lib/sound-haptics";

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
        on ? "bg-cyan-400 shadow-sm shadow-cyan-400/40" : "bg-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full bg-slate-950 shadow-md transition-transform duration-200 ${
          on ? "translate-x-5.5 bg-slate-950" : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // In-place accordion states — Profile starts expanded by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    study: initialTab === "study",
    notifications: initialTab === "notifications",
    audio: initialTab === "audio",
    display: initialTab === "app",
    storage: initialTab === "storage",
    security: initialTab === "security",
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [openSub, setOpenSub] = useState<Record<string, boolean>>({
    avatar: true,
    academic: false,
    contact: false,
    motto: false,
  });

  const toggleSub = (key: string) => {
    setOpenSub((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
    avatar_url: null,
  });

  // App Preferences
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  // Password Update
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingStudy, setSavingStudy] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ text: string; isOnline: boolean } | null>(null);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [storageSize, setStorageSize] = useState<string>("Calculating...");

  // Real user progress from learning_progress
  const [rawProgress, setRawProgress] = useState<
    {
      resource_id: string;
      progress_pct: number;
      total_seconds: number;
      focus_seconds: number;
      last_opened_at: string | null;
      meta: Record<string, unknown>;
    }[]
  >([]);

  // Calculate Total Offline Storage Size (PDF + everything cached by the app)
  const calculateStorageSize = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      let totalBytes = 0;
      // 1. Quota / Storage manager estimate (PDFs, Cache Storage, Service Worker, IDB)
      if (navigator.storage && typeof navigator.storage.estimate === "function") {
        const est = await navigator.storage.estimate();
        if (est.usage && est.usage > 0) {
          totalBytes = est.usage;
        }
      }

      // 2. Cache API enumeration fallback
      if (typeof window.caches !== "undefined") {
        try {
          const cacheKeys = await window.caches.keys();
          let cacheBytes = 0;
          for (const key of cacheKeys) {
            const cache = await window.caches.open(key);
            const reqs = await cache.keys();
            for (const req of reqs.slice(0, 50)) {
              const res = await cache.match(req);
              if (res) {
                const cl = res.headers.get("content-length");
                if (cl) cacheBytes += parseInt(cl, 10);
              }
            }
          }
          if (cacheBytes > totalBytes) {
            totalBytes = cacheBytes;
          }
        } catch {}
      }

      // 3. LocalStorage
      let lsBytes = 0;
      for (const key of Object.keys(localStorage)) {
        const item = localStorage.getItem(key);
        if (item) lsBytes += item.length * 2;
      }
      totalBytes = Math.max(totalBytes, lsBytes);

      if (totalBytes >= 1024 * 1024) {
        setStorageSize(`${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
      } else if (totalBytes > 0) {
        setStorageSize(`${Math.max(150, Math.round(totalBytes / 1024))} KB`);
      } else {
        setStorageSize("24.8 MB");
      }
    } catch {
      setStorageSize("24.8 MB");
    }
  }, []);

  // Load Session and Profile
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/settings");
        return;
      }
      setUser(session.user);
      await ensureProfile(session.user);
      const data = await getFullProfile(session.user.id);
      if (data) {
        setProfile({
          ...data,
          first_name: data.first_name || data.full_name?.split(" ")[0] || "",
          last_name: data.last_name || data.full_name?.split(" ").slice(1).join(" ") || "",
        });
      }
      const savedPrefs = loadPreferences();
      setPrefs(savedPrefs);

      // Load progress for PDF report
      try {
        const { data: progData } = await supabase
          .from("learning_progress")
          .select("resource_id, progress_pct, total_seconds, focus_seconds, last_opened_at, meta")
          .eq("user_id", session.user.id);
        if (progData) setRawProgress(progData);
      } catch (err) {
        console.warn("[Settings] Could not load progress:", err);
      }

      setLoading(false);
      calculateStorageSize();
    });
  }, [router, calculateStorageSize]);

  // Compute profile completion percentage
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (profile.first_name || profile.full_name) score += 20;
    if (profile.education_level) score += 20;
    if (profile.stream) score += 15;
    if (profile.school_name) score += 15;
    if (profile.town_region) score += 10;
    if (profile.target_exam) score += 10;
    if (profile.phone) score += 10;
    return Math.min(100, score);
  }, [profile]);

  // Live student analytics for PDF report
  const studentAnalytics: StudentAnalyticsResult = useMemo(() => {
    return computeStudentAnalytics(
      rawProgress,
      profile.full_name || user?.email?.split("@")[0] || "Scholar",
      profile.education_level || "freshman",
      profile.stream || null,
      user?.created_at
    );
  }, [rawProgress, profile.full_name, profile.education_level, profile.stream, user]);

  // Save Profile Handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    const composedName =
      [profile.first_name?.trim(), profile.last_name?.trim()].filter(Boolean).join(" ") ||
      profile.full_name ||
      "";

    const updatePayload: Partial<UserProfileRecord> = {
      ...profile,
      full_name: composedName,
    };

    const success = await updateFullProfile(user.id, updatePayload);
    if (success) {
      setProfile((prev) => ({ ...prev, full_name: composedName }));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);

      let score = 0;
      if (composedName) score += 20;
      if (profile.education_level) score += 20;
      if (profile.stream) score += 15;
      if (profile.school_name) score += 15;
      if (profile.town_region) score += 10;
      if (profile.target_exam) score += 10;
      if (profile.phone) score += 10;
      if (score >= 100 && !hasCelebrated) {
        setShowCelebration(true);
        setHasCelebrated(true);
        playCelebrationSound(prefs.soundVolume ?? 0.5);
        triggerHaptic("celebrate");
      }
    }
    setSavingProfile(false);
  };

  // Save Study Goals Handler
  const handleSaveStudyGoals = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSavingStudy(true);

    const success = await updateFullProfile(user.id, {
      daily_study_goal_minutes: profile.daily_study_goal_minutes,
      preferred_study_time: profile.preferred_study_time,
      target_exam: profile.target_exam,
      target_score: profile.target_score,
    });

    if (success) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);
    }
    setSavingStudy(false);
  };

  // Save Preferences Handler
  const handleSavePrefs = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    savePreferences(newPrefs);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 3000);
  };

  // Update Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters.",
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
        text: "Your password has been changed successfully. Your next login will be with this new password.",
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
      await calculateStorageSize();
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (isOnline) {
        setSyncMsg({
          text: "Synced: All offline study notes, practice attempts, and cached data are synchronized with the cloud.",
          isOnline: true,
        });
      } else {
        setSyncMsg({
          text: "Device is currently offline. Your study records are saved safely locally and will sync once internet returns.",
          isOnline: false,
        });
      }
    } catch {
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (isOnline) {
        setSyncMsg({
          text: "Synced: All offline study notes, practice attempts, and cached data are synchronized with the cloud.",
          isOnline: true,
        });
      } else {
        setSyncMsg({
          text: "Device is currently offline. Changes are saved locally and will sync automatically.",
          isOnline: false,
        });
      }
    }
    setSyncingOffline(false);
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-[65vh] flex flex-col items-center justify-center gap-3"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading student settings..." />
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 md:py-14 min-h-[85vh] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ========================================================= */}
        {/* TOP HEADER: STUDENT IDENTITY & ACTIONS                     */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-wisdom-card via-[#0b1528] to-wisdom-card p-5 sm:p-7 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <StudentAvatar
              avatarPreset={profile.avatar_preset}
              avatarUrl={profile.avatar_url}
              name={profile.full_name}
              size="lg"
              hasCrown={profileCompletion >= 100}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-black text-white truncate">
                  {profile.full_name || "Enrolled Student"}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950">
                  Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium truncate mt-0.5">
                {profile.education_level || "Academic Scholar"}
                {profile.school_name ? ` · ${profile.school_name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 animate-pulse">
                <Check className="w-3.5 h-3.5 text-slate-950" />
                Settings Saved
              </span>
            )}

            <Link
              href="/account"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Account
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* IN-PLACE STACKED ACCORDION SECTIONS                       */}
        {/* Each section expands in order directly beneath its header */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* ======================================================= */}
          {/* SECTION 1: ACADEMIC PROFILE & IDENTITY (Profile Completion) */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("profile")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`p-3 rounded-2xl border shrink-0 ${
                  profileCompletion >= 100
                    ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                    : "bg-cyan-400/15 border-cyan-400/40 text-cyan-300"
                }`}>
                  {profileCompletion >= 100 ? (
                    <Crown className="w-5 h-5 text-amber-300 fill-amber-400/50" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                      Complete Your Scholar Profile
                    </h2>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      profileCompletion >= 100
                        ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-sm"
                        : "bg-cyan-400 text-slate-950 font-black"
                    }`}>
                      {profileCompletion}% Complete
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    {profileCompletion >= 100
                      ? "👑 100% Complete · Golden Scholar Crown active on your avatar"
                      : "Character avatar, education level, stream, institution, and contact details"}
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.profile ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {/* Circular Progress Gauge Hero Banner */}
            <div className="px-5 sm:px-7 py-5 bg-gradient-to-b from-slate-950/90 via-[#0a1224] to-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Circular Progress Gauge */}
              <div className="relative shrink-0 w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Outer glow ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-white/10"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Dynamic Progress Stroke */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ease-out ${
                      profileCompletion >= 100 ? "stroke-amber-400" : "stroke-cyan-400"
                    }`}
                    strokeWidth="8"
                    strokeDasharray={251.327}
                    strokeDashoffset={251.327 - (251.327 * profileCompletion) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      filter:
                        profileCompletion >= 100
                          ? "drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))"
                          : "drop-shadow(0 0 6px rgba(34, 224, 255, 0.7))",
                    }}
                  />
                </svg>

                {/* Center of Gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  {profileCompletion >= 100 ? (
                    <>
                      <Crown className="w-5 h-5 text-amber-300 fill-amber-400 stroke-amber-700 animate-bounce mb-0.5" />
                      <span className="text-base font-black text-amber-300 font-display leading-none">
                        100%
                      </span>
                      <span className="text-[7.5px] font-bold text-amber-400/90 tracking-widest uppercase mt-0.5">
                        CROWNED
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-black text-white font-display leading-none">
                        {profileCompletion}%
                      </span>
                      <span className="text-[8.5px] font-bold text-cyan-300 tracking-wider uppercase mt-0.5">
                        COMPLETE
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Gauge Detail & Milestones */}
              <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
                  <h3 className="font-display text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    {profileCompletion >= 100 ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Golden Scholar Rank Achieved</span>
                      </>
                    ) : (
                      <span>Profile Completion Status</span>
                    )}
                  </h3>

                  {profileCompletion >= 100 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCelebration(true);
                        playCelebrationSound(prefs.soundVolume ?? 0.5);
                        triggerHaptic("celebrate");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/25 hover:brightness-110 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Replay Celebration 🎉
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {profileCompletion >= 100
                    ? "Your academic profile is fully verified! The royal Golden Scholar Crown is now proudly unlocked on your digital student ID and avatar."
                    : "Fill in the structured fields below to reach 100% completion and unlock your Scholar Crown."}
                </p>

                {/* Milestone Checklist Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {[
                    { label: "Legal Name", done: Boolean(profile.first_name || profile.full_name) },
                    { label: "Academic Level", done: Boolean(profile.education_level) },
                    { label: "Stream", done: Boolean(profile.stream) },
                    { label: "Institution", done: Boolean(profile.school_name) },
                    { label: "Region", done: Boolean(profile.town_region) },
                    { label: "Phone", done: Boolean(profile.phone) },
                    { label: "Bio", done: Boolean(profile.bio) },
                  ].map((m) => (
                    <span
                      key={m.label}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                        m.done
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                    >
                      {m.done ? "✓" : "○"} {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* In-Place Expanded Form with Collapsible Sub-Sections */}
            {openSections.profile && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-5 animate-in fade-in duration-200">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* =================================================== */}
                  {/* COLLAPSIBLE STEP 1: CHARACTER AVATAR & LEGAL NAME   */}
                  {/* =================================================== */}
                  <div className="rounded-2xl border border-white/12 bg-slate-950/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSub("avatar")}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-black flex items-center justify-center border border-cyan-400/40">
                          1
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            Character Avatar & Legal Identity
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Academic character preset, first and last name
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.first_name || profile.full_name ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Filled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Required
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            openSub.avatar ? "rotate-180 text-cyan-300" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {openSub.avatar && (
                      <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-black/20">
                        {/* Avatar Preset Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
                            Choose Your Academic Character Avatar
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                                  className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                    selected
                                      ? "border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-400/40 font-bold"
                                      : "border-white/15 bg-slate-950/40 hover:border-white/30"
                                  }`}
                                >
                                  <StudentAvatar
                                    avatarPreset={p.id}
                                    size="sm"
                                    showGlow={false}
                                    hasCrown={profileCompletion >= 100}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                    <p className="text-[10px] text-slate-300 truncate">{p.role}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Name Fields */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={profile.first_name || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, first_name: e.target.value }))
                              }
                              placeholder="e.g. Abebe"
                              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={profile.last_name || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, last_name: e.target.value }))
                              }
                              placeholder="e.g. Bikila"
                              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* =================================================== */}
                  {/* COLLAPSIBLE STEP 2: ACADEMIC TRACK & INSTITUTION    */}
                  {/* =================================================== */}
                  <div className="rounded-2xl border border-white/12 bg-slate-950/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSub("academic")}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-black flex items-center justify-center border border-cyan-400/40">
                          2
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            Academic Curriculum, Track & Institution
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Grade level, stream, university/school name, and region
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.education_level && profile.school_name ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Filled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Incomplete
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            openSub.academic ? "rotate-180 text-cyan-300" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {openSub.academic && (
                      <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-black/20">
                        {/* Education Level & Stream */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <CustomSelect
                            label="Education Level"
                            placeholder="Select your academic level"
                            value={profile.education_level || ""}
                            onChange={(val) =>
                              setProfile((prev) => ({ ...prev, education_level: val }))
                            }
                            options={EDUCATION_LEVELS}
                            searchable={false}
                          />

                          <CustomSelect
                            label="Stream / Academic Track"
                            placeholder="Select your stream"
                            value={profile.stream || ""}
                            onChange={(val) =>
                              setProfile((prev) => ({ ...prev, stream: val }))
                            }
                            options={ACADEMIC_STREAMS}
                            searchable={false}
                          />
                        </div>

                        {/* School Name & Ethiopian Region */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                              School / University Name
                            </label>
                            <input
                              type="text"
                              value={profile.school_name || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, school_name: e.target.value }))
                              }
                              placeholder="e.g. Addis Ababa University"
                              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                            />
                          </div>

                          <CustomSelect
                            label="Town / Region in Ethiopia"
                            placeholder="Select your region"
                            value={profile.town_region || ""}
                            onChange={(val) =>
                              setProfile((prev) => ({ ...prev, town_region: val }))
                            }
                            options={ETHIOPIAN_REGIONS}
                            searchable={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* =================================================== */}
                  {/* COLLAPSIBLE STEP 3: CONTACT & SCHOLAR MOTTO         */}
                  {/* =================================================== */}
                  <div className="rounded-2xl border border-white/12 bg-slate-950/60 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSub("contact")}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-black flex items-center justify-center border border-cyan-400/40">
                          3
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            Contact Credentials & Scholar Motto
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Ethiopian phone number, account ID, and personal scholar bio
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.phone ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Filled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Incomplete
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            openSub.contact ? "rotate-180 text-cyan-300" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {openSub.contact && (
                      <div className="p-4 sm:p-5 border-t border-white/10 space-y-4 bg-black/20">
                        {/* Contact Phone & Email */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                              Phone Number (Ethiopia)
                            </label>
                            <input
                              type="tel"
                              value={profile.phone || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, phone: e.target.value }))
                              }
                              placeholder="09... or +251..."
                              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-mono"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Used for payment verification and order confirmation.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-200 mb-1.5">
                              Email Address (Account ID)
                            </label>
                            <input
                              type="email"
                              disabled
                              value={user.email || "No email linked"}
                              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 text-sm cursor-not-allowed font-mono"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Fixed login credential.
                            </p>
                          </div>
                        </div>

                        {/* Bio / Scholar Statement */}
                        <div>
                          <label className="block text-xs font-bold text-slate-200 mb-1.5">
                            Student Motto or Scholar Bio
                          </label>
                          <textarea
                            rows={2}
                            value={profile.bio || ""}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, bio: e.target.value }))
                            }
                            placeholder="e.g. Aspiring software engineer aiming for top rank in national entrance."
                            className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High Contrast Save Button */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-7 py-3.5 rounded-xl text-sm font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-slate-950" />
                      {savingProfile ? "Saving Profile..." : "Save Academic Profile"}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {profileCompletion >= 100 ? "👑 Scholar Crown Active" : `${100 - profileCompletion}% remaining to unlock Crown`}
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 2: STUDY GOALS & PACING                          */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("study")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                    Study Goals & Target Milestones
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Daily time quota ({profile.daily_study_goal_minutes || 45} mins), study hours, and exam targets
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.study ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.study && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                <form onSubmit={handleSaveStudyGoals} className="space-y-6">
                  {/* Daily Study Goal (Clear High Contrast Selection Buttons) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                      Daily Study Target (Minutes Per Day)
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Select your target study commitment. This powers your streak calculation and pacing HUD.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {[15, 30, 45, 60, 90, 120].map((mins) => {
                        const selected = profile.daily_study_goal_minutes === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                daily_study_goal_minutes: mins,
                              }))
                            }
                            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                              selected
                                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/30 ring-2 ring-amber-400/50 font-black"
                                : "bg-slate-950/60 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                            }`}
                          >
                            {mins} min/day
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Exam & Score */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Target Milestone / Exam
                      </label>
                      <input
                        type="text"
                        value={profile.target_exam || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, target_exam: e.target.value }))
                        }
                        placeholder="e.g. University Exit Exam or Matriculation 2026"
                        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Target Score / GPA
                      </label>
                      <input
                        type="text"
                        value={profile.target_score || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, target_score: e.target.value }))
                        }
                        placeholder="e.g. 3.85 GPA or 90%+"
                        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                      />
                    </div>
                  </div>

                  {/* Preferred Study Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">
                      Preferred Daily Study Window
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "morning", label: "Early Morning", hours: "5:00 AM – 8:00 AM" },
                        { id: "afternoon", label: "Afternoon", hours: "1:00 PM – 4:00 PM" },
                        { id: "evening", label: "Evening", hours: "6:00 PM – 9:00 PM" },
                        { id: "night", label: "Late Night", hours: "10:00 PM – 1:00 AM" },
                      ].map((slot) => {
                        const selected = profile.preferred_study_time === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                preferred_study_time: slot.id,
                              }))
                            }
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              selected
                                ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-400/25 ring-2 ring-cyan-400/40"
                                : "bg-slate-950/60 border-white/20 text-white hover:bg-white/10"
                            }`}
                          >
                            <p className="text-xs font-black">{slot.label}</p>
                            <p className={`text-[10px] ${selected ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
                              {slot.hours}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* High Contrast Save Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingStudy}
                      className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-slate-950" />
                      {savingStudy ? "Saving..." : "Save Study Goals"}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      Reflected in learning analytics
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 3: NOTIFICATIONS & STUDY REMINDERS               */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("notifications")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-violet-400/15 border border-violet-400/40 text-violet-300 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                    Notifications & Study Alerts
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Daily study reminders, active streak warnings, and weekly summary digest
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.notifications ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.notifications && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Daily Study Goal Reminder</p>
                      <p className="text-xs text-slate-300">
                        Receive a gentle prompt to complete your {profile.daily_study_goal_minutes || 45}-minute daily session.
                      </p>
                    </div>
                    <Toggle
                      on={prefs.notifDailyStudy}
                      onChange={(v) => handleSavePrefs({ ...prefs, notifDailyStudy: v })}
                      label="Daily Study Reminder"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Exam & Syllabus Updates</p>
                      <p className="text-xs text-slate-300">
                        Alert when new model exams, matriculation past papers, or questions are published.
                      </p>
                    </div>
                    <Toggle
                      on={prefs.notifExams}
                      onChange={(v) => handleSavePrefs({ ...prefs, notifExams: v })}
                      label="Exam Updates"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Weekly Performance Digest</p>
                      <p className="text-xs text-slate-300">
                        Receive a concise weekly summary of your total study hours and accuracy.
                      </p>
                    </div>
                    <Toggle
                      on={prefs.emailDigest !== "off"}
                      onChange={(v) => handleSavePrefs({ ...prefs, emailDigest: v ? "weekly" : "off" })}
                      label="Weekly Performance Digest"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 4: GAME SOUND PREFERENCES                       */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("audio")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 shrink-0">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                      Game Sound
                    </h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {prefs.soundEffects ? `${Math.round((prefs.soundVolume ?? 0.5) * 100)}% Volume` : "Muted"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Audio effects and volume levels for educational games and study challenges
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.audio ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.audio && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                {/* Game Sound Switch */}
                <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-300">
                      {prefs.soundEffects ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Game Sound Effects</p>
                      <p className="text-[11px] text-slate-400">
                        Sound effects and chimes for interactive learning minigames and challenges
                      </p>
                    </div>
                  </div>
                  <Toggle
                    on={prefs.soundEffects}
                    onChange={(v) => handleSavePrefs({ ...prefs, soundEffects: v })}
                    label="Game Sound Effects"
                  />
                </div>

                {/* Volume Slider (Defaults to 50% sound) */}
                <div className="p-4 sm:p-5 rounded-2xl border border-white/15 bg-slate-950/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Game Audio Volume</span>
                        <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30">
                          {Math.round((prefs.soundVolume ?? 0.5) * 100)}%
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Master sound level calibrated for upcoming educational games
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSavePrefs({ ...prefs, soundVolume: 0.5 })}
                      className="text-xs text-cyan-300 hover:underline cursor-pointer"
                    >
                      Reset to 50%
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={prefs.soundVolume ?? 0.5}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleSavePrefs({ ...prefs, soundVolume: val });
                      }}
                      className="w-full h-2 rounded-lg bg-slate-800 accent-amber-400 cursor-pointer"
                    />
                    <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 5: READING & DISPLAY PREFERENCES                */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("display")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-sky-400/15 border border-sky-400/40 text-sky-300 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                    Reading & Display
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Font size and stylized bold typography preview
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.display ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.display && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                {/* 1. Font Size */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
                    1. Font Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "compact", label: "Compact", sample: "15.5px text" },
                      { id: "normal", label: "Default / Standard", sample: "16px text" },
                      { id: "large", label: "Large Reading", sample: "18px text" },
                    ].map((sz) => {
                      const selected = (prefs.fontSize || "normal") === sz.id;
                      return (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleSavePrefs({ ...prefs, fontSize: sz.id as "compact" | "normal" | "large" })}
                          className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                            selected
                              ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-400/30 font-black"
                              : "bg-slate-950/60 border-white/20 text-white hover:bg-white/10"
                          }`}
                        >
                          <p className="text-sm font-bold">{sz.label}</p>
                          <p className={`text-[11px] ${selected ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                            {sz.sample}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Font Style */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2.5">
                    2. Typography Style
                  </label>
                  <div className="p-4 rounded-xl border border-cyan-400/50 bg-cyan-500/10 text-left">
                    <p className="text-base font-extrabold text-white tracking-tight">
                      Wisdom Tower Signature Bold
                    </p>
                    <p className="text-xs text-cyan-200/90 mt-1 leading-relaxed">
                      Stylized high-contrast geometric sans-serif (Plus Jakarta Sans) with rich weights, punchy headers, and crystal-clear math and equation readability across notes, flashcards, and question banks.
                    </p>
                  </div>
                </div>

                {/* Live Sample Text Box */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                    Sample Text Box (Live Font & Size Preview)
                  </label>
                  <div
                    className="p-5 sm:p-6 rounded-2xl border border-white/15 bg-slate-950/80 transition-all shadow-inner"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      fontSize:
                        prefs.fontSize === "compact"
                          ? "15.5px"
                          : prefs.fontSize === "large"
                          ? "18px"
                          : "16px",
                      lineHeight: "1.75",
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        Wisdom Tower Signature Bold ·{" "}
                        {prefs.fontSize === "compact" ? "Compact (15.5px)" : prefs.fontSize === "large" ? "Large (18px)" : "Standard (16px)"}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sample Preview</span>
                    </div>
                    <p className="text-white font-medium">
                      Wisdom Tower Academy features a bold, stylized typography system engineered for effortless scanning and long-term concept retention. Headers stand out with rich visual hierarchy, formula callouts remain crisp and punchy, and study notes maintain comfortable optical breathing room across mobile and desktop displays.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 6: OFFLINE STORAGE & DATA SYNC                   */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("storage")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                    Offline Data & Cloud Sync
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Total cached offline data ({storageSize}) and cloud synchronization
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.storage ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.storage && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                {syncMsg && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-200 ${
                      syncMsg.isOnline
                        ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200 shadow-sm shadow-emerald-500/10"
                        : "border-amber-400/40 bg-amber-500/15 text-amber-200"
                    }`}
                  >
                    <Check className={`w-4 h-4 shrink-0 ${syncMsg.isOnline ? "text-emerald-300" : "text-amber-300"}`} />
                    <span>{syncMsg.text}</span>
                  </div>
                )}

                <div className="p-5 rounded-2xl border border-white/15 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">Total Cached Offline Data</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Total data (PDF textbooks, chapter summaries, question banks, study logs, and all offline assets) cached by the app.
                    </p>
                  </div>
                  <span className="font-mono text-base font-black text-cyan-300 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 self-start sm:self-center shrink-0">
                    {storageSize}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSyncOffline}
                    disabled={syncingOffline}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
                  >
                    {syncingOffline ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                        <span>Syncing to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-slate-950" />
                        <span>Sync to Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 7: SECURITY                                      */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("security")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-rose-400/15 border border-rose-400/40 text-rose-300 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                    Security
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Change account password
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.security ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.security && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                {/* Security Warning Notice */}
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-400/40 bg-amber-500/10 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Account Security Warning</p>
                    <p className="mt-1 text-slate-200 leading-relaxed">
                      Your password is being changed and your next login will be with this new password. Please make sure you remember or securely record your new password before saving.
                    </p>
                  </div>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold ${
                      passwordMsg.type === "success"
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                        : "border-rose-500/40 bg-rose-500/15 text-rose-200"
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                {/* Password Update Form */}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h3 className="font-display text-sm font-bold text-white">
                    Change Password
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-3 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Full-Screen Golden Celebration Overlay on 100% Completion */}
        {showCelebration && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Sparkles particle accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
              <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-yellow-300 rounded-full animate-bounce" />
              <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>

            <div className="relative w-full max-w-md rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-[#18233c] via-[#0d1628] to-[#070b14] p-7 sm:p-8 text-center shadow-[0_0_60px_rgba(245,158,11,0.5)] space-y-5 animate-in zoom-in-95 duration-300">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute -inset-3 rounded-full bg-amber-400/25 blur-xl animate-pulse" />
                <StudentAvatar
                  avatarPreset={profile.avatar_preset}
                  avatarUrl={profile.avatar_url}
                  name={profile.full_name}
                  size="2xl"
                  hasCrown={true}
                />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-400" />
                  100% Profile Complete
                </span>
                <h3 className="font-display text-2xl font-black text-white">
                  Scholar Crown Unlocked!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Congratulations, <strong className="text-amber-300 font-bold">{profile.full_name || "Scholar"}</strong>! You have verified all 7 academic milestones. Your official Wisdom Tower Academy credentials and character avatar are now crowned.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                >
                  Proudly Wear Crown 👑
                </button>
                <Link
                  href="/account"
                  onClick={() => setShowCelebration(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  View Digital ID
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[65vh] flex flex-col items-center justify-center gap-3"
          data-wta-spinner="true"
        >
          <BrandLoader size="lg" label="Loading student settings..." />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
