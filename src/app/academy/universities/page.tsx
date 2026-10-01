"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  X,
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
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
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-wisdom-cyan/40 cursor-pointer"
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
    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
        <StickyNote className="w-4 h-4" />
        Scholar & Admin Notes
      </p>
      {notes.map((n) => (
        <div key={n.id} className="space-y-1.5 pt-1">
          {n.title && (
            <p className="text-sm font-bold text-white">{n.title}</p>
          )}
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

// ── Detail Modal for University (No Layout Shift, Structured Tabs) ──
function UniversityDetailModal({
  uni,
  notes,
  onClose,
}: {
  uni: University;
  notes: FreeResourceItem[];
  onClose: () => void;
}) {
  type TabKey = "overview" | "academics" | "studentFit" | "notes";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

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
      aria-labelledby="modal-uni-title"
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {uni.abbr}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10">
                <MapPin className="w-3 h-3 text-sky-400" />
                {uni.region}
              </span>
              {uni.featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              )}
            </div>

            <h2 id="modal-uni-title" className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              {uni.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{uni.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {uni.website && uni.website !== "#" && (
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-sky-300 hover:text-white border border-white/10 transition-colors"
              >
                <span>Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
            <Building2 className="w-3.5 h-3.5" />
            <span>Overview & Campuses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("academics")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "academics"
                ? "bg-sky-400 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Strengths & Known For</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("studentFit")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "studentFit"
                ? "bg-sky-400 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Honest Student Fit & Tips</span>
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
          {/* TAB 1: OVERVIEW & CAMPUSES */}
          {activeTab === "overview" && (
            <div className="space-y-5 animate-fade-in">
              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uni.distanceFromAddisKm != null && (
                  <div className="p-3.5 rounded-2xl bg-[#091426] border border-white/10 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Route className="w-3.5 h-3.5 text-amber-400" />
                      Distance
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-white mt-1">
                      {uni.distanceFromAddisKm === 0 ? "In Addis Ababa" : `~${uni.distanceFromAddisKm} km`}
                    </p>
                    <span className="text-[10px] text-slate-400">from Capital</span>
                  </div>
                )}

                {uni.elevationM != null && (
                  <div className="p-3.5 rounded-2xl bg-[#091426] border border-white/10 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Mountain className="w-3.5 h-3.5 text-sky-400" />
                      Elevation
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-white mt-1">
                      ~{uni.elevationM} m
                    </p>
                    <span className="text-[10px] text-slate-400">Above sea level</span>
                  </div>
                )}

                {uni.founded && (
                  <div className="p-3.5 rounded-2xl bg-[#091426] border border-white/10 shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Established
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-white mt-1">
                      {uni.founded}
                    </p>
                    <span className="text-[10px] text-slate-400">Official Founding</span>
                  </div>
                )}
              </div>

              {/* Campuses Breakdown Card */}
              {uni.campuses && (
                <div className="rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-950/30 to-[#0a1324] p-4 sm:p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-2 text-sky-300 font-bold text-sm">
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span>Campus Geography & Organization</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-reading">
                    {uni.campuses}
                  </p>
                </div>
              )}

              {/* Weather & Climate Card */}
              {uni.climate && (
                <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-950/20 to-[#0a1324] p-4 sm:p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-sm">
                    <Thermometer className="w-4 h-4 text-amber-400" />
                    <span>Weather & Living Climate</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-reading">
                    {uni.climate}
                  </p>
                </div>
              )}

              {/* Distance Note */}
              {uni.distanceNote && (
                <div className="p-3.5 rounded-xl border border-white/10 bg-[#060c18] text-xs text-slate-300 leading-relaxed font-reading">
                  <span className="font-bold text-white mr-1.5">Travel Context:</span>
                  {uni.distanceNote}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACADEMICS & STRENGTHS */}
          {activeTab === "academics" && (
            <div className="space-y-5 animate-fade-in">
              {/* Well Known For Tags */}
              {uni.knownFor && uni.knownFor.length > 0 && (
                <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-950/20 to-[#0a1324] p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    Prominent Disciplines & Reputation
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uni.knownFor.map((k) => (
                      <span
                        key={k}
                        className="rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-100 shadow-sm"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic Strengths */}
              <div className="rounded-2xl border border-white/10 bg-[#091426] p-4 sm:p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-sky-400" />
                  Key Academic Strengths
                </h4>
                <ul className="space-y-2.5">
                  {uni.strengths.map((s) => (
                    <li key={s} className="text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed font-reading">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: HONEST STUDENT FIT & TIPS */}
          {activeTab === "studentFit" && (
            <div className="space-y-5 animate-fade-in">
              {/* Student Fit */}
              {uni.studentFit && (
                <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-950/20 to-[#0a1324] p-4 sm:p-5 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Who Thrives Here (Honest Student Fit)
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-reading">
                    {uni.studentFit}
                  </p>
                </div>
              )}

              {/* What to Expect / Campus Life Reality */}
              {uni.whatToExpect && uni.whatToExpect.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#081222] p-4 sm:p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-2 mb-3">
                    <Compass className="w-4 h-4 text-sky-400" />
                    What Campus Life is Actually Like
                  </h4>
                  <ul className="space-y-2.5">
                    {uni.whatToExpect.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-slate-300 leading-relaxed pl-3.5 border-l-2 border-sky-400/40 font-reading"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Insider Tips for Freshmen */}
              {uni.tips && uni.tips.length > 0 && (
                <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-950/20 to-[#0a1324] p-4 sm:p-5 shadow-md">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Insider Tips for Freshmen & New Students
                  </h4>
                  <ul className="space-y-2">
                    {uni.tips.map((tip) => (
                      <li key={tip} className="text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed font-reading">
                        <span className="text-amber-400 mt-1 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            Ethiopian Higher Education Free Directory
          </span>
          <div className="flex items-center gap-2">
            {uni.website && uni.website !== "#" && (
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-300 border border-sky-400/30"
              >
                <span>Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
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
    </div>
  );
}

// ── Uniform Directory Card (Stable Grid, Never Breaks Layout) ──
function UniversityCard({
  uni,
  onOpenGuide,
  notesCount,
}: {
  uni: University;
  onOpenGuide: () => void;
  notesCount: number;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-gradient-to-b from-[#0f1d33] via-[#0a1426] to-[#070e1c] p-5 sm:p-6 transition-all duration-300 hover:border-sky-400/50 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        {/* Header badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {uni.abbr}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {uni.region}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {uni.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
            {notesCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <StickyNote className="w-3 h-3" />
                {notesCount}
              </span>
            )}
          </div>
        </div>

        {/* Title & Location */}
        <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
          {uni.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-400" />
          <span>{uni.location}</span>
        </p>

        {/* Quick Stats Pill Strip */}
        <div className="mt-3.5 flex flex-wrap gap-1.5 text-[11px]">
          {uni.distanceFromAddisKm != null && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#060b16] px-2 py-1 text-slate-300 font-medium">
              <Route className="w-3 h-3 text-amber-400 shrink-0" />
              {uni.distanceFromAddisKm === 0 ? "Addis" : `~${uni.distanceFromAddisKm} km`}
            </span>
          )}
          {uni.elevationM != null && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#060b16] px-2 py-1 text-slate-300 font-medium">
              <Mountain className="w-3 h-3 text-sky-400 shrink-0" />
              ~{uni.elevationM}m
            </span>
          )}
          {uni.founded && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#060b16] px-2 py-1 text-slate-300 font-medium">
              Est. {uni.founded}
            </span>
          )}
        </div>

        {/* Known For Tags Preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(uni.knownFor ?? uni.strengths).slice(0, 3).map((k) => (
            <span
              key={k}
              className="rounded-lg border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-300 font-medium"
            >
              {k}
            </span>
          ))}
        </div>

        {/* Student fit snippet */}
        {uni.studentFit && (
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {uni.studentFit}
          </p>
        )}
      </div>

      {/* Action Button - Opens Clean Detail Modal without shifting grid */}
      <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenGuide}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-sky-500/20 hover:bg-sky-400 hover:text-slate-950 text-sky-300 border border-sky-400/40 transition-all shadow-md group-hover:bg-sky-400 group-hover:text-slate-950 cursor-pointer"
        >
          <span>Explore University Guide</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

function UniversitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [region, setRegion] = useState<Region | "all">("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showDetailedOnly, setShowDetailedOnly] = useState(false);
  const [allNotes, setAllNotes] = useState<FreeResourceItem[]>([]);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);

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

  // Sync initial ?uni=id param if present
  useEffect(() => {
    const uniParam = searchParams.get("uni");
    if (uniParam) {
      const found = universities.find(
        (u) => u.id.toLowerCase() === uniParam.toLowerCase() || u.abbr.toLowerCase() === uniParam.toLowerCase()
      );
      if (found) setSelectedUni(found);
    }
  }, [searchParams]);

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

        <header className="mb-8 md:mb-12">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-2">
            Free resource
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Ethiopian </span>
            <span className="text-sky-400">Universities Directory</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed font-reading">
            {universitiesIntro.subtitle}. Authentic guides, student fit, weather, and campus realities before you pick.
          </p>
          <UniversityNbCard />

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1424] border border-white/10 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              {universities.length} Institutions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1424] border border-white/10 text-slate-300 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-violet-300" />
              {detailedCount} In-Depth Guides
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1424] border border-white/10 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              All 10+ Regions
            </span>
          </div>
        </header>

        {/* Filter and Search Bar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region | "all")}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-white/15 bg-[#091322] text-white focus:outline-none focus:border-sky-400 flex-1 sm:flex-none cursor-pointer"
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFeaturedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                showFeaturedOnly
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-[#091322] border-white/12 text-slate-300 hover:border-white/20"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Featured
            </button>

            <button
              type="button"
              onClick={() => setShowDetailedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                showDetailedOnly
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-[#091322] border-white/12 text-slate-300 hover:border-white/20"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Detailed Guides
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                searchOpen || query
                  ? "border-sky-400/40 bg-sky-500/20 text-sky-300"
                  : "border-white/12 bg-[#091322] text-slate-300 hover:border-white/25"
              }`}
              aria-label="Toggle Search"
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
                placeholder="Search by university name, abbr (AAU, ASTU...), or city..."
                autoFocus
                className="w-full rounded-xl border border-white/15 bg-[#091322] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Stable Grid of University Cards (Zero Grid Layout Shifts) */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#091322]/80 px-6 py-14 text-center">
            <p className="text-white font-bold mb-1">No universities found</p>
            <p className="text-xs text-slate-400">Try adjusting your search terms or clearing the region filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((uni) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                notesCount={notesByUni[uni.id]?.length || 0}
                onOpenGuide={() => setSelectedUni(uni)}
              />
            ))}
          </div>
        )}

        {/* Full Detail Modal / Sheet */}
        {selectedUni && (
          <UniversityDetailModal
            uni={selectedUni}
            notes={notesByUni[selectedUni.id] || []}
            onClose={() => setSelectedUni(null)}
          />
        )}

        <div className="mt-12 text-center">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Academy Free Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading Universities Directory...
        </div>
      }
    >
      <UniversitiesContent />
    </Suspense>
  );
}
