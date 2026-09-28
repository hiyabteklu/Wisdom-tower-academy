"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PomodoroTimer from "@/components/learning/PomodoroTimer";
import StudyPlanner from "@/components/learning/StudyPlanner";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import BrandLoader from "@/components/BrandLoader";

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

type LearningTab = "courses" | "timer" | "planner" | "goals" | "notes" | "analytics";

const STORAGE_ENROLLED_COURSES = "wt_enrolled_courses_v1";
const STORAGE_NOTEBOOK_KEY = "wt_student_notebook_v4";
const STORAGE_GOALS_KEY = "wt_student_goals_v4";

// All available packages for add/remove
const AVAILABLE_COURSES = [
  { id: "grade-12", title: "Grade 12 Package", level: "Secondary", path: "/academy/grades/12" },
  { id: "grade-11", title: "Grade 11 Package", level: "Secondary", path: "/academy/grades/11" },
  { id: "grade-10", title: "Grade 10 Package", level: "Secondary", path: "/academy/grades/10" },
  { id: "grade-9", title: "Grade 9 Package", level: "Secondary", path: "/academy/grades/9" },
  { id: "freshman", title: "Freshman University Courses", level: "University", path: "/academy/freshman" },
  { id: "remedial", title: "Remedial Program", level: "University Prep", path: "/academy/remedial" },
  { id: "uat", title: "AAU UAT Entrance Exam", level: "Entrance", path: "/academy/uat" },
  { id: "gat", title: "AAU GAT Graduate Aptitude", level: "Postgraduate", path: "/academy/gat" },
  { id: "coc", title: "COC Competency Assessment", level: "Certification", path: "/academy/coc" },
  { id: "exit-exam", title: "National Exit Exam", level: "Graduation", path: "/academy/exit-exam" },
];

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>("courses");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState("Scholar");
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("WT-2026");
  const [streakDays, setStreakDays] = useState(5);
  const [results, setResults] = useState<AcademicResultItem[]>([]);

  // Enrolled / Pin Courses (User can Add / Remove)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(["grade-12", "freshman"]);
  const [showCourseManager, setShowCourseManager] = useState(false);

  // Daily Goals State
  const [goals, setGoals] = useState<StudyGoalItem[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("medium");

  // Notebook State: Simple, intuitive
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Initialize
  useEffect(() => {
    async function initWorkspace() {
      try {
        setLoading(true);
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

        // Load enrolled courses from storage
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

        // Load Goals from storage
        try {
          const rawGoals = localStorage.getItem(STORAGE_GOALS_KEY);
          if (rawGoals) {
            setGoals(JSON.parse(rawGoals));
          } else {
            setGoals([
              { id: "g-1", text: "Review Chapter 1 summary notes", completed: true, priority: "high" },
              { id: "g-2", text: "Solve 15 practice questions in Question Bank", completed: false, priority: "high" },
              { id: "g-3", text: "Review active recall flashcards for 15 minutes", completed: false, priority: "medium" },
            ]);
          }
        } catch {
          /* ignore */
        }

        // Load Notebook (Simple: 1 starter folder, 1 empty sheet)
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
            } else {
              initializeDefaultNotebook();
            }
          } else {
            initializeDefaultNotebook();
          }
        } catch {
          initializeDefaultNotebook();
        }
      } catch (err) {
        console.warn("[learning/init]", err);
      } finally {
        setLoading(false);
      }
    }

    void initWorkspace();
  }, []);

  function initializeDefaultNotebook() {
    const starter: NoteFolder[] = [
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
    ];
    setFolders(starter);
    setSelectedFolderId("f-1");
    setSelectedSheetId("s-1");
  }

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
    const name = prompt("Enter folder title (e.g. Mathematics):");
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

  // Enrolled course items list
  const activeEnrolledList = useMemo(() => {
    return AVAILABLE_COURSES.filter((c) => enrolledCourseIds.includes(c.id));
  }, [enrolledCourseIds]);

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const goalProgressPercent = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#070c16]">
        <BrandLoader label="Loading your personalized study workspace..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] pb-16 bg-[#070c16] text-[#f4f7fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Top Scholar Status Card */}
        <header className="mb-8 rounded-3xl border border-white/10 bg-[#111b2e] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-white font-black text-2xl shadow-lg shadow-cyan-500/20">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                  Welcome back, {userName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-cyan-400 font-semibold">{studentId}</span>
                  {userEmail && <span className="hidden sm:inline">• {userEmail}</span>}
                  <span>•</span>
                  <span>Wisdom Tower Scholar Portal</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-[#0a101c] border border-white/8 min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streakDays} Days</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  Streak
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-[#0a101c] border border-white/8 min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{goalProgressPercent}%</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  Goals Done
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-2xl bg-[#0a101c] border border-white/8 min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-white text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{results.length} Quizzes</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  Practiced
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Separate High-Contrast Mode Navigation ── */}
        <nav aria-label="Learning Modes" className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* 1. My Courses */}
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "courses"
                  ? "bg-cyan-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400 font-extrabold"
                  : "bg-[#111b2e] text-slate-300 hover:text-white hover:bg-[#1c283c] border border-white/10"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>My Courses</span>
            </button>

            {/* 2. Focus Timer */}
            <button
              onClick={() => setActiveTab("timer")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "timer"
                  ? "bg-cyan-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400 font-extrabold"
                  : "bg-[#111b2e] text-slate-300 hover:text-white hover:bg-[#1c283c] border border-white/10"
              }`}
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span>Focus Timer</span>
            </button>

            {/* 3. Study Planner */}
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "planner"
                  ? "bg-cyan-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400 font-extrabold"
                  : "bg-[#111b2e] text-slate-300 hover:text-white hover:bg-[#1c283c] border border-white/10"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Study Planner</span>
            </button>

            {/* 4. Daily Goals */}
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "goals"
                  ? "bg-cyan-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400 font-extrabold"
                  : "bg-[#111b2e] text-slate-300 hover:text-white hover:bg-[#1c283c] border border-white/10"
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>Daily Goals</span>
            </button>

            {/* 5. Notes */}
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "notes"
                  ? "bg-cyan-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400 font-extrabold"
                  : "bg-[#111b2e] text-slate-300 hover:text-white hover:bg-[#1c283c] border border-white/10"
              }`}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span>Notes</span>
            </button>

            {/* 6. Performance */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "analytics"
                  ? "bg-cyan-500 text-black shadow-cyan-500/25 ring-2 ring-cyan-400 font-extrabold"
                  : "bg-[#111b2e] text-slate-300 hover:text-white hover:bg-[#1c283c] border border-white/10"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Performance</span>
            </button>
          </div>
        </nav>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 1: MY COURSES & HUBS (STUDENTS KEEP RELEVANT COURSES)     */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "courses" && (
          <section className="space-y-6 animate-fade-up">
            {/* Header + Add/Remove Toggle Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  My Active Courses & Learning Hubs
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Only courses you are studying are pinned here. Use the button to customize your deck.
                </p>
              </div>

              <button
                onClick={() => setShowCourseManager(!showCourseManager)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#1c283c] hover:bg-[#22334d] text-cyan-300 border border-cyan-400/30 transition-all self-start sm:self-auto shadow-md"
              >
                <Settings2 className="w-4 h-4" />
                <span>{showCourseManager ? "Done Customizing" : "Add / Remove Courses"}</span>
              </button>
            </div>

            {/* In-Page Native Course Manager (Collapsible, NO overflow, NO awkward popup) */}
            {showCourseManager && (
              <div className="rounded-3xl border border-cyan-400/40 bg-[#111b2e] p-5 sm:p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Select Your Active Courses</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Toggle packages on or off to keep your workspace clean and relevant.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCourseManager(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
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
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-400 text-white shadow-sm"
                            : "bg-[#0a101c] border-white/10 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold truncate text-white">{course.title}</p>
                          <span className="text-[10px] text-slate-400">{course.level}</span>
                        </div>
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                            isSelected
                              ? "bg-cyan-500 border-cyan-400 text-black"
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

            {/* Active Enrolled Course Cards (Horizontal, Space Efficient, High Contrast) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrolledList.map((course) => (
                <div
                  key={course.id}
                  className="rounded-3xl border border-white/12 bg-[#111b2e] p-5 sm:p-6 flex flex-col justify-between hover:border-cyan-400/40 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20">
                        {course.level}
                      </span>
                      <button
                        onClick={() => removeCourse(course.id)}
                        className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove from my learning"
                      >
                        Remove
                      </button>
                    </div>

                    <h3 className="text-xl font-extrabold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Direct access to verified textbooks, notes summaries, recall flashcards, and model exams.
                    </p>
                  </div>

                  {/* 5 Distinct High-Contrast Hub Buttons for this Course */}
                  <div className="mt-6 pt-4 border-t border-white/8 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Link
                        href={`${course.path}/books`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs bg-[#1c283c] hover:bg-cyan-500 hover:text-black text-white border border-white/10 transition-all text-center"
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Books</span>
                      </Link>

                      <Link
                        href={`${course.path}/short-notes`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs bg-[#1c283c] hover:bg-cyan-500 hover:text-black text-white border border-white/10 transition-all text-center"
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>Notes</span>
                      </Link>

                      <Link
                        href={`${course.path}/flashcards`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs bg-[#1c283c] hover:bg-cyan-500 hover:text-black text-white border border-white/10 transition-all text-center"
                      >
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span>Flashcards</span>
                      </Link>

                      <Link
                        href={`${course.path}/question-banks`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs bg-[#1c283c] hover:bg-cyan-500 hover:text-black text-white border border-white/10 transition-all text-center"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Questions</span>
                      </Link>

                      <Link
                        href={`${course.path}/exams`}
                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs bg-[#1c283c] hover:bg-cyan-500 hover:text-black text-white border border-white/10 transition-all text-center col-span-2 sm:col-span-1"
                      >
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>Exams</span>
                      </Link>
                    </div>

                    <Link
                      href={course.path}
                      className="flex items-center justify-between w-full py-2 px-3 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-[#0a101c] border border-white/6 hover:border-cyan-400/30 transition-all"
                    >
                      <span>Open Complete Course Directory</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 2: STANDALONE FOCUS TIMER (UNMERGED)                      */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "timer" && (
          <section className="space-y-6 animate-fade-up max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <Timer className="w-7 h-7 text-cyan-400" />
                Pomodoro Focus Station
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                25-minute deep work cycles followed by 5-minute cognitive breaks.
              </p>
            </div>

            <div className="rounded-3xl border border-white/12 bg-[#111b2e] p-6 sm:p-8 shadow-2xl">
              <PomodoroTimer />
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 3: STANDALONE STUDY PLANNER (UNMERGED)                    */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "planner" && (
          <section className="space-y-6 animate-fade-up max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <Calendar className="w-7 h-7 text-cyan-400" />
                Weekly Study Timetable & Schedule
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Organize your study blocks Monday through Sunday. Stored locally on your device.
              </p>
            </div>

            <div className="rounded-3xl border border-white/12 bg-[#111b2e] p-5 sm:p-8 shadow-2xl">
              <StudyPlanner />
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 4: STANDALONE DAILY GOALS (UNMERGED)                      */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "goals" && (
          <section className="space-y-6 animate-fade-up max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-7 h-7 text-cyan-400" />
                  Daily Targets & Goals
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Keep yourself accountable every single day.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400">Completion</span>
                  <p className="text-lg font-black text-cyan-400">
                    {completedGoalsCount} of {goals.length}
                  </p>
                </div>
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-bold">
                  {goalProgressPercent}%
                </div>
              </div>
            </div>

            {/* Add Goal Input */}
            <form
              onSubmit={addGoal}
              className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl bg-[#111b2e] border border-white/12 shadow-lg"
            >
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="What is your top study target today? (e.g. Solve 20 Physics questions)"
                className="flex-1 w-full bg-[#0a101c] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newGoalPriority}
                  onChange={(e) => setNewGoalPriority(e.target.value as "high" | "medium" | "low")}
                  className="bg-[#0a101c] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-black shrink-0 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Target</span>
                </button>
              </div>
            </form>

            {/* Checklist */}
            <div className="space-y-2.5">
              {goals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-[#0a101c]">
                  <p className="text-sm text-slate-400">No targets added yet. Add your first study goal above.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      goal.completed
                        ? "bg-[#0a101c] border-cyan-500/20 opacity-75"
                        : "bg-[#111b2e] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          goal.completed
                            ? "bg-cyan-500 border-cyan-400 text-black"
                            : "border-white/30 hover:border-cyan-400 bg-white/[0.04]"
                        }`}
                      >
                        {goal.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <span
                        className={`text-sm truncate ${
                          goal.completed ? "line-through text-slate-400" : "text-white font-medium"
                        }`}
                      >
                        {goal.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0a101c] text-slate-300 border border-white/8">
                        {goal.priority}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
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
        {/* TAB 5: SIMPLE, CLEAN NOTEBOOK (1 SAMPLE SHEET + ADD SHEET)   */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "notes" && (
          <section className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Folder className="w-7 h-7 text-cyan-400" />
                  Study Notes
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Organize your course notes into folders and add sheets. Auto-saves locally.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddFolder}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1c283c] hover:bg-[#22334d] border border-white/10 text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
                <button
                  onClick={handleAddSheet}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md transition-all font-extrabold"
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
                          ? "bg-cyan-500/15 border-cyan-400 text-cyan-300"
                          : "bg-[#111b2e] border-white/10 text-slate-300 hover:text-white"
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
              <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#111b2e] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sheets in {currentFolder?.name}
                  </span>
                  <button
                    onClick={handleAddSheet}
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
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
                            ? "bg-cyan-500/15 border-cyan-400 text-white"
                            : "bg-[#0a101c] border-white/6 hover:border-white/15 text-slate-300"
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
              <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-[#111b2e] p-5 sm:p-6 space-y-4">
                {currentSheet ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
                      <input
                        type="text"
                        value={currentSheet.title}
                        onChange={(e) => handleUpdateSheet({ title: e.target.value })}
                        className="text-lg font-extrabold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-lg px-1 flex-1"
                        placeholder="Sheet Title..."
                      />
                      <button
                        onClick={handleCopySheet}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1c283c] hover:bg-[#22334d] border border-white/10 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
                      >
                        {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNotice ? "Copied" : "Copy Notes"}</span>
                      </button>
                    </div>

                    <textarea
                      value={currentSheet.content}
                      onChange={(e) => handleUpdateSheet({ content: e.target.value })}
                      placeholder="Start typing your study notes, formulas, or summaries here..."
                      className="w-full h-[380px] bg-[#0a101c] border border-white/8 rounded-2xl p-4 text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-400/50 resize-y transition-colors"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/6">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                        <span>Auto-saved to browser storage</span>
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
        {/* TAB 6: STANDALONE PERFORMANCE & QUIZ ANALYTICS (UNMERGED)    */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <section className="space-y-6 animate-fade-up max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <TrendingUp className="w-7 h-7 text-cyan-400" />
                Exam & Quiz Performance Radar
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
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
