"use client";

import { useEffect, useMemo, useState } from "react";
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
  Route,
  Mountain,
  Target,
  BookOpen,
  StickyNote,
  Eye,
  EyeOff,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  universities,
  universitiesIntro,
  regions,
  type University,
  type Region,
} from "@/data/universities";
import {
  listFreeResourceItems,
  type FreeResourceItem,
} from "@/lib/free-resources";
import { simpleMarkdownToHtml } from "@/lib/format-content";

function UniversityNbCard() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mt-5 max-w-2xl rounded-2xl border border-wisdom-cyan/25 bg-wisdom-card/90 shadow-card-3d overflow-hidden"
      data-wta-intro="nb"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/40"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-wisdom-cyan/30 bg-wisdom-cyan/15 text-wisdom-cyan text-xs font-extrabold tracking-wide">
            NB
          </span>
          <span className="text-sm font-semibold text-white/90">
            Read this before you choose
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-wisdom-cyan/90 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-white/8 pt-4 space-y-3 text-[15px] text-wisdom-muted leading-relaxed font-reading">
            {universitiesIntro.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            <p className="text-white/75 italic border-l-2 border-wisdom-cyan/40 pl-3">
              {universitiesIntro.closing}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminNotesBlock({ notes }: { notes: FreeResourceItem[] }) {
  if (!notes.length) return null;
  return (
    <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 flex items-center gap-2">
        <StickyNote className="w-3.5 h-3.5" />
        Extra notes
      </p>
      {notes.map((n) => (
        <div key={n.id} className="space-y-1">
          {n.title && (
            <p className="text-sm font-semibold text-white/90">{n.title}</p>
          )}
          {n.bodyMd && (
            <div
              className="formatted-body text-sm text-wisdom-muted leading-relaxed font-reading"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(n.bodyMd) }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function UniversityCard({
  uni,
  expanded,
  onToggle,
  notes,
}: {
  uni: University;
  expanded: boolean;
  onToggle: () => void;
  notes: FreeResourceItem[];
}) {
  return (
    <article
      className={`card-3d group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out
        ${
          expanded
            ? "is-expanded border-wisdom-cyan/40 bg-wisdom-card shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)] md:col-span-2"
            : "border-white/12 bg-wisdom-card/90 hover:border-wisdom-cyan/25 hover:bg-wisdom-card hover:-translate-y-0.5"
        }`}
    >
      <div className="w-full text-left p-5 sm:p-6">
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/50 rounded-xl"
          aria-expanded={expanded}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-wisdom-cyan/15 text-wisdom-cyan border border-wisdom-cyan/25">
                  {uni.abbr}
                </span>
                {uni.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {uni.detailed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-violet-500/15 text-violet-300 border border-violet-500/25">
                    Full guide
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
              className={`shrink-0 p-2 rounded-xl border border-white/10 bg-wisdom-dark/40 text-wisdom-muted transition-transform duration-300 ${
                expanded ? "rotate-180 text-wisdom-cyan border-wisdom-cyan/30" : ""
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>

          {!expanded && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(uni.knownFor ?? uni.strengths).slice(0, 3).map((k) => (
                <span
                  key={k}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-wisdom-muted"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
        </button>

        {uni.website && uni.website !== "#" && (
          <a
            href={uni.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-wisdom-cyan/80 hover:text-wisdom-cyan"
          >
            <ExternalLink className="w-3 h-3" />
            Official site
          </a>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={onToggle}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300
              ${
                expanded
                  ? "border border-white/15 bg-wisdom-dark/60 text-white hover:border-white/25"
                  : "bg-wisdom-cyan text-wisdom-dark shadow-[0_0_24px_-6px_rgba(34,211,238,0.55)] hover:brightness-110"
              }`}
          >
            {expanded ? (
              <>
                <EyeOff className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                View more
              </>
            )}
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-white/8 pt-5">
            {(uni.distanceFromAddisKm != null || uni.elevationM != null) && (
              <div className="flex flex-wrap gap-3 text-xs">
                {uni.distanceFromAddisKm != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-wisdom-dark/50 px-2.5 py-1.5 text-wisdom-muted">
                    <Route className="w-3.5 h-3.5 text-amber-300" />
                    {uni.distanceFromAddisKm === 0
                      ? "In Addis Ababa"
                      : `~${uni.distanceFromAddisKm} km from Addis`}
                  </span>
                )}
                {uni.elevationM != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-wisdom-dark/50 px-2.5 py-1.5 text-wisdom-muted">
                    <Mountain className="w-3.5 h-3.5 text-sky-300" />
                    ~{uni.elevationM} m elevation
                  </span>
                )}
                {uni.founded && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-wisdom-dark/50 px-2.5 py-1.5 text-wisdom-muted">
                    Est. {uni.founded}
                  </span>
                )}
              </div>
            )}

            {uni.campuses && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Campuses</p>
                  <p className="text-sm text-wisdom-muted leading-relaxed font-reading">{uni.campuses}</p>
                </div>
              </div>
            )}

            {uni.climate && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Weather and climate</p>
                  <p className="text-sm text-wisdom-muted leading-relaxed font-reading">{uni.climate}</p>
                </div>
              </div>
            )}

            {uni.knownFor && uni.knownFor.length > 0 && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">Well known for</p>
                  <div className="flex flex-wrap gap-2">
                    {uni.knownFor.map((k) => (
                      <span
                        key={k}
                        className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-100"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <div className="shrink-0 p-2 rounded-xl bg-wisdom-cyan/10 border border-wisdom-cyan/20 text-wisdom-cyan">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">Strengths</p>
                <ul className="space-y-1.5">
                  {uni.strengths.map((s) => (
                    <li key={s} className="text-sm text-wisdom-muted flex gap-2 leading-relaxed font-reading">
                      <span className="text-wisdom-cyan mt-1.5 shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {uni.whatToExpect.length > 0 && (
              <div className="rounded-xl bg-wisdom-dark/60 border border-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                  What campus life is like
                </p>
                <ul className="space-y-2">
                  {uni.whatToExpect.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-wisdom-muted leading-relaxed pl-3 border-l-2 border-wisdom-cyan/25 font-reading"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uni.studentFit && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">Who thrives here</p>
                  <p className="text-sm text-wisdom-muted leading-relaxed font-reading">{uni.studentFit}</p>
                </div>
              </div>
            )}

            {uni.tips && uni.tips.length > 0 && (
              <div className="flex gap-3">
                <div className="shrink-0 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">Tips for new students</p>
                  <ul className="space-y-1.5">
                    {uni.tips.map((tip) => (
                      <li key={tip} className="text-sm text-wisdom-muted flex gap-2 leading-relaxed font-reading">
                        <span className="text-amber-300/80 mt-1.5 shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {uni.distanceNote && (
              <p className="text-xs text-wisdom-muted/80 border-t border-white/8 pt-3 font-reading">{uni.distanceNote}</p>
            )}

            <AdminNotesBlock notes={notes} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function UniversitiesPage() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [region, setRegion] = useState<Region | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showDetailedOnly, setShowDetailedOnly] = useState(false);
  const [allNotes, setAllNotes] = useState<FreeResourceItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { items } = await listFreeResourceItems({
        pageSlug: "universities",
        publishedOnly: true,
      });
      if (!cancelled) setAllNotes(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const notesByUni = useMemo(() => {
    const map: Record<string, FreeResourceItem[]> = {};
    for (const n of allNotes) {
      const id = String(n.meta?.universityId ?? "");
      if (!id) continue;
      if (!map[id]) map[id] = [];
      map[id].push(n);
    }
    return map;
  }, [allNotes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return universities.filter((u) => {
      if (showFeaturedOnly && !u.featured) return false;
      if (showDetailedOnly && !u.detailed) return false;
      if (region !== "all" && u.region !== region) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.abbr.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.region.toLowerCase().includes(q) ||
        u.strengths.some((s) => s.toLowerCase().includes(q)) ||
        (u.knownFor?.some((s) => s.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [query, region, showFeaturedOnly, showDetailedOnly]);

  const detailedCount = universities.filter((u) => u.detailed).length;

  return (
    <div className="relative min-h-screen" data-scroll-zoom-skip>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-14">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">
            Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Ethiopian </span>
            <span className="text-wisdom-cyan">Universities</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed font-reading">
            {universitiesIntro.subtitle}
          </p>
          <UniversityNbCard />
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Building2 className="w-3.5 h-3.5 text-wisdom-cyan" />
              {universities.length} institutions
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <BookOpen className="w-3.5 h-3.5 text-violet-300" />
              {detailedCount} full guides
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              All regions
            </span>
          </div>
        </header>

        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region | "all")}
              className="field-input py-2.5 text-sm min-w-[120px] flex-1 sm:flex-none"
            >
              <option value="all">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowFeaturedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                showFeaturedOnly
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                  : "bg-wisdom-card border-white/12 text-wisdom-muted hover:border-white/20"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Featured
            </button>
            <button
              type="button"
              onClick={() => setShowDetailedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                showDetailedOnly
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-200"
                  : "bg-wisdom-card border-white/12 text-wisdom-muted hover:border-white/20"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Guides
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                searchOpen || query
                  ? "border-wisdom-cyan/40 bg-wisdom-cyan/15 text-wisdom-cyan"
                  : "border-white/12 bg-wisdom-card text-wisdom-muted hover:border-white/25"
              }`}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          {searchOpen && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-wisdom-muted pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search universities…"
                autoFocus
                className="w-full rounded-xl border border-white/12 bg-wisdom-card pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-wisdom-muted/70 focus:outline-none focus:border-wisdom-cyan/50 focus:ring-2 focus:ring-wisdom-cyan/15"
              />
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-wisdom-card/60 px-6 py-14 text-center">
            <p className="text-white/80 font-medium mb-1">No universities match</p>
            <p className="text-sm text-wisdom-muted">Try another keyword or clear filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {filtered.map((uni) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                expanded={expandedId === uni.id}
                onToggle={() => setExpandedId((id) => (id === uni.id ? null : uni.id))}
                notes={notesByUni[uni.id] || []}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 text-sm text-wisdom-cyan hover:text-wisdom-cyan/80"
          >
            Back to Academy
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
