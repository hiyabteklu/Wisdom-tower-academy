"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
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
  Gamepad2,
  Crosshair,
  Trophy,
  Swords,
  Maximize2,
  Sparkles,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { packageImages } from "@/data/packages";
import PomodoroTimer from "@/components/learning/PomodoroTimer";
import StudyPlanner from "@/components/learning/StudyPlanner";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import TowerDefenseGame from "@/components/games/tower-defense/TowerDefenseGame";
import TowerClimbApp from "@/components/games/tower-climb/TowerClimbApp";

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

type LearningTab =
  | "overview"
  | "courses"
  | "games"
  | "timer"
  | "planner"
  | "goals"
  | "notes"
  | "analytics";

const STORAGE_ENROLLED_COURSES = "wt_enrolled_courses_v2";
const STORAGE_NOTEBOOK_KEY = "wt_student_notebook_v5";
const STORAGE_GOALS_KEY = "wt_student_goals_v5";

// All available packages with verified official imagery and routes
const AVAILABLE_COURSES = [
  {
    id: "grade-12",
    title: "Grade 12 Package",
    level: "Secondary Matric",
    path: "/academy/grades/12",
    image: packageImages["grade-12"],
    desc: "National matriculation past papers, chapter question drills & timed exam simulations.",
  },
  {
    id: "freshman",
    title: "Freshman University Courses",
    level: "Higher Education",
    path: "/academy/freshman",
    image: packageImages["freshman"],
    desc: "All 17 first-year university subjects with official textbooks, lecture notes & model exams.",
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

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>("overview");
  const [selectedGame, setSelectedGame] = useState<"defense" | "climb">("defense");

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
        // Starter goals
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
                content: "Derivative shortcuts:\n- d/dx(x^n) = n*x^(n-1)\n- d/dx(sin x) = cos x\n- d/dx(e^x) = e^x\n\nIntegrals:\n- ∫ x^n dx = (x^(n+1))/(n+1) + C\n- ∫ 1/x dx = ln|x| + C",
                updatedAt: new Date().toISOString(),
              },
              {
                id: "s-phys",
                title: "General Physics Mechanics Summary",
                content: "Newton's Laws:\n1. Inertia: An object remains at rest or constant velocity unless acted upon.\n2. F = ma (Force = Mass × Acceleration)\n3. Action & Reaction: Equal and opposite forces.",
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
                content: "Percentage calculations:\n- 15% of X = (10% of X) + (half of 10% of X)\n- Speed = Distance / Time\n- Work = Rate × Time",
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
        alert("You must keep at least one active course on your board.");
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

  const removeCourse = (courseId: string) => {
    toggleCourseEnrollment(courseId);
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

  return (
    <div className="relative min-h-[85vh] pb-16 bg-[#050811] text-[#f4f7fb]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 right-10 w-[35rem] h-[35rem] rounded-full blur-[110px] opacity-20 bg-sky-500" />
        <div className="absolute top-1/2 left-0 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-15 bg-blue-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Top Scholar Header Card */}
        <header className="mb-6 rounded-3xl border border-sky-400/25 bg-gradient-to-br from-[#0e1b30] via-[#091322] to-[#060c18] p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 font-black text-2xl shadow-lg shadow-sky-500/25 ring-2 ring-sky-300">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  Welcome back, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-sky-400 font-bold tracking-wide">{studentId}</span>
                  {userEmail && <span className="hidden sm:inline text-slate-400">• {userEmail}</span>}
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-medium">Academic Command Center</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-[#060b16] border border-amber-400/25 min-w-[5.5rem] shadow-inner">
                <div className="flex items-center gap-1 text-amber-300 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streakDays} Days</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                  Streak
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-[#060b16] border border-sky-400/25 min-w-[5.5rem] shadow-inner">
                <div className="flex items-center gap-1 text-sky-300 text-xs font-bold">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{goalProgressPercent}%</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                  Goals Done
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-[#060b16] border border-white/15 min-w-[5.5rem] shadow-inner">
                <div className="flex items-center gap-1 text-white text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{results.length} Quizzes</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                  Tested
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── REDESIGNED LEARNING SECTION: VALUABLE FEATURE SPOTLIGHT DECK ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Scholar Learning Suite & Core Features
              </h2>
              <p className="text-xs text-slate-400">
                Direct access to high-impact productivity tools, battle games, and curriculum pathways.
              </p>
            </div>
            {activeTab !== "overview" && (
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-xs font-bold text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>View All Features</span>
              </button>
            )}
          </div>

          {/* High-Impact Feature Showcase Cards Grid (Visible, Clean, Valuable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Card 1: Study Games Arena */}
            <div
              onClick={() => {
                setSelectedGame("defense");
                setActiveTab("games");
              }}
              className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "games"
                  ? "bg-gradient-to-br from-amber-500/20 via-cyan-500/20 to-[#0e1f36] border-cyan-400 shadow-xl ring-2 ring-cyan-400/40"
                  : "bg-gradient-to-br from-[#121c2e] to-[#0a1220] border-white/15 hover:border-cyan-400/50 hover:bg-[#15233b]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg">
                  <Gamepad2 className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  2 Battle Games
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Wisdom Defense & Tower Climb
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Turn exam questions into ballistic defense battles or climb chapter question banks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                <span>Launch Arcade</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 2: Weekly Study Planner */}
            <div
              onClick={() => setActiveTab("planner")}
              className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "planner"
                  ? "bg-gradient-to-br from-cyan-500/20 via-sky-500/20 to-[#0e1f36] border-cyan-400 shadow-xl ring-2 ring-cyan-400/40"
                  : "bg-gradient-to-br from-[#121c2e] to-[#0a1220] border-white/15 hover:border-cyan-400/50 hover:bg-[#15233b]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-black shadow-lg">
                  <Calendar className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                  24h Timetable
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Visual Study Planner
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Clean mobile timetable board without messy numbers. Aligns cleanly with vertical clock.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                <span>Open Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 3: Focus Pomodoro Timer */}
            <div
              onClick={() => setActiveTab("timer")}
              className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "timer"
                  ? "bg-gradient-to-br from-sky-500/20 via-blue-500/20 to-[#0e1f36] border-sky-400 shadow-xl ring-2 ring-sky-400/40"
                  : "bg-gradient-to-br from-[#121c2e] to-[#0a1220] border-white/15 hover:border-sky-400/50 hover:bg-[#15233b]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-slate-950 font-black shadow-lg">
                  <Timer className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/20">
                  25 Min Sprints
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  Focus Pomodoro Station
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Deep-work sprint intervals, break intervals, and audio-backed focus environment.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-sky-300 group-hover:text-sky-200">
                <span>Start Focus Session</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 4: Daily Action Goals */}
            <div
              onClick={() => setActiveTab("goals")}
              className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "goals"
                  ? "bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-[#0e1f36] border-emerald-400 shadow-xl ring-2 ring-emerald-400/40"
                  : "bg-gradient-to-br from-[#121c2e] to-[#0a1220] border-white/15 hover:border-emerald-400/50 hover:bg-[#15233b]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black shadow-lg">
                  <CheckSquare className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                  {completedGoalsCount}/{goals.length} Done
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Daily Targets & Accountability
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Track high-priority daily study milestones and maintain consistent academic streaks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                <span>Manage Targets</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 5: Scholar Notes & Summaries */}
            <div
              onClick={() => setActiveTab("notes")}
              className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "notes"
                  ? "bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-[#0e1f36] border-violet-400 shadow-xl ring-2 ring-violet-400/40"
                  : "bg-gradient-to-br from-[#121c2e] to-[#0a1220] border-white/15 hover:border-violet-400/50 hover:bg-[#15233b]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 text-slate-950 font-black shadow-lg">
                  <Folder className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 border border-violet-400/20">
                  {folders.length} Folders
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                  Scholar Notebook
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Multi-sheet rich notebook with Times New Roman formatting, autosave, and copy tools.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-violet-300 group-hover:text-violet-200">
                <span>Open Notebook</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Card 6: Academic Performance Radar */}
            <div
              onClick={() => setActiveTab("analytics")}
              className={`group relative overflow-hidden rounded-3xl border p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between ${
                activeTab === "analytics"
                  ? "bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-[#0e1f36] border-pink-400 shadow-xl ring-2 ring-pink-400/40"
                  : "bg-gradient-to-br from-[#121c2e] to-[#0a1220] border-white/15 hover:border-pink-400/50 hover:bg-[#15233b]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 text-slate-950 font-black shadow-lg">
                  <TrendingUp className="w-6 h-6 text-slate-950" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-400/10 text-pink-300 border border-pink-400/20">
                  {results.length} Tests
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  Performance & Quiz Radar
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Speed benchmarks, score distributions, and Green / Yellow / Red mastery ratings.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-pink-300 group-hover:text-pink-200">
                <span>View Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* ── CLEAN SEGMENTED NAVIGATION BAR ── */}
        <nav aria-label="Learning Modes" className="mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "overview"
                  ? "bg-sky-400 text-slate-950 border-sky-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard Hub</span>
            </button>

            <button
              onClick={() => setActiveTab("courses")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "courses"
                  ? "bg-sky-400 text-slate-950 border-sky-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Active Courses ({activeEnrolledList.length})</span>
            </button>

            <button
              onClick={() => {
                setSelectedGame("defense");
                setActiveTab("games");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "games"
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black"
                  : "bg-[#0b1526] text-amber-300 hover:text-white border-amber-400/30 hover:bg-[#12223d]"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Study Games</span>
            </button>

            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "planner"
                  ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Study Planner</span>
            </button>

            <button
              onClick={() => setActiveTab("timer")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "timer"
                  ? "bg-sky-400 text-slate-950 border-sky-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <Timer className="w-3.5 h-3.5 shrink-0" />
              <span>Focus Timer</span>
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "goals"
                  ? "bg-emerald-400 text-slate-950 border-emerald-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Daily Goals</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "notes"
                  ? "bg-violet-400 text-slate-950 border-violet-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                activeTab === "analytics"
                  ? "bg-pink-400 text-slate-950 border-pink-400 shadow-md font-black"
                  : "bg-[#0b1526] text-slate-300 hover:text-white border-white/10 hover:bg-[#12223d]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Performance</span>
            </button>
          </div>
        </nav>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW / COURSES SECTION                                    */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {(activeTab === "overview" || activeTab === "courses") && (
          <section className="space-y-6 animate-fade-up">
            {/* Top Bar with Add/Remove Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  My Active Courses & Learning Hubs
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Pinned learning paths with textbooks, flashcards, short notes, and practice exams.
                </p>
              </div>

              <button
                onClick={() => setShowCourseManager(!showCourseManager)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-[#13223b] hover:bg-[#1a2f52] text-sky-300 border border-sky-400/40 transition-all self-start sm:self-auto shadow-lg"
              >
                <Settings2 className="w-4 h-4" />
                <span>{showCourseManager ? "Done Customizing" : "Add / Remove Courses"}</span>
              </button>
            </div>

            {/* In-Page Native Course Manager */}
            {showCourseManager && (
              <div className="rounded-3xl border border-sky-400/40 bg-gradient-to-b from-[#101d33] to-[#091120] p-5 sm:p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Customize Your Active Courses</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Check packages you are currently preparing for to display them on your dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCourseManager(false)}
                    className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_COURSES.map((course) => {
                    const isSelected = enrolledCourseIds.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourseEnrollment(course.id)}
                        className={`group flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-sky-500/15 border-sky-400 text-white shadow-md shadow-sky-500/15"
                            : "bg-[#060b16] border-white/10 text-slate-300 hover:border-white/25 hover:bg-[#0c1626]"
                        }`}
                      >
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-[#091322] border border-white/10">
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold truncate text-white">{course.title}</p>
                          <span className="text-[10px] font-bold text-sky-400">{course.level}</span>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                            isSelected
                              ? "bg-sky-400 border-sky-300 text-slate-950"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Enrolled Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeEnrolledList.map((course) => (
                <div
                  key={course.id}
                  className="group rounded-3xl border border-white/15 bg-gradient-to-b from-[#101c33] to-[#08101e] p-5 sm:p-6 flex flex-col justify-between hover:border-sky-400/50 transition-all shadow-2xl"
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl mb-4 border border-white/12 bg-[#060b16] shadow-lg">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 px-4 py-2.5 bg-slate-950/75 backdrop-blur-sm border-t border-white/10">
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-1">
                      {course.desc}
                    </p>
                  </div>

                  {/* 5 Distinct Hub Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                        Learning Hubs
                      </p>
                      <button
                        onClick={() => removeCourse(course.id)}
                        className="text-[11px] font-medium text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove from my learning"
                      >
                        Remove course
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Link
                        href={`${course.path}/books`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-xs bg-[#162744] hover:bg-sky-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center shadow-md"
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Books</span>
                      </Link>

                      <Link
                        href={`${course.path}/short-notes`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-xs bg-[#162744] hover:bg-sky-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center shadow-md"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>Notes</span>
                      </Link>

                      <Link
                        href={`${course.path}/flashcards`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-xs bg-[#162744] hover:bg-sky-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center shadow-md"
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span>Flashcards</span>
                      </Link>

                      <Link
                        href={`${course.path}/question-banks`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-xs bg-[#162744] hover:bg-sky-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center shadow-md"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Questions</span>
                      </Link>

                      <Link
                        href={`${course.path}/exams`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-xs bg-[#162744] hover:bg-sky-400 hover:text-slate-950 text-white border border-white/15 transition-all text-center shadow-md col-span-2 sm:col-span-1"
                      >
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>Exams</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB: STUDY GAMES                                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "games" && (
          <section className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedGame("defense")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md ${
                    selectedGame === "defense"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-cyan-500/25 ring-2 ring-cyan-300"
                      : "bg-[#101d33] text-slate-300 hover:text-white border border-white/10"
                  }`}
                >
                  <Crosshair className="w-4 h-4 text-slate-950" />
                  <span>Wisdom Defense (Exam Questions)</span>
                </button>

                <button
                  onClick={() => setSelectedGame("climb")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md ${
                    selectedGame === "climb"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black shadow-amber-500/25 ring-2 ring-amber-300"
                      : "bg-[#101d33] text-slate-300 hover:text-white border border-white/10"
                  }`}
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>Tower Climb (Chapter Quizzes)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  href={selectedGame === "defense" ? "/games/tower-defense" : "/games/tower-climb"}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-white/20 transition-all shadow-sm"
                  title="Open dedicated full page"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Open Fullscreen</span>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#091120] to-[#040812] p-2 sm:p-6 shadow-2xl relative overflow-hidden">
              {selectedGame === "defense" ? (
                <TowerDefenseGame />
              ) : (
                <TowerClimbApp />
              )}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB: FOCUS TIMER                                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "timer" && (
          <section className="space-y-6 animate-fade-up max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <Timer className="w-7 h-7 text-sky-400" />
                Pomodoro Focus Station
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Set standard 25-minute sprints or configure your own custom focus duration.
              </p>
            </div>

            <div className="rounded-3xl border border-sky-400/25 bg-gradient-to-b from-[#0f1d33] to-[#08101e] p-6 sm:p-8 shadow-2xl">
              <PomodoroTimer />
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB: STUDY PLANNER                                            */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "planner" && (
          <section className="space-y-4 animate-fade-up max-w-5xl mx-auto">
            <div className="text-center mb-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-cyan-400" />
                Weekly Study Timetable
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Compact 24-hour visual timetable fitting cleanly on mobile screens with uncluttered title blocks.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b1528] to-[#070e1c] p-2 sm:p-5 md:p-6 shadow-2xl">
              <StudyPlanner />
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB: DAILY GOALS                                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "goals" && (
          <section className="space-y-6 animate-fade-up max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-7 h-7 text-sky-400" />
                  Daily Targets & Goals
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Keep yourself accountable every single day.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400">Completion</span>
                  <p className="text-lg font-black text-sky-400">
                    {completedGoalsCount} of {goals.length}
                  </p>
                </div>
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-400/40 text-sky-300 font-extrabold text-sm">
                  {goalProgressPercent}%
                </div>
              </div>
            </div>

            <form
              onSubmit={addGoal}
              className="flex flex-col sm:flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-[#0e1b30] border border-white/15 shadow-xl"
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
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-black text-xs bg-sky-400 hover:bg-sky-300 text-slate-950 shrink-0 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Target</span>
                </button>
              </div>
            </form>

            <div className="space-y-2.5">
              {goals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-[#060b16]">
                  <p className="text-sm text-slate-400">No targets added yet. Add your first study goal above.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      goal.completed
                        ? "bg-[#060b16] border-sky-500/25 opacity-75"
                        : "bg-[#0f1d33] border-white/12 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          goal.completed
                            ? "bg-sky-400 border-sky-300 text-slate-950 font-bold"
                            : "border-white/30 hover:border-sky-400 bg-white/[0.04]"
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
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
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

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB: SCHOLAR NOTEBOOK                                         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "notes" && (
          <section className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <Folder className="w-7 h-7 text-sky-400" />
                  Study Notes
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Organize your course notes into folders and add sheets. Auto-saves locally.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddFolder}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#14233d] hover:bg-[#1a2e4f] border border-white/15 text-white transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
                <button
                  onClick={handleAddSheet}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sheet</span>
                </button>
              </div>
            </div>

            {/* Folder Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {folders.map((folder) => {
                const isActive = folder.id === currentFolder?.id;
                return (
                  <div key={folder.id} className="flex items-center shrink-0">
                    <button
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        if (folder.sheets?.length > 0) {
                          setSelectedSheetId(folder.sheets[0].id);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? "bg-sky-500/20 border-sky-400 text-sky-200 shadow-md"
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
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="ml-1 p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notebook 2-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Sheets List in Current Folder */}
              <div className="lg:col-span-4 rounded-3xl border border-white/15 bg-gradient-to-b from-[#0f1d33] to-[#08101e] p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Sheets in {currentFolder?.name}
                  </span>
                  <button
                    onClick={handleAddSheet}
                    className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sheet</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {currentFolder?.sheets.map((sheet) => {
                    const isSelected = sheet.id === currentSheet?.id;
                    return (
                      <div
                        key={sheet.id}
                        onClick={() => setSelectedSheetId(sheet.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-400 text-white shadow-md shadow-sky-500/10"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSheet(sheet.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
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

              {/* Active Sheet Editor with Times New Roman Bold Italic */}
              <div className="lg:col-span-8 rounded-3xl border border-white/15 bg-gradient-to-b from-[#0f1d33] to-[#08101e] p-5 sm:p-6 space-y-4 shadow-xl">
                {currentSheet ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <input
                        type="text"
                        value={currentSheet.title}
                        onChange={(e) => handleUpdateSheet({ title: e.target.value })}
                        className="text-lg font-extrabold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-sky-400 rounded-lg px-1 flex-1"
                        placeholder="Sheet Title..."
                      />
                      <button
                        onClick={handleCopySheet}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#14233d] hover:bg-[#1a2e4f] border border-white/15 text-slate-200 hover:text-white transition-colors self-start sm:self-auto shadow-md"
                      >
                        {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNotice ? "Copied" : "Copy Notes"}</span>
                      </button>
                    </div>

                    <textarea
                      value={currentSheet.content}
                      onChange={(e) => handleUpdateSheet({ content: e.target.value })}
                      placeholder="Start typing your study notes, formulas, or summaries here..."
                      className="w-full h-[380px] bg-[#060b16] border border-white/10 rounded-2xl p-4 text-base text-slate-100 font-serif italic font-bold leading-relaxed focus:outline-none focus:border-sky-400/50 resize-y transition-colors"
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
                  <div className="p-16 text-center text-slate-400">
                    No sheet selected. Click &quot;Add Sheet&quot; to begin.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB: ACADEMIC ANALYTICS                                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <section className="space-y-6 animate-fade-up max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <TrendingUp className="w-7 h-7 text-sky-400" />
                Exam & Quiz Performance Radar
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Institutional grading history, speed benchmarks, and Green / Yellow / Red mastery levels.
              </p>
            </div>

            <StudentAnalyticsDashboard
              userId={userId || "guest"}
              studentName={userName}
            />
          </section>
        )}
      </div>
    </div>
  );
}
