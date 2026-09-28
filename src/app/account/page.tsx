"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile, getFullProfile, type UserProfileRecord } from "@/lib/profile";
import { computeStudentId, persistStudentIdIfNeeded, type StudentIdData } from "@/lib/student-id";
import StudentIdCard from "@/components/StudentIdCard";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import BrandLoader from "@/components/BrandLoader";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
  Copy,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings2,
  FileDown,
  Check,
  Clock,
  Gauge,
  Target,
  Award,
  Sparkles,
  ShieldCheck,
  Download,
} from "lucide-react";
import {
  computeStudentAnalytics,
  type StudentAnalyticsResult,
} from "@/lib/student-knowledge-base";
import {
  generateWeeklyReportPdf,
  downloadOrShareWeeklyReportPdf,
} from "@/lib/pdf-report-generator";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
}

function statusStyle(status: string) {
  const s = (status || "new").toLowerCase();
  if (s === "replied" || s === "closed" || s === "approved") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (s === "read" || s === "reviewing") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  return "bg-cyan-500/15 text-cyan-300 border-cyan-400/30";
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab] = useState<"analytics" | "requests">("analytics");
  const [copiedFolio, setCopiedFolio] = useState(false);

  // Raw progress records for real PDF and metrics computation
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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/account");
        return;
      }
      await ensureProfile(session.user);
      const full = await getFullProfile(session.user.id);

      // Auto-assign and persist student ID if not yet assigned
      if (session.user.id && !full?.student_id_number) {
        const assigned = await persistStudentIdIfNeeded(session.user.id, full?.student_id_number);
        if (full) full.student_id_number = assigned;
      }

      setUser(session.user);
      setProfile(full);
      setLoading(false);
    });
  }, [router]);

  const loadUserData = useCallback(async () => {
    if (!user?.email || !user?.id) return;
    setDataLoading(true);
    try {
      const [inqRes, myOrders, progRes] = await Promise.all([
        supabase
          .from("inquiries")
          .select("*")
          .eq("email", user.email)
          .order("created_at", { ascending: false }),
        listMyOrders(),
        supabase
          .from("learning_progress")
          .select("resource_id, progress_pct, total_seconds, focus_seconds, last_opened_at, meta")
          .eq("user_id", user.id),
      ]);

      setInquiries((inqRes.data as Inquiry[]) || []);
      setOrders(myOrders);
      if (progRes.data) {
        setRawProgress(progRes.data);
      }
    } catch {
      setInquiries([]);
    }
    setDataLoading(false);
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (user) loadUserData();
  }, [user, loadUserData]);

  const displayName = useMemo(() => {
    return (
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Student Scholar"
    );
  }, [profile, user]);

  const idData: StudentIdData = useMemo(() => {
    return computeStudentId(profile, user?.created_at);
  }, [profile, user?.created_at]);

  // Real live student analytics computed from actual learning_progress
  const studentAnalytics: StudentAnalyticsResult = useMemo(() => {
    return computeStudentAnalytics(
      rawProgress,
      displayName,
      profile?.education_level || "freshman",
      profile?.stream || null,
      user?.created_at,
      orders.map((o) => o.packageId).filter(Boolean) as string[]
    );
  }, [rawProgress, displayName, profile?.education_level, profile?.stream, user?.created_at, orders]);

  const handleCopyFolio = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(idData.folioNumber);
      setCopiedFolio(true);
      setTimeout(() => setCopiedFolio(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const handleDownloadWeeklyReport = async () => {
    if (!user) return;
    setGeneratingPdf(true);
    setPdfSuccessMsg(null);
    try {
      const res = await downloadOrShareWeeklyReportPdf({
        analytics: studentAnalytics,
        profile: profile || undefined,
        userEmail: user.email,
        referenceId: idData.folioNumber || `WTA-${user.id.slice(0, 6).toUpperCase()}-2026`,
      });
      setPdfSuccessMsg(res.message || "Weekly Report (Color PDF) downloaded successfully!");
      setTimeout(() => setPdfSuccessMsg(null), 5000);
    } catch (err) {
      console.error("[Account] PDF generation error:", err);
      try {
        const doc = generateWeeklyReportPdf({
          analytics: studentAnalytics,
          profile: profile || undefined,
          userEmail: user.email,
          referenceId: idData.folioNumber || `WTA-${user.id.slice(0, 6).toUpperCase()}-2026`,
        });
        const fileName = `WTA-Weekly-Report-${studentAnalytics.studentName.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);
        setPdfSuccessMsg("Weekly Report (Color PDF) downloaded successfully!");
        setTimeout(() => setPdfSuccessMsg(null), 5000);
      } catch (saveErr) {
        alert("Failed to generate PDF report. Please try again.");
      }
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-[65vh] flex flex-col items-center justify-center gap-3"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading student command center..." />
      </div>
    );
  }

  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="py-6 sm:py-10 md:py-14 min-h-[85vh] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================= */}
        {/* TOP HERO: OFFICIAL DIGITAL STUDENT ID & TOOLBAR            */}
        {/* ========================================================= */}
        <section className="flex flex-col items-center gap-5">
          {/* Centered Digital Student ID Card */}
          <div className="w-full max-w-md mx-auto">
            <StudentIdCard
              idData={idData}
              studentName={displayName}
              avatarPreset={profile?.avatar_preset}
              avatarUrl={profile?.avatar_url}
              educationLevel={profile?.education_level}
              stream={profile?.stream}
              schoolName={profile?.school_name}
              region={profile?.town_region}
            />
          </div>

          {/* Clean Student Toolbar */}
          <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-wisdom-card p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-wisdom-muted font-mono">
                Folio: <strong className="text-white">{idData.folioNumber}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyFolio}
                className="text-wisdom-muted hover:text-cyan-300 transition-colors p-1"
                title="Copy Student Folio"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedFolio && (
                <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/learning"
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Learning Hub
              </Link>

              <Link
                href="/settings"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-300" />
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                Log Out
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-400/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAB NAVIGATION STRIP (2 Clean Tabs)                        */}
        {/* ========================================================= */}
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-1">
          {[
            {
              id: "analytics" as const,
              label: "Academic Analytics & Progress",
              icon: LayoutDashboard,
            },
            {
              id: "requests" as const,
              label: `Inquiries & Support (Need Help?) ${inquiries.length > 0 ? `(${inquiries.length})` : ""}`,
              icon: Inbox,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "border-cyan-400 text-cyan-300 bg-cyan-500/[0.04]"
                    : "border-transparent text-wisdom-muted hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-cyan-300" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB PANES                                                 */}
        {/* ========================================================= */}

        {/* 1. DEDICATED STUDENT PROGRESS TRACKER & ANALYTICS */}
        {tab === "analytics" && (
          <StudentAnalyticsDashboard
            userId={user.id}
            studentName={displayName}
            educationLevel={profile?.education_level}
            stream={profile?.stream}
            userCreatedAt={user?.created_at}
            dailyGoalMinutes={profile?.daily_study_goal_minutes || 45}
            enrolledPackageIds={orders.map((o) => o.packageId).filter(Boolean) as string[]}
          />
        )}

        {/* 4. INQUIRIES & SUPPORT */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs sm:text-sm text-wisdom-muted">
                Your submitted messages, service requests, and inquiry replies.
              </p>
              <Link href="/contact" className="btn-secondary text-xs px-3 py-1.5 border-white/15">
                New message →
              </Link>
            </div>

            {dataLoading ? (
              <p className="text-center text-xs text-wisdom-muted py-10">Loading requests...</p>
            ) : inquiries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <Inbox className="w-12 h-12 text-wisdom-muted mx-auto mb-3 opacity-40" />
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  No inquiries or service requests
                </h3>
                <p className="text-xs sm:text-sm text-wisdom-muted mb-6 max-w-md mx-auto">
                  Have a question about a course, syllabus, or payment? Our academic team is here to help.
                </p>
                <Link href="/contact" className="btn-primary text-xs px-6 py-3">
                  Submit Inquiry
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-white/10 bg-wisdom-card space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-white text-sm">
                        {q.service || "General Inquiry"}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyle(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {q.message}
                    </p>
                    <p className="text-[10px] text-wisdom-muted font-mono">
                      {new Date(q.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM: OFFICIAL WEEKLY PERFORMANCE REPORT (COLOR PDF)    */}
        {/* ========================================================= */}
        <section
          id="weekly-report"
          className="rounded-3xl border border-amber-400/35 bg-gradient-to-br from-[#070e1c] via-[#0d1b32] to-[#070e1c] p-6 sm:p-8 md:p-10 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Subtle gold/cyan ambient glow */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/35 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Official Weekly Performance Report
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-cyan-300 border border-cyan-400/35">
                  <ShieldCheck className="w-3 h-3 text-cyan-300" />
                  1-Page A4 Color PDF
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                Executive Scholar Diagnostic Report
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Generate and download an official single-page A4 publication-grade color PDF. Includes verified study hours, reading velocity (WPM), question drill retention, active streak, academic standing tier, habit directives, and tailored study recommendations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDownloadWeeklyReport}
                disabled={generatingPdf}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <FileDown className={`w-4 h-4 text-slate-950 ${generatingPdf ? "animate-bounce" : ""}`} />
                {generatingPdf ? "Generating Color PDF..." : "Download Weekly Report"}
              </button>

              <span className="text-[11px] text-wisdom-muted font-mono">
                Folio: <strong className="text-white">{idData.folioNumber}</strong>
              </span>
            </div>
          </div>

          {/* Success Notification */}
          {pdfSuccessMsg && (
            <div className="p-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pdfSuccessMsg}</span>
              </div>
              <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-mono">
                Saved to Downloads
              </span>
            </div>
          )}

          {/* Live Telemetry Summary Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
            <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Logged Hours</span>
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-cyan-300 font-display">
                {studentAnalytics.totalStudyHours.toFixed(1)}h
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {studentAnalytics.studyTimeAnalysis.weeklyProgressPct}% of weekly quota
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Reading Velocity</span>
                <Gauge className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-300 font-display">
                {studentAnalytics.readingSpeedWpm} <span className="text-xs font-normal text-slate-300">WPM</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {studentAnalytics.readingAnalysis.method}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Drill Accuracy</span>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">
                {studentAnalytics.questionAccuracyPct}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {studentAnalytics.retentionAnalysis.rating}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Standing Tier</span>
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              </div>
              <p className="text-lg sm:text-xl font-black text-violet-300 font-display truncate">
                {studentAnalytics.masteryTier.replace(" Rank", "")}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {studentAnalytics.currentStreakDays}-day streak active
              </p>
            </div>
          </div>

          {/* Footer Accreditation Notice */}
          <div className="pt-3 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Auto-generated from verified curriculum progress & Ethiopian competency benchmarks
            </span>
            <span className="font-mono text-slate-500">
              Template: Single-page executive PDF
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
