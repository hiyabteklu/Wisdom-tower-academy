"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  BookOpen,
  ChevronDown,
  Globe2,
  GraduationCap,
  Scale,
  Search,
  ThumbsDown,
  ThumbsUp,
  Layers,
  StickyNote,
  X,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  departmentCategories,
  departments,
  type Department,
  type DepartmentCategory,
  type DepartmentCategoryId,
} from "@/data/departments";
import {
  listFreeResourceItems,
  type FreeResourceItem,
} from "@/lib/free-resources";
import { simpleMarkdownToHtml } from "@/lib/format-content";

function categoryMeta(id: DepartmentCategoryId): DepartmentCategory {
  return (
    departmentCategories.find((c) => c.id === id) || {
      id,
      label: "Academic Field",
      blurb: "Undergraduate curriculum and career guidance.",
      accent: "text-sky-300",
      border: "hover:border-sky-400/40",
      badge: "border-sky-400/30 bg-sky-500/15 text-sky-200",
      glow: "from-sky-500/20",
    }
  );
}

function AdminNotesBlock({ notes }: { notes: FreeResourceItem[] }) {
  if (!notes.length) return null;
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
        <StickyNote className="w-4 h-4" />
        Faculty & Scholar Notes
      </p>
      {notes.map((n) => (
        <div key={n.id} className="space-y-1.5 pt-1">
          {n.title && <p className="text-sm font-bold text-white">{n.title}</p>}
          {n.bodyMd && (
            <div
              className="formatted-body text-sm text-slate-200 leading-relaxed font-reading"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(n.bodyMd) }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Detail Modal for Department (No Layout Shifts, Tabbed Structure) ──
function DepartmentDetailModal({
  dept,
  notes,
  onClose,
}: {
  dept: Department;
  notes: FreeResourceItem[];
  onClose: () => void;
}) {
  type TabKey = "overview" | "careers" | "fit" | "notes";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const cat = categoryMeta(dept.category);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-dept-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-sky-400/30 bg-gradient-to-b from-[#0e1a30] via-[#091222] to-[#060b16] shadow-2xl overflow-hidden text-white animate-scale-up">
        {/* Sticky Native Header */}
        <div className="shrink-0 p-5 sm:p-6 border-b border-white/10 bg-[#0c172b]/95 backdrop-blur-lg flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${cat.badge}`}
              >
                {cat.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {dept.durationYears}
              </span>
              {dept.shortName && (
                <span className="text-xs font-mono font-bold text-slate-400">
                  [{dept.shortName}]
                </span>
              )}
            </div>

            <h2 id="modal-dept-title" className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              {dept.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Structure Tabs */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2 border-b border-white/10 bg-[#080f1d] flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "overview"
                ? "bg-sky-400 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Field Overview & Courses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("careers")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "careers"
                ? "bg-sky-400 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Careers & Market Reality</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fit")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "fit"
                ? "bg-sky-400 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Strengths & Trade-offs</span>
          </button>

          {notes.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "notes"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md"
                  : "text-amber-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notes ({notes.length})</span>
            </button>
          )}
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: OVERVIEW & COURSES */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-fade-in">
              {/* What the Field Actually Is */}
              <div className="rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-950/25 to-[#091324] p-5 shadow-md">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300 mb-2.5">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  What This Field Actually Demands
                </h4>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-reading">
                  {dept.about}
                </p>
              </div>

              {/* Core Courses / Study Areas */}
              <div className="rounded-2xl border border-white/10 bg-[#091426] p-5">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Core Coursework & Foundational Modules
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dept.courses.map((c) => (
                    <span
                      key={c}
                      className="rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-200 shadow-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAREERS & MARKET REALITY */}
          {activeTab === "careers" && (
            <div className="space-y-5 animate-fade-in">
              {/* After Graduation Career Roles */}
              <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-950/20 to-[#091324] p-5">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Career Paths & Job Roles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dept.careers.map((job) => (
                    <div
                      key={job}
                      className="flex items-start gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{job}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ethiopian & Global Market Reality */}
              <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-950/20 to-[#091324] p-5 shadow-md">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300 mb-2.5">
                  <Globe2 className="w-4 h-4 text-violet-400" />
                  Opportunities & Ethiopian Market Reality
                </h4>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-reading">
                  {dept.market}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FIT, STRENGTHS & TRADE-OFFS */}
          {activeTab === "fit" && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths Card */}
                <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/30 to-[#081220] p-4 sm:p-5 shadow-md">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    Key Strengths & Upsides
                  </h4>
                  <ul className="space-y-2.5">
                    {dept.pros.map((p) => (
                      <li key={p} className="text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2 font-reading">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">+</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trade-offs Card */}
                <div className="rounded-2xl border border-rose-400/30 bg-gradient-to-br from-rose-950/30 to-[#081220] p-4 sm:p-5 shadow-md">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300 mb-3">
                    <ThumbsDown className="w-4 h-4 text-rose-400" />
                    Trade-offs & Realities
                  </h4>
                  <ul className="space-y-2.5">
                    {dept.cons.map((c) => (
                      <li key={c} className="text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2 font-reading">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">−</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN / SCHOLAR NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-4 animate-fade-in">
              <AdminNotesBlock notes={notes} />
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-white/10 bg-[#080f1d] flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Ethiopian Academic Field & Career Guide
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Uniform Directory Card (Stable Grid, Never Breaks Layout) ──
function DepartmentCard({
  dept,
  onOpenGuide,
  notesCount,
}: {
  dept: Department;
  onOpenGuide: () => void;
  notesCount: number;
}) {
  const cat = categoryMeta(dept.category);

  return (
    <article className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-gradient-to-b from-[#0f1d33] via-[#0a1426] to-[#070e1c] p-5 sm:p-6 transition-all duration-300 hover:border-sky-400/50 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cat.badge}`}
          >
            {cat.label}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
              <Clock className="w-3 h-3 text-sky-400" />
              {dept.durationYears}
            </span>
            {notesCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <StickyNote className="w-3 h-3" />
                {notesCount}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
          {dept.name}
        </h3>

        {/* About Snippet */}
        <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {dept.about}
        </p>

        {/* Careers Preview Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dept.careers.slice(0, 3).map((job) => (
            <span
              key={job}
              className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-300 font-medium truncate max-w-[200px]"
            >
              {job}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button - Opens Modal Cleanly */}
      <div className="mt-5 pt-3.5 border-t border-white/10">
        <button
          type="button"
          onClick={onOpenGuide}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-sky-500/20 hover:bg-sky-400 hover:text-slate-950 text-sky-300 border border-sky-400/40 transition-all shadow-md group-hover:bg-sky-400 group-hover:text-slate-950 cursor-pointer"
        >
          <span>Explore Field & Careers</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

function DepartmentsContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<DepartmentCategoryId | "all">("all");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [allNotes, setAllNotes] = useState<FreeResourceItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { items } = await listFreeResourceItems({
        pageSlug: "departments",
        publishedOnly: true,
      });
      if (!cancelled) setAllNotes(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync initial ?dept=id param if present
  useEffect(() => {
    const deptParam = searchParams.get("dept");
    if (deptParam) {
      const found = departments.find(
        (d) =>
          d.id.toLowerCase() === deptParam.toLowerCase() ||
          d.shortName?.toLowerCase() === deptParam.toLowerCase()
      );
      if (found) setSelectedDept(found);
    }
  }, [searchParams]);

  const notesByDept = useMemo(() => {
    const map: Record<string, FreeResourceItem[]> = {};
    for (const n of allNotes) {
      const id = String(n.meta?.departmentId ?? "");
      if (!id) {
        if (!map["_page"]) map["_page"] = [];
        map["_page"].push(n);
        continue;
      }
      if (!map[id]) map[id] = [];
      map[id].push(n);
    }
    return map;
  }, [allNotes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return departments.filter((d) => {
      if (activeCat !== "all" && d.category !== activeCat) return false;
      if (!q) return true;
      const hay = `${d.name} ${d.shortName} ${d.about} ${d.careers.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCat]);

  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-teal-500/25 via-cyan-500/10 to-transparent" />
        <div className="absolute bottom-1/4 right-0 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-15 bg-gradient-to-br from-violet-500/20 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-8 md:mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-2">
            Free resource
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Department </span>
            <span className="text-teal-300">Field Guides</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            What competitive undergraduate fields actually demand: real coursework, career roles,
            market demand in Ethiopia, and the trade-offs nobody puts on the official brochure.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-teal-300 font-semibold inline-flex items-center gap-2">
            <Scale className="w-4 h-4" />
            {departments.length} Academic Fields & Engineering Streams
          </p>
        </header>

        {/* Filter & Search Bar */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1 scrollbar-thin min-w-0">
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                  activeCat === "all"
                    ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-200"
                    : "border-white/10 bg-[#091322] text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                All Fields
              </button>
              {departmentCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                    activeCat === c.id
                      ? c.badge
                      : "border-white/10 bg-[#091322] text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                searchOpen || query
                  ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                  : "border-white/12 bg-[#091322] text-slate-400 hover:border-white/25 hover:text-white"
              }`}
              aria-label="Toggle Search"
              aria-expanded={searchOpen}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {searchOpen && (
            <div className="relative animate-fade-in">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search departments, careers, skills..."
                autoFocus
                className="w-full rounded-xl border border-white/15 bg-[#091322] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Stable Grid of Department Cards (Zero Layout Shift) */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#091322]/80 px-6 py-14 text-center">
            <p className="text-white font-bold mb-1">No fields match your search</p>
            <p className="text-xs text-slate-400">Try another keyword or select All categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((dept) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                notesCount={(notesByDept[dept.id] || []).length}
                onOpenGuide={() => setSelectedDept(dept)}
              />
            ))}
          </div>
        )}

        {/* Full Detail Modal / Sheet */}
        {selectedDept && (
          <DepartmentDetailModal
            dept={selectedDept}
            notes={[...(notesByDept[selectedDept.id] || []), ...(notesByDept["_page"] || [])]}
            onClose={() => setSelectedDept(null)}
          />
        )}

        <div className="mt-12 text-center">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 hover:text-teal-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Academy Free Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading Department Field Guides...
        </div>
      }
    >
      <DepartmentsContent />
    </Suspense>
  );
}
