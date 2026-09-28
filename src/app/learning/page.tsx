"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
  FolderPlus,
  FilePlus,
  Trash2,
  Edit3,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  Plus,
  X,
  Compass,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PomodoroTimer from "@/components/learning/PomodoroTimer";
import StudyPlanner from "@/components/learning/StudyPlanner";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import BrandLoader from "@/components/BrandLoader";

export interface AcademicResultItem {
  id: string;
  title: string;
  total: number;
  correct: number;
  missed: number;
  percent: number;
  created_at: string;
}

// ── Types for Multi-Folder Notebook ─────────────────────────────
export interface NoteSheet {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  pinned?: boolean;
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string; // e.g. "sky", "violet", "emerald", "amber", "rose"
  icon: string;
  sheets: NoteSheet[];
}

// ── Types for Daily Goals ──────────────────────────────────────
export interface StudyGoalItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

type LearningTab = "hubs" | "timer" | "planner" | "goals" | "notes" | "analytics";

const STORAGE_NOTEBOOK_KEY = "wt_student_notebook_v3";
const STORAGE_GOALS_KEY = "wt_student_daily_goals_v3";
const STORAGE_STREAK_KEY = "wt_student_streak_v1";

const DEFAULT_FOLDERS: NoteFolder[] = [
  {
    id: "f-math",
    name: "Mathematics & Calculus",
    color: "sky",
    icon: "📐",
    sheets: [
      {
        id: "s-math-1",
        title: "Calculus Limits & Derivatives Cheat Sheet",
        category: "Calculus I",
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        content: `# Calculus I: Key Formulas & Techniques\n\n### 1. Fundamental Limit Theorems\n- lim (x -> 0) [sin(x) / x] = 1\n- lim (x -> 0) [(1 - cos(x)) / x] = 0\n- lim (x -> inf) (1 + 1/x)^x = e\n\n### 2. Derivative Rules\n- Product Rule: (uv)' = u'v + uv'\n- Quotient Rule: (u/v)' = (u'v - uv') / v^2\n- Chain Rule: d/dx[f(g(x))] = f'(g(x)) * g'(x)\n\n### 3. Exam Reminders\n* Always check for 0/0 indeterminate forms before applying L'Hopital's Rule!\n* Watch sign changes when testing critical points for local extrema.`,
        pinned: true,
      },
      {
        id: "s-math-2",
        title: "Matrix Inverses & Determinants",
        category: "Linear Algebra",
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        content: `# Matrix Operations\n\n- 2x2 Determinant: det([a b; c d]) = ad - bc\n- Inverse formula: A^(-1) = (1/det(A)) * [d -b; -c a]\n- Cramer's rule is fastest for 2x2 systems during timed exams.`,
      },
    ],
  },
  {
    id: "f-phys",
    name: "Physics & Mechanics",
    color: "violet",
    icon: "⚡",
    sheets: [
      {
        id: "s-phys-1",
        title: "Kinematics & Work-Energy Theorem",
        category: "General Physics",
        updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        content: `# Work, Energy & Power Summary\n\n- Work = F * d * cos(theta)\n- Net Work = Delta Kinetic Energy (W_net = 1/2 m v_f^2 - 1/2 m v_i^2)\n- Conservation of Mechanical Energy: E_initial = E_final when non-conservative forces do zero work.`,
        pinned: true,
      },
    ],
  },
  {
    id: "f-chem",
    name: "Chemistry & Biology",
    color: "emerald",
    icon: "🧪",
    sheets: [
      {
        id: "s-chem-1",
        title: "Thermodynamics & Reaction Kinetics",
        category: "General Chemistry",
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        content: `# Reaction Kinetics & Equilibrium\n\n- Gibbs Free Energy: Delta G = Delta H - T * Delta S\n- If Delta G < 0, reaction is spontaneous in the forward direction.\n- Arrhenius equation: k = A * exp(-E_a / (R*T))`,
      },
    ],
  },
  {
    id: "f-exam",
    name: "Exam Cheatsheets & Summaries",
    color: "amber",
    icon: "🎯",
    sheets: [
      {
        id: "s-exam-1",
        title: "Final Exam High-Yield Summary",
        category: "Exam Prep",
        updatedAt: new Date().toISOString(),
        content: `# High-Yield Checklist\n\n1. Review all short notes summaries before sleep.\n2. Complete at least 2 full timed model exams under exam conditions.\n3. Mark wrong answers and revise flashcards for missed topics.`,
        pinned: true,
      },
    ],
  },
];

export default function MyLearningPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>("hubs");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState("Scholar");
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("WT-2026");
  const [streakDays, setStreakDays] = useState(5);
  const [results, setResults] = useState<AcademicResultItem[]>([]);

  // Hub Modal for Quick Selection
  const [selectedHub, setSelectedHub] = useState<{
    id: string;
    title: string;
    accent: string;
    description: string;
  } | null>(null);

  // Daily Goals State
  const [goals, setGoals] = useState<StudyGoalItem[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("medium");

  // Notebook State (Folders & Sheets)
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");
  const [notebookSearch, setNotebookSearch] = useState("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Initialize data
  useEffect(() => {
    async function initUserAndContent() {
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const u = session.user;
          setUserEmail(u.email || "");
          setUserId(u.id);
          const metaName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            (u.email ? u.email.split("@")[0] : "Scholar");
          setUserName(metaName);

          // Get profile
          const { data: prof } = await supabase
            .from("profiles")
            .select("student_id, full_name, streak_count")
            .eq("id", u.id)
            .maybeSingle();

          if (prof?.student_id) setStudentId(prof.student_id);
          if (prof?.full_name) setUserName(prof.full_name);
          if (prof?.streak_count) setStreakDays(prof.streak_count);

          // Load recent exam results
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

        // Initialize Goals from LocalStorage
        try {
          const rawGoals = localStorage.getItem(STORAGE_GOALS_KEY);
          if (rawGoals) {
            setGoals(JSON.parse(rawGoals));
          } else {
            setGoals([
              { id: "g-1", text: "Read Chapter 1 Short Notes summary", completed: true, priority: "high", createdAt: new Date().toISOString() },
              { id: "g-2", text: "Solve 20 questions in Question Bank", completed: false, priority: "high", createdAt: new Date().toISOString() },
              { id: "g-3", text: "Review active recall Flashcards for 15 minutes", completed: false, priority: "medium", createdAt: new Date().toISOString() },
              { id: "g-4", text: "Take 1 timed model exam practice", completed: false, priority: "low", createdAt: new Date().toISOString() },
            ]);
          }
        } catch {
          /* ignore */
        }

        // Initialize Notebook from LocalStorage
        try {
          const rawNotebook = localStorage.getItem(STORAGE_NOTEBOOK_KEY);
          if (rawNotebook) {
            const parsed = JSON.parse(rawNotebook) as NoteFolder[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFolders(parsed);
              setSelectedFolderId(parsed[0].id);
              if (parsed[0].sheets?.length > 0) {
                setSelectedSheetId(parsed[0].sheets[0].id);
              }
            } else {
              setFolders(DEFAULT_FOLDERS);
              setSelectedFolderId(DEFAULT_FOLDERS[0].id);
              setSelectedSheetId(DEFAULT_FOLDERS[0].sheets[0].id);
            }
          } else {
            setFolders(DEFAULT_FOLDERS);
            setSelectedFolderId(DEFAULT_FOLDERS[0].id);
            setSelectedSheetId(DEFAULT_FOLDERS[0].sheets[0].id);
          }
        } catch {
          setFolders(DEFAULT_FOLDERS);
          setSelectedFolderId(DEFAULT_FOLDERS[0].id);
          setSelectedSheetId(DEFAULT_FOLDERS[0].sheets[0].id);
        }
      } catch (err) {
        console.warn("[learning/init]", err);
      } finally {
        setLoading(false);
      }
    }

    void initUserAndContent();
  }, []);

  // Save Goals Helper
  const persistGoals = (next: StudyGoalItem[]) => {
    setGoals(next);
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggleGoal = (id: string) => {
    const next = goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
    persistGoals(next);
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newItem: StudyGoalItem = {
      id: `g-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      priority: newGoalPriority,
      createdAt: new Date().toISOString(),
    };
    persistGoals([newItem, ...goals]);
    setNewGoalText("");
  };

  const deleteGoal = (id: string) => {
    persistGoals(goals.filter((g) => g.id !== id));
  };

  // Notebook persistence & helpers
  const persistNotebook = (nextFolders: NoteFolder[]) => {
    setFolders(nextFolders);
    try {
      localStorage.setItem(STORAGE_NOTEBOOK_KEY, JSON.stringify(nextFolders));
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

  // Create new folder
  const handleCreateFolder = () => {
    const name = prompt("Enter folder name (e.g. 'Calculus & Algebra'):");
    if (!name?.trim()) return;
    const colors = ["sky", "violet", "emerald", "amber", "rose", "cyan"];
    const icons = ["📁", "📘", "⚡", "📐", "🔬", "💡", "🎯"];
    const newFolder: NoteFolder = {
      id: `f-${Date.now()}`,
      name: name.trim(),
      color: colors[folders.length % colors.length],
      icon: icons[folders.length % icons.length],
      sheets: [
        {
          id: `s-${Date.now()}`,
          title: "First Note",
          category: name.trim(),
          updatedAt: new Date().toISOString(),
          content: `# ${name.trim()}\n\nStart jotting down formulas, concepts, or homework points here.`,
        },
      ],
    };
    const next = [...folders, newFolder];
    persistNotebook(next);
    setSelectedFolderId(newFolder.id);
    setSelectedSheetId(newFolder.sheets[0].id);
  };

  // Delete folder
  const handleDeleteFolder = (folderId: string) => {
    if (folders.length <= 1) {
      alert("You must keep at least one notebook folder.");
      return;
    }
    if (!confirm("Are you sure you want to delete this folder and all its sheets?")) return;
    const next = folders.filter((f) => f.id !== folderId);
    persistNotebook(next);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(next[0].id);
      setSelectedSheetId(next[0].sheets[0]?.id || "");
    }
  };

  // Rename folder
  const handleRenameFolder = (folderId: string, newName: string) => {
    if (!newName.trim()) return;
    const next = folders.map((f) => (f.id === folderId ? { ...f, name: newName.trim() } : f));
    persistNotebook(next);
  };

  // Create new sheet
  const handleCreateSheet = () => {
    if (!currentFolder) return;
    const newSheet: NoteSheet = {
      id: `s-${Date.now()}`,
      title: "Untitled Sheet",
      category: currentFolder.name,
      updatedAt: new Date().toISOString(),
      content: `# New Study Sheet\n\nDate: ${new Date().toLocaleDateString()}\n\n- Key Concept 1:\n- Key Concept 2:`,
    };
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return { ...f, sheets: [newSheet, ...f.sheets] };
      }
      return f;
    });
    persistNotebook(next);
    setSelectedSheetId(newSheet.id);
  };

  // Delete sheet
  const handleDeleteSheet = (sheetId: string) => {
    if (!currentFolder) return;
    if (currentFolder.sheets.length <= 1) {
      alert("A folder must keep at least one sheet.");
      return;
    }
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        const remaining = f.sheets.filter((s) => s.id !== sheetId);
        return { ...f, sheets: remaining };
      }
      return f;
    });
    persistNotebook(next);
    if (selectedSheetId === sheetId) {
      const remainingSheets = currentFolder.sheets.filter((s) => s.id !== sheetId);
      if (remainingSheets.length > 0) {
        setSelectedSheetId(remainingSheets[0].id);
      }
    }
  };

  // Update current sheet content
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

  // Copy Sheet Content
  const handleCopySheet = () => {
    if (!currentSheet) return;
    navigator.clipboard.writeText(`${currentSheet.title}\n\n${currentSheet.content}`);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Download Sheet
  const handleDownloadSheet = () => {
    if (!currentSheet) return;
    const blob = new Blob([`${currentSheet.title}\n\n${currentSheet.content}`], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSheet.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered sheets by search
  const filteredSheets = useMemo(() => {
    if (!currentFolder) return [];
    if (!notebookSearch.trim()) return currentFolder.sheets;
    const q = notebookSearch.toLowerCase();
    return currentFolder.sheets.filter(
      (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [currentFolder, notebookSearch]);

  // Goal metrics
  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const goalProgressPercent = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <BrandLoader label="Loading your personalized study workspace..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] pb-16">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-sky-500/30 via-violet-500/20 to-transparent" />
        <div className="absolute bottom-10 left-1/4 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-15 bg-gradient-to-tr from-amber-500/20 via-emerald-500/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        {/* Top Scholar Status Card */}
        <header className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-wisdom-card via-wisdom-card/90 to-wisdom-card/60 p-5 sm:p-6 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-sky-500/25">
                {userName.charAt(0).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-2 ring-wisdom-card">
                  ✓
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                    Welcome back, {userName}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-wisdom-muted flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-sky-400 font-semibold">{studentId}</span>
                  {userEmail && <span className="hidden sm:inline">• {userEmail}</span>}
                  <span>•</span>
                  <span>Wisdom Tower Scholar Portal</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/8 min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streakDays} Days</span>
                </div>
                <span className="text-[10px] text-wisdom-muted uppercase tracking-wider font-semibold mt-0.5">
                  Study Streak
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/8 min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{goalProgressPercent}%</span>
                </div>
                <span className="text-[10px] text-wisdom-muted uppercase tracking-wider font-semibold mt-0.5">
                  Goals Done
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/8 min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-sky-400 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>{results.length} Quizzes</span>
                </div>
                <span className="text-[10px] text-wisdom-muted uppercase tracking-wider font-semibold mt-0.5">
                  Practiced
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Separate High-Contrast Mode Buttons (Explicitly Unmerged) ── */}
        <nav aria-label="Learning Modes" className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* 1. Hubs Button */}
            <button
              onClick={() => setActiveTab("hubs")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "hubs"
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/30 ring-2 ring-sky-400/50 scale-[1.02]"
                  : "bg-wisdom-card/90 text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-sky-300" />
              <span>Study Hubs</span>
            </button>

            {/* 2. Focus Timer Button */}
            <button
              onClick={() => setActiveTab("timer")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "timer"
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50 scale-[1.02]"
                  : "bg-wisdom-card/90 text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <Timer className="w-4 h-4 shrink-0 text-rose-300" />
              <span>Focus Timer</span>
            </button>

            {/* 3. Study Planner Button */}
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "planner"
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-cyan-500/30 ring-2 ring-cyan-400/50 scale-[1.02]"
                  : "bg-wisdom-card/90 text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0 text-cyan-300" />
              <span>Study Planner</span>
            </button>

            {/* 4. Daily Goals Button */}
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "goals"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50 scale-[1.02]"
                  : "bg-wisdom-card/90 text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <CheckSquare className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>Daily Goals</span>
            </button>

            {/* 5. Notebook (Folders & Sheets) Button */}
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "notes"
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/30 ring-2 ring-violet-400/50 scale-[1.02]"
                  : "bg-wisdom-card/90 text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <Folder className="w-4 h-4 shrink-0 text-violet-300" />
              <span>Notebook</span>
            </button>

            {/* 6. Performance Analytics Button */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md ${
                activeTab === "analytics"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-amber-500/30 ring-2 ring-amber-400/50 scale-[1.02]"
                  : "bg-wisdom-card/90 text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0 text-amber-300" />
              <span>Performance</span>
            </button>
          </div>
        </nav>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 1: STUDY HUBS (BOOKS, FLASHCARDS, NOTES, EXAMS, ETC.)     */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "hubs" && (
          <section className="space-y-8 animate-fade-up">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  Core Learning Resource Hubs
                </h2>
                <p className="text-xs sm:text-sm text-wisdom-muted mt-0.5">
                  Launch verified textbooks, summaries, recall flashcards, and step-by-step model exams.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-400/10 text-sky-300 border border-sky-400/20 self-start sm:self-auto">
                100% Verified Routes
              </span>
            </div>

            {/* 5 Amazing High-Contrast Resource Cards (Fitting Horizontally, No Cropping) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* 1. BOOKS & TEXTBOOKS */}
              <div className="group relative rounded-3xl border border-sky-400/30 bg-gradient-to-b from-sky-950/40 via-wisdom-card to-wisdom-card p-5 flex flex-col justify-between hover:border-sky-400/70 hover:shadow-xl hover:shadow-sky-500/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-300 border border-sky-400/30 shadow-inner group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-400/10 px-2.5 py-0.5 rounded-full border border-sky-400/20">
                      Curriculum
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-white group-hover:text-sky-200 transition-colors">
                    Books & Textbooks
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-2 leading-relaxed">
                    Official Grade 9–12 Ministry textbooks, university reference books, and curriculum readers.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/8 space-y-2">
                  <button
                    onClick={() =>
                      setSelectedHub({
                        id: "books",
                        title: "Books & Textbooks",
                        accent: "text-sky-400",
                        description: "Select your program or grade below to open the complete official textbook collection.",
                      })
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all"
                  >
                    <span>Browse Books</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/academy/grades/12/books"
                    className="block text-center text-[11px] font-medium text-sky-300/80 hover:text-sky-200 hover:underline"
                  >
                    Quick: Grade 12 Books →
                  </Link>
                </div>
              </div>

              {/* 2. FLASHCARDS */}
              <div className="group relative rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-950/40 via-wisdom-card to-wisdom-card p-5 flex flex-col justify-between hover:border-amber-400/70 hover:shadow-xl hover:shadow-amber-500/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-inner group-hover:scale-105 transition-transform">
                      <Layers className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      Active Recall
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-white group-hover:text-amber-200 transition-colors">
                    Flashcards
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-2 leading-relaxed">
                    Interactive flip decks for rapid memorization of formulas, definitions, key dates, and core concepts.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/8 space-y-2">
                  <button
                    onClick={() =>
                      setSelectedHub({
                        id: "flashcards",
                        title: "Flashcards Decks",
                        accent: "text-amber-400",
                        description: "Select your program or subject to start interactive active recall drills.",
                      })
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <span>Launch Flashcards</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/academy/freshman/flashcards"
                    className="block text-center text-[11px] font-medium text-amber-300/80 hover:text-amber-200 hover:underline"
                  >
                    Quick: Freshman Cards →
                  </Link>
                </div>
              </div>

              {/* 3. SHORT NOTES */}
              <div className="group relative rounded-3xl border border-violet-400/30 bg-gradient-to-b from-violet-950/40 via-wisdom-card to-wisdom-card p-5 flex flex-col justify-between hover:border-violet-400/70 hover:shadow-xl hover:shadow-violet-500/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-300 border border-violet-400/30 shadow-inner group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300 bg-violet-400/10 px-2.5 py-0.5 rounded-full border border-violet-400/20">
                      Summaries
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-white group-hover:text-violet-200 transition-colors">
                    Short Notes
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-2 leading-relaxed">
                    Dense, chapter-by-chapter summaries highlighting high-yield exam takeaways and step-by-step algorithms.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/8 space-y-2">
                  <button
                    onClick={() =>
                      setSelectedHub({
                        id: "short-notes",
                        title: "Short Notes & Summaries",
                        accent: "text-violet-400",
                        description: "Select your program to read concise, revision-ready chapter notes.",
                      })
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 transition-all"
                  >
                    <span>Read Short Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/academy/grades/11/short-notes"
                    className="block text-center text-[11px] font-medium text-violet-300/80 hover:text-violet-200 hover:underline"
                  >
                    Quick: Grade 11 Notes →
                  </Link>
                </div>
              </div>

              {/* 4. QUESTION BANKS */}
              <div className="group relative rounded-3xl border border-cyan-400/30 bg-gradient-to-b from-cyan-950/40 via-wisdom-card to-wisdom-card p-5 flex flex-col justify-between hover:border-cyan-400/70 hover:shadow-xl hover:shadow-cyan-500/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 shadow-inner group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                      Practice Drills
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-white group-hover:text-cyan-200 transition-colors">
                    Question Banks
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-2 leading-relaxed">
                    Topic-based drills, multiple-choice items, and worked solutions with detailed step-by-step reasoning.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/8 space-y-2">
                  <button
                    onClick={() =>
                      setSelectedHub({
                        id: "question-banks",
                        title: "Question Banks",
                        accent: "text-cyan-400",
                        description: "Choose your subject to solve practice questions organized by difficulty.",
                      })
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <span>Practice Questions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/academy/freshman/question-banks"
                    className="block text-center text-[11px] font-medium text-cyan-300/80 hover:text-cyan-200 hover:underline"
                  >
                    Quick: Freshman Questions →
                  </Link>
                </div>
              </div>

              {/* 5. MODEL EXAMS */}
              <div className="group relative rounded-3xl border border-emerald-400/30 bg-gradient-to-b from-emerald-950/40 via-wisdom-card to-wisdom-card p-5 flex flex-col justify-between hover:border-emerald-400/70 hover:shadow-xl hover:shadow-emerald-500/15 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shadow-inner group-hover:scale-105 transition-transform">
                      <Award className="w-6 h-6" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                      Simulation
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-extrabold text-white group-hover:text-emerald-200 transition-colors">
                    Model & Past Exams
                  </h3>
                  <p className="text-xs text-wisdom-muted mt-2 leading-relaxed">
                    National matriculation past papers, university midterms, finals, UAT, and GAT timed simulations.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/8 space-y-2">
                  <button
                    onClick={() =>
                      setSelectedHub({
                        id: "exams",
                        title: "Model & Past Exams",
                        accent: "text-emerald-400",
                        description: "Pick an exam series to begin timed practice with automatic scoring.",
                      })
                    }
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <span>Take Model Exam</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/academy/uat/exams"
                    className="block text-center text-[11px] font-medium text-emerald-300/80 hover:text-emerald-200 hover:underline"
                  >
                    Quick: UAT Practice Exams →
                  </Link>
                </div>
              </div>
            </div>

            {/* Direct Quick Jump Bar */}
            <div className="rounded-3xl border border-white/10 bg-wisdom-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-white text-base">Direct Pathway Navigation</h3>
                </div>
                <span className="text-xs text-wisdom-muted">Direct 1-Click Launch</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {[
                  { label: "Grade 9", href: "/academy/grades/9" },
                  { label: "Grade 10", href: "/academy/grades/10" },
                  { label: "Grade 11", href: "/academy/grades/11" },
                  { label: "Grade 12", href: "/academy/grades/12" },
                  { label: "Freshman", href: "/academy/freshman" },
                  { label: "Remedial", href: "/academy/remedial" },
                  { label: "UAT Entrance", href: "/academy/uat" },
                  { label: "GAT Entrance", href: "/academy/gat" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-sky-400/40 hover:bg-white/[0.07] transition-all text-center group"
                  >
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-wisdom-muted mt-0.5">Explore hubs →</span>
                  </Link>
                ))}
              </div>
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
                <Timer className="w-7 h-7 text-rose-400" />
                Pomodoro Focus Station
              </h2>
              <p className="text-sm text-wisdom-muted mt-1 max-w-md mx-auto">
                Science-backed deep work cycles. 25-minute sprints followed by 5-minute cognitive breaks.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 via-wisdom-card to-wisdom-card p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <PomodoroTimer />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/8 bg-wisdom-card p-4 text-center">
                <p className="text-xs text-wisdom-muted uppercase font-bold tracking-wider">Target Focus Block</p>
                <p className="text-xl font-black text-rose-400 mt-1">4 x 25 min</p>
                <p className="text-[11px] text-wisdom-muted mt-0.5">Recommended daily quota</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-wisdom-card p-4 text-center">
                <p className="text-xs text-wisdom-muted uppercase font-bold tracking-wider">Attention Retention</p>
                <p className="text-xl font-black text-emerald-400 mt-1">+38% Boost</p>
                <p className="text-[11px] text-wisdom-muted mt-0.5">When taking spaced breaks</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-wisdom-card p-4 text-center">
                <p className="text-xs text-wisdom-muted uppercase font-bold tracking-wider">Sound Ambience</p>
                <p className="text-xl font-black text-sky-400 mt-1">Active</p>
                <p className="text-[11px] text-wisdom-muted mt-0.5">Auto-chimes on cycle finish</p>
              </div>
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
              <p className="text-sm text-wisdom-muted mt-1 max-w-md mx-auto">
                Schedule your study blocks across Monday to Sunday. Persistent across all your browser sessions.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 via-wisdom-card to-wisdom-card p-5 sm:p-8 shadow-2xl backdrop-blur-md">
              <StudyPlanner />
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TAB 4: STANDALONE DAILY GOALS & HABITS (UNMERGED)             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "goals" && (
          <section className="space-y-6 animate-fade-up max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-7 h-7 text-emerald-400" />
                  Daily Targets & Goal Habits
                </h2>
                <p className="text-sm text-wisdom-muted mt-1">
                  Keep yourself accountable every single day. Streak resets if no targets are completed.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-wisdom-muted">Daily Completion</span>
                  <p className="text-lg font-black text-emerald-400">{completedGoalsCount} of {goals.length}</p>
                </div>
                <div className="relative h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {goalProgressPercent}%
                </div>
              </div>
            </div>

            {/* Add Goal Input */}
            <form
              onSubmit={addGoal}
              className="flex flex-col sm:flex-row items-center gap-2.5 p-3 rounded-2xl bg-wisdom-card border border-white/12 shadow-lg"
            >
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="What is your top study goal for today? (e.g., Read Physics Chapter 3)"
                className="flex-1 w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newGoalPriority}
                  onChange={(e) => setNewGoalPriority(e.target.value as "high" | "medium" | "low")}
                  className="bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="high" className="bg-slate-900 text-rose-400">High Priority</option>
                  <option value="medium" className="bg-slate-900 text-amber-400">Medium Priority</option>
                  <option value="low" className="bg-slate-900 text-sky-400">Low Priority</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 shrink-0 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Goal</span>
                </button>
              </div>
            </form>

            {/* Goal Checklist List */}
            <div className="space-y-2.5">
              {goals.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                  <p className="text-sm text-wisdom-muted">No goals added yet. Add your first study target above!</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      goal.completed
                        ? "bg-emerald-950/20 border-emerald-500/30 opacity-80"
                        : "bg-wisdom-card border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          goal.completed
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "border-white/30 hover:border-emerald-400 bg-white/[0.04]"
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
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          goal.priority === "high"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : goal.priority === "medium"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {goal.priority}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete goal"
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
        {/* TAB 5: MULTI-FOLDER & MULTI-SHEET NOTEBOOK                   */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "notes" && (
          <section className="space-y-6 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Folder className="w-7 h-7 text-violet-400" />
                  Hierarchical Multi-Folder Notebook
                </h2>
                <p className="text-sm text-wisdom-muted mt-1">
                  Create organized folders for each course, create multiple sheets/pages in each, and format formulas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
                <button
                  onClick={handleCreateSheet}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 text-white transition-all"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>New Sheet</span>
                </button>
              </div>
            </div>

            {/* Folder selection bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {folders.map((folder) => {
                const isActive = folder.id === currentFolder?.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setSelectedFolderId(folder.id);
                      if (folder.sheets?.length > 0) {
                        setSelectedSheetId(folder.sheets[0].id);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                      isActive
                        ? "bg-violet-600/30 border-violet-400 text-white shadow-lg shadow-violet-500/20"
                        : "bg-wisdom-card border-white/8 text-slate-300 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <span>{folder.icon}</span>
                    <span>{folder.name}</span>
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-400 font-mono">
                      {folder.sheets.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Notebook Main Workspace: 2 Columns (Sheets List & Sheet Editor) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sheets List (4 Cols) */}
              <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-wisdom-card p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentFolder?.icon}</span>
                    <span className="font-bold text-white text-sm truncate max-w-[140px]">
                      {currentFolder?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newName = prompt("Rename folder:", currentFolder?.name);
                        if (newName && currentFolder) handleRenameFolder(currentFolder.id, newName);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Rename folder"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => currentFolder && handleDeleteFolder(currentFolder.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={notebookSearch}
                    onChange={(e) => setNotebookSearch(e.target.value)}
                    placeholder="Search sheets in folder..."
                    className="w-full bg-white/[0.04] border border-white/8 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition-colors"
                  />
                </div>

                {/* Sheets List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredSheets.length === 0 ? (
                    <div className="p-6 text-center text-xs text-wisdom-muted">
                      No sheets found in this folder. Click &quot;New Sheet&quot; to add one.
                    </div>
                  ) : (
                    filteredSheets.map((sheet) => {
                      const isSelected = sheet.id === currentSheet?.id;
                      return (
                        <div
                          key={sheet.id}
                          onClick={() => setSelectedSheetId(sheet.id)}
                          className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-violet-950/40 border-violet-400/60 shadow-md"
                              : "bg-white/[0.02] border-white/6 hover:border-white/15 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-violet-200" : "text-white"
                              }`}
                            >
                              {sheet.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSheet(sheet.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                              title="Delete sheet"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-[11px] text-wisdom-muted line-clamp-2 mt-1">
                            {sheet.content.replace(/^#+\s+/gm, "").slice(0, 80)}...
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 pt-2 border-t border-white/6">
                            <span>{new Date(sheet.updatedAt).toLocaleDateString()}</span>
                            <span>{sheet.content.split(/\s+/).filter(Boolean).length} words</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sheet Editor (8 Cols) */}
              <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-wisdom-card p-5 sm:p-6 space-y-4">
                {currentSheet ? (
                  <>
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/8">
                      <input
                        type="text"
                        value={currentSheet.title}
                        onChange={(e) => handleUpdateSheet({ title: e.target.value })}
                        className="text-lg sm:text-xl font-extrabold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-violet-400 rounded-lg px-1 flex-1"
                        placeholder="Sheet Title..."
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopySheet}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Copy sheet text"
                        >
                          {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedNotice ? "Copied!" : "Copy"}</span>
                        </button>
                        <button
                          onClick={handleDownloadSheet}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Download Markdown"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export .md</span>
                        </button>
                      </div>
                    </div>

                    {/* Format Shortcut Toolbar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-300">
                      {[
                        { label: "H1", insert: "# " },
                        { label: "H2", insert: "## " },
                        { label: "Bold", insert: "**text**" },
                        { label: "Bullet", insert: "- " },
                        { label: "Formula", insert: "$$ E = mc^2 $$" },
                        { label: "Checklist", insert: "- [ ] " },
                      ].map((tool) => (
                        <button
                          key={tool.label}
                          onClick={() => {
                            const newContent = `${currentSheet.content}\n${tool.insert}`;
                            handleUpdateSheet({ content: newContent });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/8 text-[11px] font-mono transition-colors"
                        >
                          {tool.label}
                        </button>
                      ))}
                    </div>

                    {/* Textarea Editor */}
                    <textarea
                      value={currentSheet.content}
                      onChange={(e) => handleUpdateSheet({ content: e.target.value })}
                      placeholder="Start typing your study notes, formulas, or summaries here..."
                      className="w-full h-[400px] bg-white/[0.02] border border-white/8 rounded-2xl p-4 text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-violet-400/50 resize-y transition-colors"
                    />

                    {/* Editor Footer Status */}
                    <div className="flex items-center justify-between text-xs text-wisdom-muted pt-2 border-t border-white/6">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Saved to local browser storage</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{currentSheet.content.length} characters</span>
                        <span>•</span>
                        <span>{currentSheet.content.split(/\s+/).filter(Boolean).length} words</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-16 text-center text-wisdom-muted">
                    Select or create a sheet to begin taking notes.
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
                <TrendingUp className="w-7 h-7 text-amber-400" />
                Exam & Quiz Performance Radar
              </h2>
              <p className="text-sm text-wisdom-muted mt-1 max-w-md mx-auto">
                Automatic grading history, topic-by-topic accuracy, and score trends across all your practice sessions.
              </p>
            </div>

            <StudentAnalyticsDashboard
              userId={userId || "guest"}
              studentName={userName}
            />
          </section>
        )}
      </div>

      {/* ── Quick Selector Modal for Resource Hubs (0 Broken Links) ── */}
      {selectedHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-wisdom-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedHub(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Quick Hub Selector
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                Open {selectedHub.title}
              </h3>
              <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
                {selectedHub.description}
              </p>
            </div>

            {/* Secondary Curriculum Section (Grades 9 to 12) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Secondary School (Grades 9–12)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "9", label: "Grade 9" },
                  { id: "10", label: "Grade 10" },
                  { id: "11", label: "Grade 11" },
                  { id: "12", label: "Grade 12" },
                ].map((g) => (
                  <Link
                    key={g.id}
                    href={`/academy/grades/${g.id}/${selectedHub.id}`}
                    onClick={() => setSelectedHub(null)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sky-400/50 hover:bg-sky-500/10 transition-all text-center group"
                  >
                    <span className="font-bold text-white text-sm group-hover:text-sky-300">
                      {g.label}
                    </span>
                    <span className="text-[10px] text-wisdom-muted mt-0.5">
                      Open {selectedHub.title.split(" ")[0]} →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* University & Entrance Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                University & Special Exams
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <Link
                  href={`/academy/freshman/${selectedHub.id}`}
                  onClick={() => setSelectedHub(null)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all text-center group"
                >
                  <span className="font-bold text-white text-sm group-hover:text-purple-300">
                    Freshman University
                  </span>
                  <span className="text-[10px] text-wisdom-muted mt-0.5">All 17 courses</span>
                </Link>

                <Link
                  href={`/academy/remedial/${selectedHub.id}`}
                  onClick={() => setSelectedHub(null)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all text-center group"
                >
                  <span className="font-bold text-white text-sm group-hover:text-amber-300">
                    Remedial Program
                  </span>
                  <span className="text-[10px] text-wisdom-muted mt-0.5">Catch-up modules</span>
                </Link>

                <Link
                  href={`/academy/uat/${selectedHub.id}`}
                  onClick={() => setSelectedHub(null)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all text-center group"
                >
                  <span className="font-bold text-white text-sm group-hover:text-emerald-300">
                    UAT Entrance
                  </span>
                  <span className="text-[10px] text-wisdom-muted mt-0.5">AAU Aptitude & Math</span>
                </Link>

                <Link
                  href={`/academy/gat/${selectedHub.id}`}
                  onClick={() => setSelectedHub(null)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all text-center group"
                >
                  <span className="font-bold text-white text-sm group-hover:text-cyan-300">
                    GAT Graduate
                  </span>
                  <span className="text-[10px] text-wisdom-muted mt-0.5">Postgraduate entrance</span>
                </Link>

                <Link
                  href={`/academy/coc/${selectedHub.id}`}
                  onClick={() => setSelectedHub(null)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-rose-400/50 hover:bg-rose-500/10 transition-all text-center group"
                >
                  <span className="font-bold text-white text-sm group-hover:text-rose-300">
                    COC Assessment
                  </span>
                  <span className="text-[10px] text-wisdom-muted mt-0.5">Competency certification</span>
                </Link>

                <Link
                  href={`/academy/exit-exam/${selectedHub.id}`}
                  onClick={() => setSelectedHub(null)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-500/10 transition-all text-center group"
                >
                  <span className="font-bold text-white text-sm group-hover:text-yellow-300">
                    Exit Exam
                  </span>
                  <span className="text-[10px] text-wisdom-muted mt-0.5">Graduation testing</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
