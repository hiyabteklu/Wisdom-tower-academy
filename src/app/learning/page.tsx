"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Layers,
  FileText,
  Award,
  Timer,
  Calendar,
  CheckSquare,
  Folder,
  Plus,
  Trash2,
  Copy,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Settings2,
  X,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { packageImages } from "@/data/packages";
import PomodoroTimer from "@/components/learning/PomodoroTimer";
import StudyPlanner from "@/components/learning/StudyPlanner";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";

// Games commented out per request - code preserved in repository
// import TowerDefenseGame from "@/components/games/tower-defense/TowerDefenseGame";
// import TowerClimbApp from "@/components/games/tower-climb/TowerClimbApp";

// ── Types ───────────────────────────────────────────────────────
export interface NoteSheet {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  sheets: NoteSheet[];
}

export interface StudyGoalItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface AcademicResultItem {
  id: string;
  title: string;
  total: number;
  correct: number;
  missed: number;
  percent: number;
  created_at: string;
}

export type FeatureKey =
  | "timer"
  | "planner"
  | "goals"
  | "notes"
  | "analytics"
  | "courses";

const STORAGE_ENROLLED_COURSES = "wt_enrolled_courses_v2";
const STORAGE_NOTEBOOK_KEY = "wt_student_notebook_v5";
const STORAGE_GOALS_KEY = "wt_student_goals_v5";

// All available packages with verified official imagery and routes
const AVAILABLE_COURSES = [
  {
    id: "freshman",
    title: "Freshman University Courses",
    level: "Higher Education",
    path: "/academy/freshman",
    image: packageImages["freshman"],
    desc: "All 17 first-year university subjects with official textbooks, lecture notes & model exams.",
  },
  {
    id: "grade-12",
    title: "Grade 12 Package",
    level: "Secondary Matric",
    path: "/academy/grades/12",
    image: packageImages["grade-12"],
    desc: "National matriculation past papers, chapter question drills & timed exam simulations.",
  },
  {
    id: "grade-11",
    title: "Grade 11 Package",
    level: "Secondary Stream",
    path: "/academy/grades/11",
    image: packageImages["grade-11"],
    desc: "Natural & Social science textbooks, high-yield summaries & formula recall flashcards.",
  },
  {
    id: "uat",
    title: "AAU UAT Entrance Exam",
    level: "University Entrance",
    path: "/academy/uat",
    image: packageImages["uat"],
    desc: "Undergraduate Aptitude Test drills, quantitative reasoning & past exam solutions.",
  },
  {
    id: "grade-10",
    title: "Grade 10 Package",
    level: "Secondary Core",
    path: "/academy/grades/10",
    image: packageImages["grade-10"],
    desc: "Concept mastery, stream preparation drills & practice question banks.",
  },
  {
    id: "grade-9",
    title: "Grade 9 Package",
    level: "Secondary Foundation",
    path: "/academy/grades/9",
    image: packageImages["grade-9"],
    desc: "Core syllabus subjects, chapter-by-chapter summaries & foundation quizzes.",
  },
  {
    id: "remedial",
    title: "Remedial Program",
    level: "University Catch-Up",
    path: "/academy/remedial",
    image: packageImages["remedial"],
    desc: "Remedial program modules, revision quizzes & preparation drills.",
  },
  {
    id: "gat",
    title: "AAU GAT Graduate Aptitude",
    level: "Postgraduate",
    path: "/academy/gat",
    image: packageImages["gat"],
    desc: "Graduate Aptitude Test analytics, logical reasoning, and verbal drill questions.",
  },
];

function LearningContent() {
  const searchParams = useSearchParams();
  const initialFeature = (searchParams.get("tool") || searchParams.get("tab")) as FeatureKey | null;

  // Selected tool feature (null = Hub Cards Deck; string = Opened Tool View)
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(() => {
    const valid: FeatureKey[] = ["timer", "planner", "goals", "notes", "analytics", "courses"];
    return initialFeature && valid.includes(initialFeature) ? initialFeature : null;
  });

  // User details
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Scholar");
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("WTA-7749");
  const [streakDays, setStreakDays] = useState(1);

  // Enrolled courses state
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([
    "freshman",
    "grade-12",
    "uat",
  ]);
  const [showCourseManager, setShowCourseManager] = useState(false);

  // Daily goals state
  const [goals, setGoals] = useState<StudyGoalItem[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("high");

  // Notes state
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Results analytics state
  const [results, setResults] = useState<AcademicResultItem[]>([]);

  // 1. Initial Load: User Auth & LocalStorage
  useEffect(() => {
    // Auth profile
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setUserId(user.id);
        const nameMeta = user.user_metadata?.name || user.user_metadata?.full_name;
        if (nameMeta) setUserName(nameMeta);
        if (user.email) setUserEmail(user.email);
        const code = user.id.replace(/-/g, "").slice(0, 4).toUpperCase();
        setStudentId(`WTA-${code}`);
      }
    });

    // Enrolled courses
    try {
      const savedEnrolled = localStorage.getItem(STORAGE_ENROLLED_COURSES);
      if (savedEnrolled) {
        const parsed = JSON.parse(savedEnrolled);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnrolledCourseIds(parsed);
        }
      }
    } catch {
      /* ignore */
    }

    // Daily Goals
    try {
      const savedGoals = localStorage.getItem(STORAGE_GOALS_KEY);
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        if (Array.isArray(parsed)) setGoals(parsed);
      } else {
        const defaultGoals: StudyGoalItem[] = [
          { id: "g1", text: "Complete 15 Model Exam Questions", completed: true, priority: "high" },
          { id: "g2", text: "Review Freshman Physics Lecture Notes", completed: false, priority: "high" },
          { id: "g3", text: "Practice 10 Quantitative Aptitude Problems", completed: false, priority: "medium" },
        ];
        setGoals(defaultGoals);
        localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(defaultGoals));
      }
    } catch {
      /* ignore */
    }

    // Notebook
    try {
      const savedNotes = localStorage.getItem(STORAGE_NOTEBOOK_KEY);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolders(parsed);
          setSelectedFolderId(parsed[0].id);
          if (parsed[0].sheets?.length > 0) {
            setSelectedSheetId(parsed[0].sheets[0].id);
          }
        }
      } else {
        const defaultFolders: NoteFolder[] = [
          {
            id: "f-freshman",
            name: "Freshman Year",
            sheets: [
              {
                id: "s-math",
                title: "Applied Mathematics Formulas",
                content:
                  "Derivative shortcuts:\n- d/dx(x^n) = n*x^(n-1)\n- d/dx(sin x) = cos x\n- d/dx(e^x) = e^x\n\nIntegrals:\n- ∫ x^n dx = (x^(n+1))/(n+1) + C\n- ∫ 1/x dx = ln|x| + C",
                updatedAt: new Date().toISOString(),
              },
              {
                id: "s-phys",
                title: "General Physics Mechanics Summary",
                content:
                  "Newton's Laws:\n1. Inertia: An object remains at rest or constant velocity unless acted upon.\n2. F = ma (Force = Mass × Acceleration)\n3. Action & Reaction: Equal and opposite forces.",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          {
            id: "f-exams",
            name: "Entrance & Exit Notes",
            sheets: [
              {
                id: "s-uat",
                title: "UAT Aptitude Shortcuts",
                content:
                  "Percentage calculations:\n- 15% of X = (10% of X) + (half of 10% of X)\n- Speed = Distance / Time\n- Work = Rate × Time",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        ];
        setFolders(defaultFolders);
        setSelectedFolderId(defaultFolders[0].id);
        setSelectedSheetId(defaultFolders[0].sheets[0].id);
        localStorage.setItem(STORAGE_NOTEBOOK_KEY, JSON.stringify(defaultFolders));
      }
    } catch {
      /* ignore */
    }

    // Results history
    try {
      const savedResults = localStorage.getItem("wt_academic_results_v2");
      if (savedResults) {
        const parsed = JSON.parse(savedResults);
        if (Array.isArray(parsed)) setResults(parsed);
      }
    } catch {
      /* ignore */
    }

    // Streak tracker
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastVisit = localStorage.getItem("wt_last_study_date");
      const savedStreak = parseInt(localStorage.getItem("wt_study_streak") || "1", 10);
      if (lastVisit === todayStr) {
        setStreakDays(savedStreak);
      } else {
        const newStreak = savedStreak + 1;
        setStreakDays(newStreak);
        localStorage.setItem("wt_study_streak", String(newStreak));
        localStorage.setItem("wt_last_study_date", todayStr);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Course Enrollment Helpers
  const toggleCourseEnrollment = (courseId: string) => {
    let next: string[];
    if (enrolledCourseIds.includes(courseId)) {
      if (enrolledCourseIds.length <= 1) {
        return;
      }
      next = enrolledCourseIds.filter((id) => id !== courseId);
    } else {
      next = [...enrolledCourseIds, courseId];
    }
    setEnrolledCourseIds(next);
    try {
      localStorage.setItem(STORAGE_ENROLLED_COURSES, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Goals Helpers
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
      id: `g-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      priority: newGoalPriority,
    };
    persistGoals([item, ...goals]);
    setNewGoalText("");
  };

  const toggleGoal = (id: string) => {
    persistGoals(
      goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const deleteGoal = (id: string) => {
    persistGoals(goals.filter((g) => g.id !== id));
  };

  // Notebook Helpers
  const persistNotebook = (next: NoteFolder[]) => {
    setFolders(next);
    try {
      localStorage.setItem(STORAGE_NOTEBOOK_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || folders[0] || null;
  }, [folders, selectedFolderId]);

  const currentSheet = useMemo(() => {
    if (!currentFolder) return null;
    return (
      currentFolder.sheets.find((s) => s.id === selectedSheetId) ||
      currentFolder.sheets[0] ||
      null
    );
  }, [currentFolder, selectedSheetId]);

  const handleAddFolder = () => {
    const name = prompt("Enter folder title (e.g. Physics):");
    if (!name?.trim()) return;
    const newF: NoteFolder = {
      id: `f-${Date.now()}`,
      name: name.trim(),
      sheets: [
        {
          id: `s-${Date.now()}`,
          title: "New Sheet",
          content: "",
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    const next = [...folders, newF];
    persistNotebook(next);
    setSelectedFolderId(newF.id);
    setSelectedSheetId(newF.sheets[0].id);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folders.length <= 1) {
      alert("You must keep at least one notes folder.");
      return;
    }
    if (!confirm("Delete this folder and all its sheets?")) return;
    const next = folders.filter((f) => f.id !== folderId);
    persistNotebook(next);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(next[0].id);
      setSelectedSheetId(next[0].sheets[0]?.id || "");
    }
  };

  const handleAddSheet = () => {
    if (!currentFolder) return;
    const newS: NoteSheet = {
      id: `s-${Date.now()}`,
      title: "Untitled Sheet",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return { ...f, sheets: [newS, ...f.sheets] };
      }
      return f;
    });
    persistNotebook(next);
    setSelectedSheetId(newS.id);
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (!currentFolder) return;
    if (currentFolder.sheets.length <= 1) {
      alert("A folder must keep at least one sheet.");
      return;
    }
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return { ...f, sheets: f.sheets.filter((s) => s.id !== sheetId) };
      }
      return f;
    });
    persistNotebook(next);
    if (selectedSheetId === sheetId) {
      const remaining = currentFolder.sheets.filter((s) => s.id !== sheetId);
      if (remaining.length > 0) setSelectedSheetId(remaining[0].id);
    }
  };

  const handleUpdateSheet = (updates: Partial<NoteSheet>) => {
    if (!currentFolder || !currentSheet) return;
    const updatedSheet: NoteSheet = {
      ...currentSheet,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return {
          ...f,
          sheets: f.sheets.map((s) => (s.id === currentSheet.id ? updatedSheet : s)),
        };
      }
      return f;
    });
    persistNotebook(next);
  };

  const handleCopySheet = () => {
    if (!currentSheet) return;
    navigator.clipboard.writeText(`${currentSheet.title}\n\n${currentSheet.content}`);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Enrolled courses mapped to full details
  const activeEnrolledList = useMemo(() => {
    return AVAILABLE_COURSES.filter((c) => enrolledCourseIds.includes(c.id));
  }, [enrolledCourseIds]);

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const goalProgressPercent =
    goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  // Features configuration list for 1-click launch cards
  const FEATURES = [
    {
      key: "timer" as FeatureKey,
      title: "Focus Pomodoro Station",
      subtitle: "Sprint intervals & deep-work focus timer with audio cues",
      badge: "25m Sprints",
      badgeColor: "bg-sky-500/15 text-sky-300 border-sky-400/30",
      icon: Timer,
      iconBg: "from-sky-400 to-blue-600",
      accentBorder: "hover:border-sky-400/60",
      actionText: "Open Focus Station",
    },
    {
      key: "planner" as FeatureKey,
      title: "Weekly Study Planner",
      subtitle: "24-hour visual timetable for daily revision blocks",
      badge: "Timetable",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
      icon: Calendar,
      iconBg: "from-cyan-400 to-teal-600",
      accentBorder: "hover:border-cyan-400/60",
      actionText: "Open Study Planner",
    },
    {
      key: "goals" as FeatureKey,
      title: "Daily Targets & Goals",
      subtitle: `${completedGoalsCount} of ${goals.length} milestones completed today`,
      badge: `${goalProgressPercent}% Completed`,
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
      icon: CheckSquare,
      iconBg: "from-emerald-400 to-teal-600",
      accentBorder: "hover:border-emerald-400/60",
      actionText: "Manage Targets",
    },
    {
      key: "notes" as FeatureKey,
      title: "Scholar Notebook",
      subtitle: `${folders.length} folder${folders.length === 1 ? "" : "s"} with multi-sheet rich editor & autosave`,
      badge: "Rich Notebook",
      badgeColor: "bg-violet-500/15 text-violet-300 border-violet-400/30",
      icon: Folder,
      iconBg: "from-violet-400 to-purple-600",
      accentBorder: "hover:border-violet-400/60",
      actionText: "Open Notebook",
    },
    {
      key: "analytics" as FeatureKey,
      title: "Exam & Quiz Radar",
      subtitle: `${results.length} assessment${results.length === 1 ? "" : "s"} logged with mastery ratings`,
      badge: "Analytics",
      badgeColor: "bg-pink-500/15 text-pink-300 border-pink-400/30",
      icon: TrendingUp,
      iconBg: "from-pink-400 to-rose-600",
      accentBorder: "hover:border-pink-400/60",
      actionText: "View Performance",
    },
    {
      key: "courses" as FeatureKey,
      title: "My Enrolled Courses",
      subtitle: `${activeEnrolledList.length} course${activeEnrolledList.length === 1 ? "" : "s"} with official books, notes & exams`,
      badge: `${activeEnrolledList.length} Active`,
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-400/30",
      icon: BookOpen,
      iconBg: "from-amber-400 to-orange-500",
      accentBorder: "hover:border-amber-400/60",
      actionText: "Browse Courses",
    },
  ];

  const currentFeatureMeta = activeFeature
    ? FEATURES.find((f) => f.key === activeFeature)
    : null;

  return (
    <div className="relative min-h-[85vh] pb-16 bg-[#050811] text-[#f4f7fb]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 right-10 w-[35rem] h-[35rem] rounded-full blur-[110px] opacity-20 bg-sky-500" />
        <div className="absolute top-1/2 left-0 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-15 bg-blue-600" />
      </div>

      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* ═════════════════════════════════════════════════════════════ */}
        {/* NATIVE APP VIEW HEADER                                         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeFeature === null ? (
          // Hub Header: Compact, clean, native mobile app look
          <header className="mb-5 rounded-2xl sm:rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#0e1b30] via-[#091322] to-[#060c18] p-4 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 font-black text-xl shadow-lg shadow-sky-500/25 ring-2 ring-sky-300">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                    Welcome back, {userName}
                  </h1>
                  <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-sky-400 font-bold tracking-wide">{studentId}</span>
                    {userEmail && <span className="hidden sm:inline text-slate-400">• {userEmail}</span>}
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-medium">Learning Command</span>
                  </p>
                </div>
              </div>

              {/* Compact Quick Metrics Bar */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060b16] border border-amber-400/25 shadow-inner">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{streakDays}d Streak</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060b16] border border-sky-400/25 shadow-inner">
                  <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-bold text-sky-300">{goalProgressPercent}% Goals</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#060b16] border border-white/15 shadow-inner">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-white">{results.length} Tested</span>
                </div>
              </div>
            </div>
          </header>
        ) : (
          // Feature Screen Top Bar: Native Back Button + Breadcrumb + Quick Switcher
          <div className="mb-5 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-sky-400/25 bg-gradient-to-r from-[#0c182b] via-[#091322] to-[#070e1c] shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 sticky top-2 z-20">
            <button
              type="button"
              onClick={() => setActiveFeature(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-sky-300 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back to Tools</span>
            </button>

            {currentFeatureMeta && (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                  <currentFeatureMeta.icon className="w-4 h-4 text-sky-400" />
                  <span>{currentFeatureMeta.title}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentFeatureMeta.badgeColor}`}>
                  {currentFeatureMeta.badge}
                </span>
              </div>
            )}

            {/* Quick Feature Switcher Pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
              {FEATURES.map((feat) => {
                const isCurrent = feat.key === activeFeature;
                const IconComponent = feat.icon;
                return (
                  <button
                    key={feat.key}
                    type="button"
                    onClick={() => setActiveFeature(feat.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? "bg-sky-400 text-slate-950 font-black shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                    title={feat.title}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{feat.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: HUB FEATURE CARDS DECK (ONE-CLICK LAUNCH CARDS)        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeFeature === null && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Scholar Learning Suite
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tap any tool to launch it directly. Designed for snappy 1-click mobile access.
              </p>
            </div>

            {/* Grid of 6 Amazing Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {FEATURES.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.key}
                    onClick={() => setActiveFeature(feat.key)}
                    className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-gradient-to-br from-[#101b2f] via-[#0b1322] to-[#070d18] p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] ${feat.accentBorder}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.iconBg} text-slate-950 font-black shadow-md`}
                        >
                          <IconComponent className="w-5 h-5 text-slate-950 stroke-[2.2]" />
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${feat.badgeColor}`}
                        >
                          {feat.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {feat.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-sky-300 group-hover:text-sky-200">
                      <span>{feat.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Enrolled Courses Preview Strip */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>My Active Curriculum</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveFeature("courses")}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Manage All Courses ({activeEnrolledList.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeEnrolledList.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={course.path}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-[#091222]/80 hover:bg-[#0f1d35] hover:border-sky-400/40 transition-all shadow-md group"
                  >
                    <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-white/10">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                        {course.title}
                      </p>
                      <span className="text-[10px] font-bold text-sky-400 block mt-0.5">
                        {course.level}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: FULL FEATURE STATION (ONE-CLICK OPENED VIEW)           */}
        {/* ═════════════════════════════════════════════════════════════ */}

        {/* ── 1. FOCUS POMODORO STATION ──────────────────────────────── */}
        {activeFeature === "timer" && (
          <section className="animate-fade-up max-w-4xl mx-auto space-y-4">
            <div className="rounded-2xl sm:rounded-3xl border border-sky-400/30 bg-gradient-to-b from-[#0f1d33] to-[#08101e] p-4 sm:p-8 shadow-2xl">
              <PomodoroTimer />
            </div>
          </section>
        )}

        {/* ── 2. WEEKLY STUDY PLANNER ────────────────────────────────── */}
        {activeFeature === "planner" && (
          <section className="animate-fade-up max-w-5xl mx-auto space-y-4">
            <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b1528] to-[#070e1c] p-2.5 sm:p-5 md:p-6 shadow-2xl">
              <StudyPlanner />
            </div>
          </section>
        )}

        {/* ── 3. DAILY TARGETS & ACCOUNTABILITY ──────────────────────── */}
        {activeFeature === "goals" && (
          <section className="animate-fade-up max-w-4xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#091324] border border-white/10 shadow-lg">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  Daily Targets & Accountability
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Keep yourself accountable every single day.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-400">
                  {completedGoalsCount} of {goals.length} Done
                </span>
                <div className="h-8 px-2.5 flex items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs">
                  {goalProgressPercent}%
                </div>
              </div>
            </div>

            {/* Add Target Input Form */}
            <form
              onSubmit={addGoal}
              className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl bg-[#0e1b30] border border-white/15 shadow-xl"
            >
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="What is your top study target today? (e.g. Solve 20 Physics questions)"
                className="flex-1 w-full bg-[#060b16] border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newGoalPriority}
                  onChange={(e) => setNewGoalPriority(e.target.value as "high" | "medium" | "low")}
                  className="bg-[#060b16] border border-white/12 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs bg-emerald-400 hover:bg-emerald-300 text-slate-950 shrink-0 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Target</span>
                </button>
              </div>
            </form>

            {/* Goals List */}
            <div className="space-y-2.5">
              {goals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-[#060b16]">
                  <p className="text-sm text-slate-400">No targets added yet. Add your first study goal above.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      goal.completed
                        ? "bg-[#060b16] border-emerald-500/25 opacity-75"
                        : "bg-[#0f1d33] border-white/12 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          goal.completed
                            ? "bg-emerald-400 border-emerald-300 text-slate-950 font-bold"
                            : "border-white/30 hover:border-emerald-400 bg-white/[0.04]"
                        }`}
                      >
                        {goal.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <span
                        className={`text-sm truncate ${
                          goal.completed ? "line-through text-slate-400" : "text-white font-semibold"
                        }`}
                      >
                        {goal.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#060b16] text-slate-300 border border-white/10">
                        {goal.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── 4. SCHOLAR NOTEBOOK ────────────────────────────────────── */}
        {activeFeature === "notes" && (
          <section className="animate-fade-up space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#091324] border border-white/10 shadow-lg">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Folder className="w-5 h-5 text-violet-400" />
                  Scholar Notebook
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Organize lecture notes, formulas, and chapter summaries. Auto-saved locally.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#14233d] hover:bg-[#1a2e4f] border border-white/15 text-white transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSheet}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-violet-400 hover:bg-violet-300 text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Sheet</span>
                </button>
              </div>
            </div>

            {/* Folder Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {folders.map((folder) => {
                const isActive = folder.id === currentFolder?.id;
                return (
                  <div key={folder.id} className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        if (folder.sheets?.length > 0) {
                          setSelectedSheetId(folder.sheets[0].id);
                        }
                      }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isActive
                          ? "bg-violet-500/20 border-violet-400 text-violet-200 shadow-md"
                          : "bg-[#0b1526] border-white/12 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>{folder.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-400">
                        {folder.sheets.length}
                      </span>
                    </button>
                    {folders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="ml-1 p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notebook 2-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Sheets List in Current Folder */}
              <div className="lg:col-span-4 rounded-2xl border border-white/15 bg-gradient-to-b from-[#0f1d33] to-[#08101e] p-3.5 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Sheets in {currentFolder?.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSheet}
                    className="text-xs font-bold text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {currentFolder?.sheets.map((sheet) => {
                    const isSelected = sheet.id === currentSheet?.id;
                    return (
                      <div
                        key={sheet.id}
                        onClick={() => setSelectedSheetId(sheet.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-violet-500/20 border-violet-400 text-white shadow-md shadow-violet-500/10"
                            : "bg-[#060b16] border-white/8 hover:border-white/20 text-slate-300"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold truncate text-white">
                            {sheet.title || "Untitled Sheet"}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sheet.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {currentFolder.sheets.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSheet(sheet.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete sheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Sheet Editor with Times New Roman Italic */}
              <div className="lg:col-span-8 rounded-2xl border border-white/15 bg-gradient-to-b from-[#0f1d33] to-[#08101e] p-4 sm:p-5 space-y-3 shadow-xl">
                {currentSheet ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
                      <input
                        type="text"
                        value={currentSheet.title}
                        onChange={(e) => handleUpdateSheet({ title: e.target.value })}
                        className="text-base sm:text-lg font-extrabold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-violet-400 rounded-lg px-1 flex-1"
                        placeholder="Sheet Title..."
                      />
                      <button
                        type="button"
                        onClick={handleCopySheet}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#14233d] hover:bg-[#1a2e4f] border border-white/15 text-slate-200 hover:text-white transition-colors self-start sm:self-auto shadow-md cursor-pointer"
                      >
                        {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNotice ? "Copied" : "Copy Notes"}</span>
                      </button>
                    </div>

                    <textarea
                      value={currentSheet.content}
                      onChange={(e) => handleUpdateSheet({ content: e.target.value })}
                      placeholder="Start typing your study notes, formulas, or summaries here..."
                      className="w-full h-[320px] bg-[#060b16] border border-white/10 rounded-xl p-3.5 text-sm text-slate-100 font-serif italic font-normal font-['Times_New_Roman',Times,serif] leading-relaxed focus:outline-none focus:border-violet-400/50 resize-y transition-colors"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                        <span>Auto-saved locally</span>
                      </span>
                      <span>{currentSheet.content.length} characters</span>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    No sheet selected. Click &quot;Add Sheet&quot; to begin.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. ACADEMIC PERFORMANCE RADAR ──────────────────────────── */}
        {activeFeature === "analytics" && (
          <section className="animate-fade-up max-w-5xl mx-auto space-y-4">
            <StudentAnalyticsDashboard
              userId={userId || "guest"}
              studentName={userName}
            />
          </section>
        )}

        {/* ── 6. MY ENROLLED COURSES & SYLLABUS ──────────────────────── */}
        {activeFeature === "courses" && (
          <section className="animate-fade-up space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#091324] border border-white/10 shadow-lg">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  My Active Courses & Learning Hubs
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pinned learning paths with textbooks, flashcards, short notes, and practice exams.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCourseManager(!showCourseManager)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs bg-[#13223b] hover:bg-[#1a2f52] text-amber-300 border border-amber-400/40 transition-all self-start sm:self-auto shadow-lg cursor-pointer"
              >
                <Settings2 className="w-4 h-4" />
                <span>{showCourseManager ? "Done Customizing" : "Add / Remove Courses"}</span>
              </button>
            </div>

            {/* Course Customizer Drawer */}
            {showCourseManager && (
              <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-b from-[#101d33] to-[#091120] p-4 sm:p-5 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Customize Your Active Courses</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Check packages you are currently preparing for to display them on your dashboard.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCourseManager(false)}
                    className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white border border-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {AVAILABLE_COURSES.map((course) => {
                    const isSelected = enrolledCourseIds.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourseEnrollment(course.id)}
                        className={`group flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 text-white shadow-md"
                            : "bg-[#060b16] border-white/10 text-slate-300 hover:border-white/25 hover:bg-[#0c1626]"
                        }`}
                      >
                        <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-[#091322] border border-white/10">
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold truncate text-white">{course.title}</p>
                          <span className="text-[10px] font-bold text-amber-400">{course.level}</span>
                        </div>

                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                            isSelected
                              ? "bg-amber-400 border-amber-300 text-slate-950"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Enrolled Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrolledList.map((course) => (
                <div
                  key={course.id}
                  className="group rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-b from-[#101c33] to-[#08101e] p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400/50 transition-all shadow-xl"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl mb-3 border border-white/12 bg-[#060b16] shadow-lg">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 px-3.5 py-2 bg-slate-950/80 backdrop-blur-sm border-t border-white/10">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {course.title}
                        </h3>
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {course.desc}
                    </p>
                  </div>

                  <div>
                    {/* Fast Navigation Hub Links */}
                    <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-white/10">
                      <Link
                        href={`${course.path}#textbooks`}
                        className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-bold text-[11px] bg-[#162744] hover:bg-amber-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center"
                      >
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span>Books</span>
                      </Link>
                      <Link
                        href={`${course.path}#notes`}
                        className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-bold text-[11px] bg-[#162744] hover:bg-amber-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center"
                      >
                        <FileText className="w-3 h-3 shrink-0" />
                        <span>Notes</span>
                      </Link>
                      <Link
                        href={`${course.path}#flashcards`}
                        className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-bold text-[11px] bg-[#162744] hover:bg-amber-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center"
                      >
                        <Layers className="w-3 h-3 shrink-0" />
                        <span>Cards</span>
                      </Link>
                      <Link
                        href={`${course.path}#exams`}
                        className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg font-bold text-[11px] bg-[#162744] hover:bg-amber-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center"
                      >
                        <Award className="w-3 h-3 shrink-0" />
                        <span>Exams</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-slate-400 text-sm">
          Loading Scholar Learning Suite...
        </div>
      }
    >
      <LearningContent />
    </Suspense>
  );
}
