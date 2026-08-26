"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ExternalLink,
  Building2,
  Thermometer,
  GraduationCap,
  Lightbulb,
  ChevronDown,
  Filter,
  Star,
  ArrowRight,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  universities,
  regions,
  type University,
  type Region,
} from "@/data/universities";

function UniversityCard({ uni, expanded, onToggle }: { uni: University; expanded: boolean; onToggle: () => void }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-400
        ${expanded
          ? "border-wisdom-cyan/40 bg-wisdom-card shadow-glow"
          : "border-white/12 bg-wisdom-card/90 hover:border-wisdom-cyan/25 hover:bg-wisdom-card"
        }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/50 rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide bg-wisdom-cyan/15 text-wisdom-cyan border border-wisdom-cyan/25">
                {uni.abbr}
              </span>
              {uni.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
              <span className="text-xs text-wisdom-muted">{uni.region}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-wisdom-cyan transition-colors leading-snug">
              {uni.name}
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-wisdom-muted">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-wisdom-cyan/70" />
              <span className="truncate">{uni.location}</span>
            </p>
          </div>
          <div
            className={`shrink-0 p-2 rounded-xl border border-white/10 bg-wisdom-dark/50 text-wisdom-muted transition-transform duration-300
              ${expanded ? "rotate-180 text-wisdom-cyan border-wisdom-cyan/30" : "group-hover:text-wisdom-cyan"}`}
          >
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {!expanded && uni.strengths.length > 0 && (
          <p className="mt-3 text-sm text-wisdom-muted/90 line-clamp-2 leading-relaxed">
            {uni.strengths[0]}
          </p>
        )}
      </button>

      <div
        className={`grid transition-all duration-400 ease-spring
          ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-white/8 pt-5">
            {uni.founded && (
              <p className="text-xs text-wisdom-muted">
                Established <span className="text-white/80 font-medium">{uni.founded}</span>
              </p>
            )}

            {uni.campuses && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-300/90 mb-1">Campuses</p>
                  <p className="text-sm text-wisdom-muted leading-relaxed">{uni.campuses}</p>
                </div>
              </div>
            )}

            {uni.climate && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1">Climate</p>
                  <p className="text-sm text-wisdom-muted leading-relaxed">{uni.climate}</p>
                </div>
              </div>
            )}

            {uni.strengths.length > 0 && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-wisdom-cyan/10 border border-wisdom-cyan/20 text-wisdom-cyan">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-cyan/90 mb-2">Strengths</p>
                  <ul className="space-y-1.5">
                    {uni.strengths.map((s) => (
                      <li key={s} className="text-sm text-wisdom-muted flex gap-2 leading-relaxed">
                        <span className="text-wisdom-cyan mt-1.5 shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {uni.whatToExpect.length > 0 && (
              <div className="rounded-xl bg-wisdom-dark/60 border border-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-wisdom-cyan" />
                  What to expect
                </p>
                <ul className="space-y-2">
                  {uni.whatToExpect.map((item) => (
                    <li key={item} className="text-sm text-wisdom-muted leading-relaxed pl-3 border-l-2 border-wisdom-cyan/25">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uni.tips && uni.tips.length > 0 && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">Tips for new students</p>
                  <ul className="space-y-1.5">
                    {uni.tips.map((t) => (
                      <li key={t} className="text-sm text-wisdom-muted leading-relaxed">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <a
              href={uni.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-wisdom-cyan/15 border border-wisdom-cyan/30 text-wisdom-cyan text-sm font-semibold
                hover:bg-wisdom-cyan/25 hover:border-wisdom-cyan/50 transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              Official website
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function UniversitiesPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return universities.filter((u) => {
      if (showFeaturedOnly && !u.featured) return false;
      if (region !== "all" && u.region !== region) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.abbr.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.region.toLowerCase().includes(q) ||
        u.strengths.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [query, region, showFeaturedOnly]);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[28rem] h-[28rem] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-wisdom-cyan/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-14 animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-teal-300/90 mb-3">
            Wisdom Tower Academy · Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Ethiopian </span>
            <span className="text-wisdom-cyan">Universities</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            Practical guides for public universities — campuses, climate, strengths, and what life on
            campus is really like. No outdated prices. Official links included.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Building2 className="w-3.5 h-3.5 text-wisdom-cyan" />
              {universities.length}+ institutions
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              All regions
            </span>
          </div>
        </header>

        <div className="sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 mb-8
          bg-wisdom-dark/85 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-wisdom-muted" />
              <input
                type="search"
                placeholder="Search by name, abbreviation, city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="field-input pl-10 py-3 text-sm"
                aria-label="Search universities"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-wisdom-muted pointer-events-none" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region | "all")}
                  className="field-input pl-9 pr-8 py-3 text-sm appearance-none cursor-pointer min-w-[160px]"
                  aria-label="Filter by region"
                >
                  <option value="all">All regions</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowFeaturedOnly((v) => !v)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all
                  ${showFeaturedOnly
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                    : "bg-wisdom-card border-white/12 text-wisdom-muted hover:border-white/25"
                  }`}
              >
                <Star className="w-3.5 h-3.5" />
                Featured
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-wisdom-muted">
            Showing <span className="text-white font-medium">{filtered.length}</span> of{" "}
            {universities.length}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-white/10 bg-wisdom-card/50">
            <p className="text-wisdom-muted mb-2">No universities match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRegion("all");
                setShowFeaturedOnly(false);
              }}
              className="text-wisdom-cyan text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 stagger-children">
            {filtered.map((uni) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                expanded={expandedId === uni.id}
                onToggle={() => setExpandedId((id) => (id === uni.id ? null : uni.id))}
              />
            ))}
          </div>
        )}

        <div className="mt-14 md:mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/10 via-wisdom-card to-wisdom-card p-8 md:p-10 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-3">Planning your next step?</h2>
          <p className="text-wisdom-muted max-w-lg mx-auto mb-6 leading-relaxed">
            Placement depends on your UAT/entrance results and program choices. Use this guide to
            understand climate, campuses, and culture — then verify the latest details on each
            university's official site.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/academy/uat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark transition-colors"
            >
              UAT preparation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium hover:border-white/30 transition-colors"
            >
              Back to Academy
            </Link>
          </div>
          <p className="mt-8 text-[11px] text-wisdom-muted/70 max-w-md mx-auto">
            Info compiled from public sources and student-oriented guides. Living costs and schedules
            change — always check the official website and registrar for current details.
          </p>
        </div>
      </div>
    </div>
  );
}
