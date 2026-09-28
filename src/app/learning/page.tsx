"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Timer,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  FileText,
  BookmarkCheck,
  Zap,
  Target,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { listMyEnrollments, listMyOrders, type ManualOrder } from "@/lib/orders";
import { listMyAccessGrants } from "@/lib/access-grants";
import { getOwnedPackageIds } from "@/lib/ownership";
import { getPackage, type AcademyPackage, academyPackages } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import { getFullProfile, type UserProfileRecord } from "@/lib/profile";
import StudyPlanner from "@/components/learning/StudyPlanner";
import PomodoroTimer from "@/components/learning/PomodoroTimer";
import BrandLoader from "@/components/BrandLoader";

type UnlockedPackageCard = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  image: string;
  accent: string;
  hubs: { name: string; path: string; icon: string }[];
  enrolledAt?: string;
};

interface StudyGoalItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface AcademicResultRecord {
  id: string;
  title: string;
  scope_id: string;
  correct: number;
  total: number;
  percent: number;
  created_at: string;
}

const STORAGE_GOALS_KEY = "wt_student_daily_goals_v2";
const STORAGE_SCRATCHPAD_KEY = "wt_student_scratchpad_v2";

export default function LearningPage() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [unlocked, setUnlocked] = useState<UnlockedPackageCard[]>([]);
  const [pendingOrders, setPendingOrders] = useState<ManualOrder[]>([]);
  const [academicResults, setAcademicResults] = useState<AcademicResultRecord[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"tracks" | "planner" | "goals" | "scores">("tracks");
  const [trackCategoryFilter, setTrackCategoryFilter] = useState<string>("all");

  // Daily goals state
  const [goals, setGoals] = useState<StudyGoalItem[]>([]);
  const [newGoalText, setNewGoalText] = useState("");

  // Scratchpad state
  const [scratchpadText, setScratchpadText] = useState("");
  const [scratchpadSaved, setScratchpadSaved] = useState(false);

  // Initialize and load user data
  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    setLoggedIn(true);

    try {
      const [fullProfile, ownedIds, orders, enrolls, grants, resultsRes] = await Promise.all([
        getFullProfile(session.user.id),
        getOwnedPackageIds(true),
        listMyOrders(),
        listMyEnrollments(),
        listMyAccessGrants(),
        supabase
          .from("academic_results")
          .select("id, title, scope_id, correct, total, percent, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setProfile(fullProfile);

      if (resultsRes?.data) {
        setAcademicResults(resultsRes.data as AcademicResultRecord[]);
      }

      // Build cards for all owned / unlocked packages
      const list: UnlockedPackageCard[] = [];
      const seen = new Set<string>();

      // Loop through all known catalog packages that the user owns
      for (const p of academyPackages) {
        if (ownedIds.has(p.id) || ownedIds.has("all")) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);

          let cat = "Core Curriculum";
          let accent = "text-cyan-400";
          if (p.id === "freshman") {
            cat = "University Freshman";
            accent = "text-purple-400";
          } else if (p.id.startsWith("grade-")) {
            cat = "Secondary Education";
            accent = "text-sky-400";
          } else if (p.id.startsWith("ece-")) {
            cat = "Engineering Department Track";
            accent = "text-violet-400";
          } else if (p.id === "uat" || p.id === "gat") {
            cat = "University Entrance";
            accent = "text-emerald-400";
          } else if (p.id === "coc" || p.id === "exit-exam") {
            cat = "Graduation & Assessment";
            accent = "text-amber-400";
          } else if (p.id === "remedial") {
            cat = "Catch-Up Program";
            accent = "text-orange-400";
          }

          list.push({
            id: p.id,
            title: p.name,
            subtitle: p.shortName,
            category: cat,
            href: p.href,
            image: p.image,
            accent,
            hubs: [
              { name: "Books", path: `${p.href}/books`, icon: "book" },
              { name: "Short Notes", path: `${p.href}/short-notes`, icon: "file" },
              { name: "Flashcards", path: `${p.href}/flashcards`, icon: "layers" },
              { name: "Question Banks", path: `${p.href}/question-banks`, icon: "help" },
              { name: "Model Exams", path: `${p.href}/exams`, icon: "award" },
            ],
          });
        }
      }

      // Also check if any enrolled packages weren't in standard catalog list
      for (const e of enrolls || []) {
        if (!seen.has(e.packageId)) {
          seen.add(e.packageId);
          const resolved = getPackageResolved(e.packageId);
          list.push({
            id: e.packageId,
            title: resolved?.name || e.packageName || e.packageId,
            subtitle: resolved?.shortName || "Enrolled Track",
            category: "Special Enrollment",
            href: resolved?.href || "/academy",
            image: resolved?.image || "/images/brand/logo.png",
            accent: "text-amber-400",
            hubs: [
              { name: "Short Notes", path: `${resolved?.href || "/academy"}/short-notes`, icon: "file" },
              { name: "Question Banks", path: `${resolved?.href || "/academy"}/question-banks`, icon: "help" },
              { name: "Model Exams", path: `${resolved?.href || "/academy"}/exams`, icon: "award" },
            ],
            enrolledAt: e.createdAt,
          });
        }
      }

      setUnlocked(list);

      // Pending payments
      const pend = (orders || []).filter(
        (o) => o.status === "pending_verification" || o.status === "pending_payment"
      );
      setPendingOrders(pend);
    } catch (e) {
      console.warn("[learning/loadData]", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Load localStorage goals & scratchpad
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedGoals = localStorage.getItem(STORAGE_GOALS_KEY);
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        // Sensible default starter checklist
        setGoals([
          { id: "g1", text: "Read Chapter 1 Short Notes summary", completed: false, createdAt: new Date().toISOString() },
          { id: "g2", text: "Solve 20 practice questions in Question Bank", completed: false, createdAt: new Date().toISOString() },
          { id: "g3", text: "Review active recall Flashcards for 15 minutes", completed: false, createdAt: new Date().toISOString() },
        ]);
      }

      const savedScratchpad = localStorage.getItem(STORAGE_SCRATCHPAD_KEY);
      if (savedScratchpad) {
        setScratchpadText(savedScratchpad);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save goals
  const persistGoals = (next: StudyGoalItem[]) => {
    setGoals(next);
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const item: StudyGoalItem = {
      id: `goal-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    persistGoals([...goals, item]);
    setNewGoalText("");
  };

  const toggleGoal = (id: string) => {
    const next = goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
    persistGoals(next);
  };

  const deleteGoal = (id: string) => {
    persistGoals(goals.filter((g) => g.id !== id));
  };

  const clearCompletedGoals = () => {
    persistGoals(goals.filter((g) => !g.completed));
  };

  // Save scratchpad
  const handleScratchpadChange = (val: string) => {
    setScratchpadText(val);
    setScratchpadSaved(false);
    try {
      localStorage.setItem(STORAGE_SCRATCHPAD_KEY, val);
      setScratchpadSaved(true);
      setTimeout(() => setScratchpadSaved(false), 2000);
    } catch {
      /* ignore */
    }
  };

  // Filtered tracks
  const filteredUnlocked = useMemo(() => {
    if (trackCategoryFilter === "all") return unlocked;
    return unlocked.filter((t) => t.category.toLowerCase().includes(trackCategoryFilter.toLowerCase()));
  }, [unlocked, trackCategoryFilter]);

  // Goals statistics
  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const goalProgressPct = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  // Academic accuracy calculation
  const totalQuestionsAnswered = academicResults.reduce((s, r) => s + (r.total || 0), 0);
  const totalCorrectAnswered = academicResults.reduce((s, r) => s + (r.correct || 0), 0);
  const overallAccuracyPct =
    totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswered / totalQuestionsAnswered) * 100) : 0;

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Student Scholar";

  return (
    <div className="relative min-h-[85vh] py-8 sm:py-12 md:py-16">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-10 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================= */}
        {/* HEADER: STUDENT ACADEMIC COMMAND BAR                      */}
        {/* ========================================================= */}
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-wisdom-card via-wisdom-navy/95 to-wisdom-dark p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Personal Study Workspace
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                  <ShieldCheck className="w-3 h-3" />
                  Offline Cache Ready
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-amber-300 via-cyan-300 to-sky-200 bg-clip-text text-transparent">
                  {displayName}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs sm:text-sm text-wisdom-muted">
                {profile?.student_id_number && (
                  <span className="font-mono font-bold text-cyan-300">
                    ID: {profile.student_id_number}
                  </span>
                )}
                {profile?.stream && (
                  <span>
                    Stream: <strong className="text-white/90">{profile.stream}</strong>
                  </span>
                )}
                {profile?.school_name && (
                  <span>
                    School: <strong className="text-white/90">{profile.school_name}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-wisdom-dark/50 px-4 py-2.5 text-center">
                <span className="text-xs text-wisdom-muted block">Unlocked Tracks</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-300 tabular-nums">
                  {unlocked.length}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-wisdom-dark/50 px-4 py-2.5 text-center">
                <span className="text-xs text-wisdom-muted block">Today&apos;s Goals</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
                  {completedGoalsCount}/{goals.length}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Not Logged In Notice */}
        {!loggedIn && !loading && (
          <div className="rounded-3xl border border-amber-400/30 bg-wisdom-card p-8 sm:p-10 text-center shadow-xl">
            <GraduationCap className="w-12 h-12 text-amber-300/80 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Sign in to sync your study desk</h2>
            <p className="text-sm text-wisdom-muted max-w-md mx-auto leading-relaxed mb-6">
              Sign in with your student account to access your unlocked curriculum tracks, save quiz scores, and track your daily preparation goals.
            </p>
            <Link href="/login?next=/learning" className="btn-primary px-8 py-3 text-sm">
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Pending Orders Alert Banner */}
        {pendingOrders.length > 0 && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 sm:p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <h3 className="font-bold text-white">Payment Verification in Progress</h3>
                <p className="text-amber-200/90 leading-relaxed text-xs sm:text-sm">
                  We received your transaction reference for{" "}
                  <strong>{pendingOrders.map((o) => o.packageName).join(", ")}</strong>. Our team verifies bank slips promptly — once approved, your new track appears below automatically.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {pendingOrders.map((o) => (
                    <span
                      key={o.id}
                      className="px-2.5 py-0.5 rounded-lg font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40"
                    >
                      Order #{o.id} ({o.paymentMethod || "Bank"})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* WORKSPACE NAVIGATION TABS                                */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("tracks")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "tracks"
                  ? "bg-cyan-500 text-wisdom-dark shadow-md shadow-cyan-500/20"
                  : "bg-wisdom-card/60 text-wisdom-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Curriculum Tracks ({unlocked.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("planner")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "planner"
                  ? "bg-cyan-500 text-wisdom-dark shadow-md shadow-cyan-500/20"
                  : "bg-wisdom-card/60 text-wisdom-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Focus & Timetable</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("goals")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "goals"
                  ? "bg-cyan-500 text-wisdom-dark shadow-md shadow-cyan-500/20"
                  : "bg-wisdom-card/60 text-wisdom-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Daily Goals & Notes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("scores")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "scores"
                  ? "bg-cyan-500 text-wisdom-dark shadow-md shadow-cyan-500/20"
                  : "bg-wisdom-card/60 text-wisdom-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Quiz Scores</span>
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl text-wisdom-muted hover:text-white hover:bg-white/5 transition-colors"
            title="Refresh learning state"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: MY CURRICULUM TRACKS (UNLOCKED STUDY HUBS)         */}
        {/* ========================================================= */}
        {activeTab === "tracks" && (
          <div className="space-y-6">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted mr-1">
                Filter:
              </span>
              {[
                { id: "all", label: "All Pathways" },
                { id: "freshman", label: "University Freshman" },
                { id: "secondary", label: "Secondary (Grades 9–12)" },
                { id: "engineering", label: "Engineering Tracks" },
                { id: "entrance", label: "Entrance & Graduation" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTrackCategoryFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    trackCategoryFilter === f.id
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-sm"
                      : "border-white/10 text-wisdom-muted hover:text-white hover:border-white/20"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <BrandLoader size="md" label="Loading unlocked study hubs..." />
              </div>
            ) : filteredUnlocked.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-wisdom-muted">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <h3 className="font-bold text-white text-lg mb-1">No unlocked tracks matching filter</h3>
                <p className="text-sm max-w-md mx-auto">
                  Try selecting &quot;All Pathways&quot; to view all your available study programs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredUnlocked.map((track) => (
                  <div
                    key={track.id}
                    className="rounded-3xl border border-white/10 bg-wisdom-card hover:border-cyan-400/40 p-5 sm:p-6 flex flex-col justify-between shadow-xl transition-all group"
                  >
                    <div>
                      {/* Top Header Row with Cover */}
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-cover bg-center shrink-0 border border-white/10 shadow-md group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundImage: `url(${track.image})` }}
                        />
                        <div className="min-w-0 flex-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${track.accent}`}>
                            {track.category}
                          </span>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-cyan-200 transition-colors leading-snug">
                            {track.title}
                          </h3>
                          <p className="text-xs text-wisdom-muted mt-1">{track.subtitle}</p>
                        </div>
                      </div>

                      {/* Direct Learning Hub Jump Chips */}
                      <div className="pt-3 border-t border-white/8 mb-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted mb-2.5">
                          Quick Study Hubs:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {track.hubs.map((hub) => (
                            <Link
                              key={hub.name}
                              href={hub.path}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/8 bg-white/[0.03] text-slate-300 hover:text-white hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors"
                            >
                              {hub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-2">
                      <Link
                        href={track.href}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-wisdom-dark hover:brightness-110 transition-all shadow-md shadow-cyan-500/20"
                      >
                        <span>Open Syllabus & Materials</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FOCUS TIMER & TIMETABLE PLANNER                    */}
        {/* ========================================================= */}
        {activeTab === "planner" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-wisdom-card/70 p-4 sm:p-6">
              <PomodoroTimer />
            </div>

            <div className="rounded-3xl border border-white/10 bg-wisdom-card/70 p-4 sm:p-6">
              <StudyPlanner />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DAILY STUDY GOALS & SCRATCHPAD (NEW FEATURE)        */}
        {/* ========================================================= */}
        {activeTab === "goals" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Daily Checklist */}
            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-wisdom-card p-5 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-400" />
                    Today&apos;s Academic Targets
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-0.5">
                    Plan chapters, questions, and revision tasks for today
                  </p>
                </div>
                {goals.some((g) => g.completed) && (
                  <button
                    type="button"
                    onClick={clearCompletedGoals}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Clear completed
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-wisdom-muted">Completion rate</span>
                  <span className="font-bold text-amber-300 tabular-nums">
                    {completedGoalsCount} of {goals.length} done ({goalProgressPct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${goalProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Add Goal Input */}
              <form onSubmit={addGoal} className="flex gap-2">
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="e.g. Finish Calculus Chapter 2 notes & quiz..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-wisdom-dark border border-white/10 text-sm text-white placeholder-wisdom-muted focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!newGoalText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark font-bold text-sm hover:bg-amber-400 disabled:opacity-50 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Goals List */}
              {goals.length === 0 ? (
                <div className="p-8 text-center text-wisdom-muted text-xs border border-dashed border-white/10 rounded-2xl">
                  No study targets added for today yet. Add one above!
                </div>
              ) : (
                <ul className="space-y-2">
                  {goals.map((g) => (
                    <li
                      key={g.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                        g.completed
                          ? "border-emerald-500/20 bg-emerald-500/5 opacity-75"
                          : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className="flex items-center gap-3 text-left min-w-0 flex-1"
                      >
                        {g.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-wisdom-muted shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            g.completed ? "line-through text-wisdom-muted" : "text-white font-medium"
                          }`}
                        >
                          {g.text}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGoal(g.id)}
                        className="text-wisdom-muted hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right Column: Student Formula & Scratchpad */}
            <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-wisdom-card p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-display text-lg font-bold text-white">Study Scratchpad</h3>
                </div>
                {scratchpadSaved && (
                  <span className="text-[11px] text-emerald-400 font-semibold animate-fade-in flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>

              <p className="text-xs text-wisdom-muted">
                Jot down formulas, exam dates, or chapter insights. Automatically saved in your browser.
              </p>

              <textarea
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                rows={12}
                placeholder="Write your study notes, formulas, or reminders here...
- Physics: F = ma, v = u + at
- Chemistry: PV = nRT
- Midterm Date: Nov 14"
                className="w-full p-4 rounded-2xl bg-wisdom-dark border border-white/10 text-sm font-mono text-slate-200 placeholder-wisdom-muted focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ACADEMIC ACCURACY & QUIZ SCORES                    */}
        {/* ========================================================= */}
        {activeTab === "scores" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
                  Overall Accuracy
                </span>
                <p className="text-3xl font-extrabold text-cyan-300 mt-1 tabular-nums">
                  {overallAccuracyPct}%
                </p>
                <p className="text-xs text-wisdom-muted mt-1">Across all question bank sessions</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
                  Questions Solved
                </span>
                <p className="text-3xl font-extrabold text-white mt-1 tabular-nums">
                  {totalQuestionsAnswered}
                </p>
                <p className="text-xs text-emerald-300 mt-1">
                  {totalCorrectAnswered} correct answers recorded
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
                  Tests & Mocks Taken
                </span>
                <p className="text-3xl font-extrabold text-amber-300 mt-1 tabular-nums">
                  {academicResults.length}
                </p>
                <p className="text-xs text-wisdom-muted mt-1">Recorded evaluation submissions</p>
              </div>
            </div>

            {/* Test History List */}
            <div className="rounded-3xl border border-white/10 bg-wisdom-card p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Recorded Test Results
                </h3>
                <Link
                  href="/academy/quiz-demo"
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                >
                  <span>Practice Quiz Demo</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {academicResults.length === 0 ? (
                <div className="p-8 text-center text-wisdom-muted text-sm border border-dashed border-white/10 rounded-2xl">
                  No recorded test results yet. When you take quizzes in any subject hub, your scores and percentages will automatically record here!
                </div>
              ) : (
                <div className="divide-y divide-white/6">
                  {academicResults.map((res) => (
                    <div
                      key={res.id}
                      className="py-3.5 flex items-center justify-between gap-4 text-sm hover:bg-white/[0.02]"
                    >
                      <div>
                        <p className="font-bold text-white">{res.title || res.scope_id}</p>
                        <p className="text-xs text-wisdom-muted mt-0.5">
                          {new Date(res.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-cyan-300 tabular-nums">
                          {res.percent}%
                        </span>
                        <span className="text-xs text-wisdom-muted block">
                          {res.correct}/{res.total} questions
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
