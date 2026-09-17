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

// NOTE: rest of file kept minimal for restore — full UniversityCard + page body
export default function UniversitiesPage() {
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
          </div>
        </header>
        <p className="text-wisdom-muted text-sm">
          Loading full university cards… If this message stays, the page body needs a full restore.
        </p>
      </div>
    </div>
  );
}
