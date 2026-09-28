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
import { generateWeeklyReportPdf } from "@/lib/pdf-report-generator";
import type { User } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Database,
  Download,
  FileDown,
  HardDrive,
  Key,
  Lock,
  LogOut,
  Moon,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Target,
  User as UserIcon,
  Volume2,
  Zap,
} from "lucide-react";

type SettingsSection =
  | "profile"
  | "report"
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
  { id: "report", label: "Weekly Report", icon: FileDown, badge: "Color PDF", desc: "Download performance PDF" },
  { id: "app", label: "App & Display", icon: Smartphone, desc: "AMOLED, text scale & data" },
  { id: "study", label: "Study & Goals", icon: Target, desc: "Daily goals & time targets" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Study alerts & digest" },
  { id: "storage", label: "Offline Storage", icon: HardDrive, desc: "Sync, cache & local data" },
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

  // Preferences State
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

  // Real Progress data for Weekly Color PDF Report
  const [progressRecords, setProgressRecords] = useState<
    {
      resource_id: string;
      progress_pct: number;
      total_seconds: number;
      focus_seconds: number;
      last_opened_at: string | null;
      meta: Record<string, unknown>;
    }[]
  >([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);

  // Load user session & progress records
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/settings");
        return;
      }

      await ensureProfile(session.user);
      const full = await getFullProfile(session.user.id);

      // Fetch progress records for student analytics
      let progData: typeof progressRecords = [];
      try {
        const { data: pData } = await supabase
          .from("learning_progress")
          .select("resource_id, progress_pct, total_seconds, focus_seconds, last_opened_at, meta")
          .eq("user_id", session.user.id);
        if (pData) progData = pData;
      } catch (err) {
        console.warn("[Settings] Learning progress fetch notice:", err);
      }

      if (!cancelled) {
        setUser(session.user);
        setProgressRecords(progData);
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

  // Compute student analytics for the Weekly Color PDF
  const studentAnalytics: StudentAnalyticsResult = useMemo(() => {
    const studentName =
      profile.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Scholar";

    return computeStudentAnalytics(
      progressRecords,
      studentName,
      profile.education_level,
      profile.stream,
      user?.created_at,
      []
    );
  }, [progressRecords, profile, user]);

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

  // Download Weekly Report (Color PDF)
  const handleDownloadWeeklyReport = () => {
    if (!user) return;
    setGeneratingPdf(true);
    setPdfSuccessMsg(null);

    try {
      const refId = `WTA-${user.id.slice(0, 6).toUpperCase()}-2026`;
      const doc = generateWeeklyReportPdf({
        analytics: studentAnalytics,
        profile,
        userEmail: user.email,
        referenceId: refId,
      });

      const fileName = `WTA-Weekly-Report-${studentAnalytics.studentName.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      setPdfSuccessMsg("Weekly Report (Color PDF) downloaded successfully!");
      setTimeout(() => setPdfSuccessMsg(null), 5000);
    } catch (err) {
      console.error("[Settings] PDF generation error:", err);
      alert("Could not generate PDF report. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
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

  // Clear Offline Storage - NO clear cache icon
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
      studentAnalytics: {
        masteryTier: studentAnalytics.masteryTier,
        totalStudyHours: studentAnalytics.totalStudyHours,
        readingSpeedWpm: studentAnalytics.readingSpeedWpm,
        readingMethod: studentAnalytics.readingAnalysis.method,
        retentionRating: studentAnalytics.retentionAnalysis.rating,
        accuracyPct: studentAnalytics.retentionAnalysis.accuracyPct,
      },
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
      <div
        className="min-h-[65vh] flex flex-col items-center justify-center gap-3"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading your academic settings..." />
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

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}

            {/* Direct Download Weekly Report Button in Header */}
            <button
              type="button"
              onClick={handleDownloadWeeklyReport}
              disabled={generatingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-cyan-400/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 hover:border-cyan-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Download your concise weekly performance dashboard in high-contrast color PDF"
            >
              <FileDown className={`w-3.5 h-3.5 ${generatingPdf ? "animate-bounce" : ""}`} />
              {generatingPdf ? "Generating..." : "Download Weekly Report"}
            </button>

            <Link
              href="/account"
              className="btn-secondary text-xs sm:text-sm px-3.5 py-2 border-white/15"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Account
            </Link>
          </div>
        </div>

        {/* PDF Download Flash Success Toast */}
        {pdfSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pdfSuccessMsg}</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 uppercase tracking-wider font-mono">
              Ready in Downloads
            </span>
          </div>
        )}

        {/* Layout Grid: Clean non-swiping cards on mobile, vertical sidebar on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Navigation Cards: NO horizontal swipe on mobile, clean responsive grid that fits mobile view */}
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={`flex flex-col lg:flex-row items-start lg:items-center gap-2.5 lg:gap-3 rounded-2xl p-3.5 lg:px-4 lg:py-3 text-left transition-all cursor-pointer ${
                    active
                      ? "bg-cyan-500/15 border border-cyan-400/40 text-white shadow-lg shadow-cyan-500/10 font-bold"
                      : "border border-white/8 bg-white/[0.02] text-wisdom-muted hover:bg-white/5 hover:text-white font-medium"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      active ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-wisdom-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                        {s.label}
                      </span>
                      {s.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
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

            {/* Sign Out Card */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 pt-2 lg:pt-4 lg:mt-2 lg:border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center lg:justify-start gap-2.5 p-3 lg:px-4 lg:py-2.5 rounded-2xl text-xs font-semibold border border-rose-500/25 bg-rose-500/5 text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors cursor-pointer"
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

                  {/* Education Level & Stream - CUSTOM SELECT (No default chrome picker) */}
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
                      label="Stream / Field of Study"
                      placeholder="Select your discipline stream"
                      value={profile.stream || ""}
                      onChange={(val) =>
                        setProfile((prev) => ({ ...prev, stream: val }))
                      }
                      options={ACADEMIC_STREAMS}
                      searchable={false}
                    />
                  </div>

                  {/* School/University & Region - CUSTOM SELECT (No default chrome picker) */}
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

                    <CustomSelect
                      label="Town / Region"
                      placeholder="Select Region"
                      value={profile.town_region || ""}
                      onChange={(val) =>
                        setProfile((prev) => ({ ...prev, town_region: val }))
                      }
                      options={ETHIOPIAN_REGIONS}
                      searchable={true}
                    />
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

            {/* 2. DEDICATED WEEKLY PERFORMANCE REPORT TAB (Color PDF) */}
            {section === "report" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-2">
                      <FileDown className="w-3 h-3" />
                      Executive Scholar Report
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                      Weekly Performance Report (Color PDF)
                    </h2>
                    <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                      Download a publication-grade, concise color PDF summary of your dashboard diagnostics.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadWeeklyReport}
                    disabled={generatingPdf}
                    className="btn-primary px-6 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer self-start sm:self-center"
                  >
                    <FileDown className={`w-4 h-4 ${generatingPdf ? "animate-bounce" : ""}`} />
                    {generatingPdf ? "Compiling Color PDF..." : "Download My Weekly Report"}
                  </button>
                </div>

                {/* Live Preview Card of the Report */}
                <div className="rounded-2xl border border-sky-500/30 bg-[#081224] p-5 sm:p-7 space-y-6">
                  {/* Banner Diagnosis */}
                  <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 space-y-1.5">
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                      According to your records and our system:
                    </p>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      Your logged study time is{" "}
                      <strong className="text-cyan-300">
                        {studentAnalytics.totalStudyHours.toFixed(1)} hours
                      </strong>{" "}
                      ({studentAnalytics.studyTimeAnalysis.weeklyProgressPct}% of your weekly milestone).
                      Your diagnosed reading speed is{" "}
                      <strong className="text-amber-300">
                        {studentAnalytics.readingAnalysis.speedWpm} WPM
                      </strong>{" "}
                      via{" "}
                      <strong className="text-white">
                        {studentAnalytics.readingAnalysis.method}
                      </strong>
                      , maintaining{" "}
                      <strong className="text-emerald-400">
                        {studentAnalytics.retentionAnalysis.accuracyPct}% accuracy
                      </strong>{" "}
                      ({studentAnalytics.retentionAnalysis.rating}).
                    </p>
                  </div>

                  {/* 4 HUD Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-1">
                        Weekly Study Time
                      </p>
                      <p className="text-lg font-black text-white">
                        {studentAnalytics.totalStudyHours.toFixed(1)} hrs
                      </p>
                      <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                        {studentAnalytics.studyTimeAnalysis.weeklyProgressPct}% of weekly target
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-1">
                        Reading Speed & Style
                      </p>
                      <p className="text-lg font-black text-amber-300">
                        {studentAnalytics.readingAnalysis.speedWpm} WPM
                      </p>
                      <p className="text-xs text-slate-300 truncate mt-0.5">
                        {studentAnalytics.readingAnalysis.method}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-1">
                        Retention & Accuracy
                      </p>
                      <p className="text-lg font-black text-emerald-400">
                        {studentAnalytics.retentionAnalysis.accuracyPct}%
                      </p>
                      <p className="text-xs text-slate-300 truncate mt-0.5">
                        {studentAnalytics.retentionAnalysis.rating}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-1">
                        Scholar Standing
                      </p>
                      <p className="text-sm font-black text-white truncate">
                        {studentAnalytics.masteryTier}
                      </p>
                      <p className="text-xs text-cyan-300 font-semibold mt-0.5">
                        {studentAnalytics.studyTimeAnalysis.paceStatus}
                      </p>
                    </div>
                  </div>

                  {/* Immediate Stop Signals Preview */}
                  <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.05] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
                        Immediately Stop Signals (Data-Driven Alerts)
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30">
                        Included in Color PDF
                      </span>
                    </div>

                    {studentAnalytics.immediatelyStopSignals.length === 0 ? (
                      <p className="text-xs text-slate-300">
                        No critical anomalies detected in your recent study blocks.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {studentAnalytics.immediatelyStopSignals.slice(0, 2).map((sig) => (
                          <div
                            key={sig.id}
                            className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 text-xs space-y-0.5"
                          >
                            <p className="font-bold text-rose-200">
                              STOP: {sig.signal}
                            </p>
                            <p className="text-wisdom-muted text-[11px]">
                              {sig.observedData} &rarr; <span className="text-slate-200">{sig.immediateAction}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Call to action */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-wisdom-muted border-t border-white/10">
                    <p>
                      Your color PDF report includes official Academy header insignia, curriculum breakdown, and verification stamp.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadWeeklyReport}
                      disabled={generatingPdf}
                      className="px-4 py-2.5 rounded-xl border border-cyan-400 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors self-start sm:self-auto shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Color PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. APP & WEBVIEW DISPLAY TAB */}
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

                <div className="space-y-4">
                  {/* AMOLED True-Black Mode */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-purple-400" />
                        <p className="text-sm font-bold text-white">AMOLED True-Black Mode</p>
                      </div>
                      <p className="text-xs text-wisdom-muted">
                        Sets background to pure black. Saves battery on OLED/AMOLED mobile screens.
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

                  {/* Font Size Scaling - Clean non-swiping card grid */}
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
                            <span className="block text-xs font-semibold">{item.label}</span>
                            <span className="text-[10px] text-wisdom-muted/70">{item.scale}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reading Font Family */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div>
                      <p className="text-sm font-bold text-white">Textbook Reading Font</p>
                      <p className="text-xs text-wisdom-muted">
                        Choose typography for long study notes and chapter summaries.
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
                            <span className="block text-xs font-semibold">{font.label}</span>
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

            {/* 4. STUDY TARGETS & GOALS TAB */}
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

                <div className="space-y-5">
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
                            <span className="block text-xs font-semibold">{slot.label}</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

            {/* 5. NOTIFICATIONS TAB */}
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

                  {/* Email Digest Frequency - CUSTOM SELECT (No default chrome picker) */}
                  <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Email Digest Frequency</p>
                      <p className="text-xs text-wisdom-muted">
                        Weekly summary of your completed reading time and questions attempted.
                      </p>
                    </div>
                    <div className="w-full sm:w-48">
                      <CustomSelect
                        value={prefs.emailDigest || "weekly"}
                        onChange={(val) =>
                          updatePref(
                            "emailDigest",
                            val as "off" | "daily" | "weekly"
                          )
                        }
                        options={[
                          { value: "off", label: "Off" },
                          { value: "daily", label: "Daily Digest" },
                          { value: "weekly", label: "Weekly Summary" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. OFFLINE STORAGE TAB */}
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

                <div className="space-y-4">
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

                  {/* Reset Cache - REMOVED clear cache icon */}
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
                        className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition-colors self-start sm:self-center cursor-pointer"
                      >
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

            {/* 7. SECURITY & DATA TAB */}
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

                <div className="space-y-5">
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
                        <p className="text-sm font-bold text-white">Export Academic Records (JSON)</p>
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
        <div
          className="min-h-[60vh] flex items-center justify-center"
          data-wta-spinner="true"
        >
          <BrandLoader size="md" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
