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
} from "lucide-react";

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
    report: initialTab === "report",
    display: initialTab === "app",
    storage: initialTab === "storage",
    security: initialTab === "security",
  });

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
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [storageSize, setStorageSize] = useState<string>("Calculating...");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);

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

  // Calculate Storage Size
  const calculateStorageSize = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      let total = 0;
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("wta_") || key.startsWith("supabase")) {
          const item = localStorage.getItem(key);
          if (item) total += item.length * 2; // UTF-16 bytes approx
        }
      }
      const kb = Math.round(total / 1024);
      if (kb > 1024) {
        setStorageSize(`${(kb / 1024).toFixed(1)} MB`);
      } else {
        setStorageSize(`${kb} KB`);
      }
    } catch {
      setStorageSize("120 KB");
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
        accuracyPct: studentAnalytics.questionAccuracyPct,
        streakDays: studentAnalytics.currentStreakDays,
      },
      rawProgressRecords: rawProgress,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WTA-Student-Data-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

            {/* High-Contrast Download Weekly Report Button in Header */}
            <button
              type="button"
              onClick={handleDownloadWeeklyReport}
              disabled={generatingPdf}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Download concise color performance report PDF"
            >
              <FileDown className={`w-4 h-4 text-slate-950 ${generatingPdf ? "animate-bounce" : ""}`} />
              {generatingPdf ? "Generating PDF..." : "Download Weekly Report"}
            </button>

            <Link
              href="/account"
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Account
            </Link>
          </div>
        </div>

        {/* PDF Download Toast */}
        {pdfSuccessMsg && (
          <div className="p-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{pdfSuccessMsg}</span>
            </div>
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-mono">
              Ready in Downloads
            </span>
          </div>
        )}

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
                <div className="p-3 rounded-2xl bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                      Academic Profile & Identity
                    </h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950">
                      {profileCompletion}% Complete
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    School, level, stream, student bio, and avatar character
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.profile ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {/* Profile Completion Bar */}
            <div className="px-5 sm:px-6 pb-2">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  style={{ width: `${profileCompletion}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300 rounded-full transition-all duration-700"
                />
              </div>
            </div>

            {/* In-Place Expanded Form */}
            {openSections.profile && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Preset Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
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
                            <StudentAvatar avatarPreset={p.id} size="sm" showGlow={false} />
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

                  {/* High Contrast Save Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-slate-950" />
                      {savingProfile ? "Saving Profile..." : "Save Academic Profile"}
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      Changes persist across all devices
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

                  <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Sound Effects on Correct Answers</p>
                      <p className="text-xs text-slate-300">
                        Subtle acoustic feedback during flashcard and question practice drills.
                      </p>
                    </div>
                    <Toggle
                      on={prefs.soundEffects}
                      onChange={(v) => handleSavePrefs({ ...prefs, soundEffects: v })}
                      label="Sound Effects"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 4: WEEKLY DIAGNOSTIC REPORT (Color PDF)          */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/15 bg-wisdom-card overflow-hidden shadow-xl transition-all">
            <button
              type="button"
              onClick={() => toggleSection("report")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 shrink-0">
                  <FileDown className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                      Weekly Performance Report (Color PDF)
                    </h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                      PDF Export
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Generate and download a high-contrast executive summary of your study metrics
                  </p>
                </div>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform duration-300 shrink-0 ml-3 ${
                  openSections.report ? "rotate-180 text-cyan-400" : ""
                }`}
              />
            </button>

            {openSections.report && (
              <div className="p-5 sm:p-7 border-t border-white/10 space-y-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl border border-white/15 bg-slate-950/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-white">
                        Executive Scholar Diagnostic Briefing
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Export an official, color-coded diagnostic PDF featuring your study volume, reading speed, retention accuracy, academic ranking tier, and immediate study habit alerts.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadWeeklyReport}
                      disabled={generatingPdf}
                      className="px-5 py-3 rounded-xl text-xs sm:text-sm font-black bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <FileDown className={`w-4 h-4 text-slate-950 ${generatingPdf ? "animate-bounce" : ""}`} />
                      {generatingPdf ? "Generating PDF..." : "Download Report (Color PDF)"}
                    </button>
                  </div>

                  {/* Summary of current telemetry that will appear on PDF */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Logged Hours</p>
                      <p className="text-lg font-black text-cyan-300 mt-0.5">
                        {studentAnalytics.totalStudyHours}h
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Reading Velocity</p>
                      <p className="text-lg font-black text-amber-300 mt-0.5">
                        {studentAnalytics.readingSpeedWpm} WPM
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Drill Accuracy</p>
                      <p className="text-lg font-black text-emerald-400 mt-0.5">
                        {studentAnalytics.questionAccuracyPct}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Active Streak</p>
                      <p className="text-lg font-black text-violet-300 mt-0.5">
                        {studentAnalytics.currentStreakDays} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 5: APP & DISPLAY PREFERENCES                    */}
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
                    App & Reading Display Preferences
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    AMOLED pure black mode, font size scaling, reading font, and low-data mode
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
                {/* Font Scaling Buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
                    Reading Font Scale
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "compact", label: "Compact", sample: "14px text" },
                      { id: "normal", label: "Standard", sample: "16px text" },
                      { id: "large", label: "Large Reading", sample: "18px text" },
                    ].map((sz) => {
                      const selected = prefs.fontSize === sz.id;
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

                {/* Display Toggles */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">AMOLED Pure Black Theme</p>
                      <p className="text-xs text-slate-300">
                        Maximizes battery life on mobile OLED screens during extended late-night study sessions.
                      </p>
                    </div>
                    <Toggle
                      on={prefs.amoledMode}
                      onChange={(v) => handleSavePrefs({ ...prefs, amoledMode: v })}
                      label="AMOLED Mode"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-white/15 bg-slate-950/60 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Low-Bandwidth Optimization</p>
                      <p className="text-xs text-slate-300">
                        Prioritizes lightweight text notes and reduces large image resolutions to conserve mobile data.
                      </p>
                    </div>
                    <Toggle
                      on={prefs.dataSaver}
                      onChange={(v) => handleSavePrefs({ ...prefs, dataSaver: v })}
                      label="Low Bandwidth Data Saver"
                    />
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
                    Offline Storage & Data Sync
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Cache status ({storageSize}), cloud sync, and offline storage management
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
                  <div className="p-4 rounded-xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-200 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span>{syncMsg}</span>
                  </div>
                )}

                <div className="p-5 rounded-2xl border border-white/15 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-white">Local Offline Storage Size</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Cached chapter notes, question sets, and offline sync logs on this device.
                    </p>
                  </div>
                  <span className="font-mono text-base font-black text-cyan-300 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 self-start sm:self-center">
                    {storageSize}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSyncOffline}
                    disabled={syncingOffline}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-slate-950 ${syncingOffline ? "animate-spin" : ""}`} />
                    {syncingOffline ? "Syncing..." : "Sync Offline Queue to Cloud"}
                  </button>

                  {/* Clean Clear Offline Cache Button - NO clear cache icon */}
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 hover:border-rose-400 hover:text-white transition-all cursor-pointer"
                  >
                    Clear Offline Cache
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 7: SECURITY & ACCOUNT DATA                      */}
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
                    Security, Credentials & Data Export
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">
                    Update password, export academic records JSON, and sign out
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
                {passwordMsg && (
                  <div
                    className={`p-4 rounded-xl border text-xs font-semibold ${
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
                    Update Account Password
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
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>

                {/* Data Export & Sign Out */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">
                      Export Complete Academic Archive
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Download a JSON file with all your study logs, accuracy scores, and account settings.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleExportData}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border border-white/25 bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
                    >
                      Export Data (JSON)
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 hover:border-rose-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
