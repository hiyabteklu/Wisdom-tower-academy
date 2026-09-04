"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  departmentCategories,
  departments,
  type Department,
  type DepartmentCategory,
  type DepartmentCategoryId,
} from "@/data/departments";

function categoryMeta(id: DepartmentCategoryId): DepartmentCategory {
  return departmentCategories.find((c) => c.id === id)!;
}

function DepartmentCard({
  dept,
  expanded,
  onToggle,
}: {
  dept: Department;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cat = categoryMeta(dept.category);

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-500 ease-out
        ${
          expanded
            ? `border-white/25 bg-wisdom-card shadow-[0_0_48px_-16px_rgba(34,211,238,0.25)] md:col-span-2`
            : `border-white/12 bg-wisdom-card/90 ${cat.border} hover:-translate-y-0.5 hover:shadow-lg`
        }`}
    >
      <div
        className={`pointer-events-none absolute -top-24 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${cat.glow} to-transparent blur-3xl opacity-60 transition-opacity duration-500 ${
          expanded ? "opacity-90" : "group-hover:opacity-80"
        }`}
        aria-hidden
      />

      <button
        type="button"
        onClick={onToggle}
        className="relative w-full text-left p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 rounded-2xl"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span
                className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cat.badge}`}
              >
                {cat.label}
              </span>
              <span className="text-[11px] font-medium text-wisdom-muted">
                {dept.durationYears}
              </span>
            </div>
            <h3
              className={`font-display text-lg sm:text-xl font-bold text-white leading-snug transition-colors ${cat.accent}`}
            >
              {dept.name}
            </h3>
            {!expanded && (
              <p className="mt-2 text-sm text-wisdom-muted leading-relaxed line-clamp-2">
                {dept.about}
              </p>
            )}
          </div>
          <div
            className={`shrink-0 p-2 rounded-xl border border-white/10 bg-wisdom-dark/50 text-wisdom-muted transition-all duration-300
              ${expanded ? "rotate-180 text-cyan-300 border-cyan-400/30" : "group-hover:text-white"}`}
          >
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative px-5 sm:px-6 pb-6 sm:pb-7 space-y-6 border-t border-white/8 pt-5">
            <section>
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-wisdom-muted mb-2">
                <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                What the field is
              </h4>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed">{dept.about}</p>
            </section>

            <section>
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-wisdom-muted mb-3">
                <Layers className="w-3.5 h-3.5 text-amber-300" />
                Core study areas
              </h4>
              <ul className="flex flex-wrap gap-2">
                {dept.courses.map((c) => (
                  <li
                    key={c}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs sm:text-sm text-white/80"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-wisdom-muted mb-3">
                <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
                After graduation
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2">
                {dept.careers.map((job) => (
                  <li
                    key={job}
                    className="flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/5 px-3 py-2 text-sm text-white/85"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {job}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-wisdom-muted mb-2">
                <Globe2 className="w-3.5 h-3.5 text-violet-300" />
                Opportunities & market
              </h4>
              <p className="text-sm sm:text-[15px] text-white/80 leading-relaxed">{dept.market}</p>
            </section>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300/90 mb-3">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {dept.pros.map((p) => (
                    <li key={p} className="text-sm text-white/80 leading-snug flex gap-2">
                      <span className="text-emerald-400/80 shrink-0">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
                <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300/90 mb-3">
                  <ThumbsDown className="w-3.5 h-3.5" />
                  Trade-offs
                </h4>
                <ul className="space-y-2">
                  {dept.cons.map((c) => (
                    <li key={c} className="text-sm text-white/80 leading-snug flex gap-2">
                      <span className="text-rose-400/80 shrink-0">−</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DepartmentsPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<DepartmentCategoryId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

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
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-teal-500/25 via-cyan-500/10 to-transparent" />
        <div className="absolute bottom-1/4 right-0 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-violet-500/20 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-12 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-teal-400/30 bg-wisdom-card text-teal-300">
              <GraduationCap className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Field guides · Choose with eyes open
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-teal-300">Department</span> info
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            What competitive undergraduate fields actually demand — coursework, jobs, market
            reality, and the trade-offs nobody puts on the brochure.
          </p>
          <p className="mt-3 text-sm text-teal-300/90 font-medium inline-flex items-center gap-2">
            <Scale className="w-4 h-4" />
            {departments.length} fields · expand any card for the full guide
          </p>
        </header>

        <div className="sticky top-[4.25rem] z-30 -mx-1 px-1 mb-8 space-y-3">
          <div className="rounded-2xl border border-white/12 bg-wisdom-dark/90 backdrop-blur-md p-2 sm:p-2.5 shadow-lg shadow-black/20">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-wisdom-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fields, careers, keywords…"
                className="w-full rounded-xl border border-white/10 bg-wisdom-card/80 pl-10 pr-4 py-3 text-sm text-white placeholder:text-wisdom-muted/70 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveCat("all")}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                activeCat === "all"
                  ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 bg-wisdom-card/60 text-wisdom-muted hover:border-white/20 hover:text-white"
              }`}
            >
              All
            </button>
            {departmentCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  activeCat === c.id
                    ? c.badge
                    : "border-white/10 bg-wisdom-card/60 text-wisdom-muted hover:border-white/20 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {activeCat !== "all" && (
          <p className="mb-6 text-sm text-wisdom-muted max-w-2xl leading-relaxed">
            {categoryMeta(activeCat).blurb}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/60 px-6 py-14 text-center">
            <p className="text-white/80 font-medium mb-1">No fields match</p>
            <p className="text-sm text-wisdom-muted">Try another keyword or clear the category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filtered.map((dept) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                expanded={openId === dept.id}
                onToggle={() => setOpenId((id) => (id === dept.id ? null : dept.id))}
              />
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-wisdom-muted/80 max-w-lg mx-auto leading-relaxed">
          Guides describe typical undergraduate patterns. Exact curricula, duration, and licensing
          rules differ by institution and country — always verify with the program you apply to.
        </p>
      </div>
    </div>
  );
}
