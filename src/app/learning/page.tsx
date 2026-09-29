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

type LearningTab = "courses" | "games" | "timer" | "planner" | "goals" | "notes" | "analytics";

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
    desc: "Postgraduate verbal, quantitative & analytical entrance exam preparation.",
  },
  {
    id: "coc",
    title: "COC Competency Assessment",
    level: "Professional Certification",
    path: "/academy/coc",
    image: packageImages["coc"],
    desc: "Occupational competency exams, practice drills & skill assessment questions.",
  },
  {
    id: "exit-exam",
    title: "National Exit Exam",
    level: "Graduation Assessment",
    path: "/academy/exit-exam",
    image: packageImages["exit-exam"],
    desc: "Departmental exit exam question banks & university graduation mock tests.",
  },
];

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>("courses");
  const [selectedGame, setSelectedGame] = useState<"defense" | "climb">("defense");

  // Immediate optimistic states — ZERO delay or blank screen when switching!
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState("Scholar");
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("WT-2026");
  const [streakDays, setStreakDays] = useState(5);
  const [results, setResults] = useState<AcademicResultItem[]>([]);

  // Enrolled / Pinned Courses (Student adds/removes only relevant packages)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(["grade-12", "freshman"]);
  const [showCourseManager, setShowCourseManager] = useState(false);

  // Daily Goals State
  const [goals, setGoals] = useState<StudyGoalItem[]>([
    { id: "g-1", text: "Review Chapter 1 summary notes", completed: true, priority: "high" },
    { id: "g-2", text: "Solve 15 practice questions in Question Bank", completed: false, priority: "high" },
    { id: "g-3", text: "Review active recall flashcards for 15 minutes", completed: false, priority: "medium" },
  ]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("medium");

  // Notes State: Simple, clean
  const [folders, setFolders] = useState<NoteFolder[]>([
    {
      id: "f-1",
      name: "General Notes",
      sheets: [
        {
          id: "s-1",
          title: "Study Notes",
          content: "Click here to start typing your notes, formulas, or summaries...",
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("f-1");
  const [selectedSheetId, setSelectedSheetId] = useState<string>("s-1");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Initialize data asynchronously in background (no blank loading screen)
  useEffect(() => {
    // 1. Sync enrolled courses from localStorage immediately
    try {
      const rawEnrolled = localStorage.getItem(STORAGE_ENROLLED_COURSES);
      if (rawEnrolled) {
        const parsed = JSON.parse(rawEnrolled);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnrolledCourseIds(parsed);
        }
      }
    } catch {
      /* ignore */
    }

    // 2. Sync goals from localStorage
    try {
      const rawGoals = localStorage.getItem(STORAGE_GOALS_KEY);
      if (rawGoals) {
        setGoals(JSON.parse(rawGoals));
      }
    } catch {
      /* ignore */
    }

    // 3. Sync notes from localStorage
    try {
      const rawNotes = localStorage.getItem(STORAGE_NOTEBOOK_KEY);
      if (rawNotes) {
        const parsed = JSON.parse(rawNotes) as NoteFolder[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolders(parsed);
          setSelectedFolderId(parsed[0].id);
          if (parsed[0].sheets?.length > 0) {
            setSelectedSheetId(parsed[0].sheets[0].id);
          }
        }
      }
    } catch {
      /* ignore */
    }

    // 4. Fetch Supabase user profile in background
    async function fetchUserBackground() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const u = session.user;
          setUserId(u.id);
          setUserEmail(u.email || "");
          const metaName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            (u.email ? u.email.split("@")[0] : "Scholar");
          setUserName(metaName);

          const { data: prof } = await supabase
            .from("profiles")
            .select("student_id, full_name, streak_count")
            .eq("id", u.id)
            .maybeSingle();

          if (prof?.student_id) setStudentId(prof.student_id);
          if (prof?.full_name) setUserName(prof.full_name);
          if (prof?.streak_count) setStreakDays(prof.streak_count);

          const { data: myResults } = await supabase
            .from("academic_results")
            .select("id, title, total, correct, missed, percent, created_at")
            .eq("user_id", u.id)
            .order("created_at", { ascending: false })
            .limit(10);

          if (myResults) {
            setResults(myResults.map((r) => ({ ...r, percent: Number(r.percent) })));
          }
        }
      } catch (err) {
        console.warn("[learning/fetchUserBackground]", err);
      }
    }

    void fetchUserBackground();
  }, []);

  // Course selection helpers
  const saveEnrolledCourses = (ids: string[]) => {
    setEnrolledCourseIds(ids);
    try {
      localStorage.setItem(STORAGE_ENROLLED_COURSES, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  };

  const toggleCourseEnrollment = (id: string) => {
    if (enrolledCourseIds.includes(id)) {
      if (enrolledCourseIds.length <= 1) {
        alert("Please keep at least one active course in your learning deck.");
        return;
      }
      saveEnrolledCourses(enrolledCourseIds.filter((cid) => cid !== id));
    } else {
      saveEnrolledCourses([...enrolledCourseIds, id]);
    }
  };

  const removeCourse = (id: string) => {
    if (enrolledCourseIds.length <= 1) {
      alert("Please keep at least one active course in your learning deck.");
      return;
    }
    saveEnrolledCourses(enrolledCourseIds.filter((cid) => cid !== id));
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

  const toggleGoal = (id: string) => {
    persistGoals(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
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
    return currentFolder.sheets.find((s) => s.id === selectedSheetId) || currentFolder.sheets[0] || null;
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
  const goalProgressPercent = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  return (
    <div className="relative min-h-[85vh] pb-16 bg-[#050811] text-[#f4f7fb]">
      {/* Premium ambient backdrop light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 right-10 w-[35rem] h-[35rem] rounded-full blur-[110px] opacity-20 bg-sky-500" />
        <div className="absolute top-1/2 left-0 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-15 bg-blue-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Top Scholar Header Card (Rich High Contrast) */}
        <header className="mb-7 rounded-3xl border border-sky-400/25 bg-gradient-to-br from-[#0e1b30] via-[#091322] to-[#060c18] p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-slate-950 font-black text-2xl shadow-lg shadow-sky-500/25 ring-2 ring-sky-300">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    Welcome back, {userName}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-sky-400 font-bold tracking-wide">{studentId}</span>
                  {userEmail && <span className="hidden sm:inline text-slate-400">• {userEmail}</span>}
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-medium">Scholar Learning Hub</span>
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

        {/* ── Separate High-Contrast Mode Navigation Buttons ── */}
        <nav aria-label="Learning Modes" className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {/* 1. My Courses */}
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "courses"
                  ? "bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-2 ring-sky-300 scale-[1.02]"
                  : "bg-[#0b1526] text-slate-200 hover:text-white hover:bg-[#12223d] border border-white/15 font-bold"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>My Courses</span>
            </button>

            {/* 2. Study Games (Wisdom Defense & Tower Climb) */}
            <button
              onClick={() => setActiveTab("games")}
              className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md relative ${
                activeTab === "games"
                  ? "bg-gradient-to-r from-amber-400 via-cyan-400 to-sky-400 text-slate-950 font-black shadow-lg shadow-cyan-400/30 ring-2 ring-cyan-300 scale-[1.02]"
                  : "bg-[#0b1526] text-amber-300 hover:text-white hover:bg-[#12223d] border border-amber-400/30 font-bold"
              }`}
            >
              <Gamepad2 className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Study Games</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[9px] font-mono font-bold border border-amber-400/30 text-amber-300">
                2
              </span>
            </button>

            {/* 3. Focus Timer */}
            <button
              onClick={() => setActiveTab("timer")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "timer"
                  ? "bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-2 ring-sky-300 scale-[1.02]"
                  : "bg-[#0b1526] text-slate-200 hover:text-white hover:bg-[#12223d] border border-white/15 font-bold"
              }`}
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span>Focus Timer</span>
            </button>

            {/* 4. Study Planner */}
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "planner"
                  ? "bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-2 ring-sky-300 scale-[1.02]"
                  : "bg-[#0b1526] text-slate-200 hover:text-white hover:bg-[#12223d] border border-white/15 font-bold"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Study Planner</span>
            </button>

            {/* 5. Daily Goals */}
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "goals"
                  ? "bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-2 ring-sky-300 scale-[1.02]"
                  : "bg-[#0b1526] text-slate-200 hover:text-white hover:bg-[#12223d] border border-white/15 font-bold"
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Daily Goals</span>
            </button>

            {/* 6. Notes */}
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "notes"
                  ? "bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-2 ring-sky-300 scale-[1.02]"
                  : "bg-[#0b1526] text-slate-200 hover:text-white hover:bg-[#12223d] border border-white/15 font-bold"
              }`}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span>Notes</span>
            </button>

            {/* 7. Performance */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "analytics"
                  ? "bg-sky-400 text-slate-950 font-black shadow-lg shadow-sky-400/30 ring-2 ring-sky-300 scale-[1.02]"
                  : "bg-[#0b1526] text-slate-200 hover:text-white hover:bg-[#12223d] border border-white/15 font-bold"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Performance</span>
            </button>
          </div>
        </nav>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 1: MY COURSES & HUBS (VISUAL CARDS WITH PROPER IMAGERY)  */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "courses" && (
          <section className="space-y-6 animate-fade-up">
            {/* Featured Study Games Showcase in Learning Section */}
            <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-[#0c182c] via-[#091424] to-[#160f26] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono font-bold mb-2">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Wisdom Arcade · Study Games Hub</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Study Through Action: Tower Defense & Tower Climb
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    Reinforce official exam questions in <span className="text-cyan-300 font-bold">Wisdom Defense</span> with machine-gun arrow answers, or scale chapter question banks in <span className="text-amber-300 font-bold">Tower Climb</span> alongside your lantern owl companion.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedGame("defense");
                      setActiveTab("games");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>Play Wisdom Defense</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGame("climb");
                      setActiveTab("games");
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Play Tower Climb</span>
                  </button>
                </div>
              </div>
            </div>

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

            {/* In-Page Native Course Manager (Drawer / Selector) */}
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
                        {/* Course Miniature Image */}
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

            {/* Active Enrolled Course Cards (Real Images, High Contrast, No Blank Text) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeEnrolledList.map((course) => (
                <div
                  key={course.id}
                  className="group rounded-3xl border border-white/15 bg-gradient-to-b from-[#101c33] to-[#08101e] p-5 sm:p-6 flex flex-col justify-between hover:border-sky-400/50 transition-all shadow-2xl"
                >
                  <div>
                    {/* Visual Card Image Header */}
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
                      {/* Only the package title at the bottom of the card with subtle background for readability */}
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

                  {/* 5 Distinct High-Contrast Hub Action Buttons */}
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
        {/* TAB 2: STUDY GAMES (WISDOM DEFENSE & TOWER CLIMB)             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "games" && (
          <section className="space-y-6 animate-fade-up">
            {/* Top Game Mode Selector Bar */}
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

            {/* Active Embedded Game Canvas */}
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
        {/* TAB 3: STANDALONE FOCUS TIMER (WITH CUSTOM DURATION BUTTON)   */}
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
        {/* TAB 3: STANDALONE STUDY PLANNER (24-HOUR TIMETABLE)           */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "planner" && (
          <section className="space-y-4 animate-fade-up max-w-5xl mx-auto">
            <div className="text-center mb-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                <Calendar className="w-6 h-6 text-cyan-400" />
                Weekly Study Timetable
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Vertical 24-hour AM/PM timeline with horizontal days of the week and minute-accurate blocks.
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b1528] to-[#070e1c] p-3 sm:p-5 md:p-6 shadow-2xl">
              <StudyPlanner />
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 4: STANDALONE DAILY GOALS                                 */}
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

            {/* Add Goal Form */}
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
        {/* TAB 5: SIMPLE, CLEAN NOTEBOOK                                 */}
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
              {/* Sheets List in Current Folder (4 cols) */}
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

              {/* Active Sheet Editor (8 cols) */}
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
                      className="w-full h-[380px] bg-[#060b16] border border-white/10 rounded-2xl p-4 text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-sky-400/50 resize-y transition-colors"
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
        {/* TAB 6: STANDALONE PERFORMANCE & QUIZ ANALYTICS                */}
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
