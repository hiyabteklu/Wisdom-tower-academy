"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, MapPin, ExternalLink, Building2, Thermometer, GraduationCap,
  Lightbulb, ChevronDown, Star, ArrowRight, Target, BookOpen, Loader2,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  universities as staticUniversities,
  regions,
  type University,
  type Region,
} from "@/data/universities";
import {
  getFreeResourcePage,
  listFreeResourceItems,
  freeResourcePublicUrl,
  type FreeResourcePage,
  type FreeResourceItem,
} from "@/lib/free-resources";
import { toLines, unescapeText } from "@/lib/format-content";
import FormattedBody from "@/components/FormattedBody";

type UniView = University & { imageUrl?: string | null; bodyMd?: string };

function itemToUniversity(item: FreeResourceItem): UniView {
  const m = item.meta || {};
  const regionRaw = String(m.region || "Addis Ababa");
  const region = (regions.includes(regionRaw as Region) ? regionRaw : "Addis Ababa") as Region;
  return {
    id: item.id,
    name: item.title,
    abbr: String(m.abbr || item.title.slice(0, 3).toUpperCase()),
    region,
    location: String(m.location || item.subtitle || ""),
    website: String(m.website || item.externalUrl || "#"),
    founded: m.founded != null ? String(m.founded) : undefined,
    campuses: m.campuses != null ? unescapeText(String(m.campuses)) : undefined,
    climate: m.climate != null ? unescapeText(String(m.climate)) : undefined,
    distanceFromAddisKm:
      typeof m.distanceFromAddisKm === "number"
        ? m.distanceFromAddisKm
        : m.distanceFromAddisKm != null && String(m.distanceFromAddisKm) !== ""
          ? Number(m.distanceFromAddisKm)
          : undefined,
    distanceNote: m.distanceNote != null ? unescapeText(String(m.distanceNote)) : undefined,
    elevationM:
      typeof m.elevationM === "number"
        ? m.elevationM
        : m.elevationM != null && String(m.elevationM) !== ""
          ? Number(m.elevationM)
          : undefined,
    knownFor: toLines(m.knownFor),
    strengths: toLines(m.strengths),
    whatToExpect: toLines(m.whatToExpect),
    tips: toLines(m.tips),
    studentFit: m.studentFit != null ? unescapeText(String(m.studentFit)) : undefined,
    featured: item.featured,
    detailed: m.detailed === true || Boolean(item.bodyMd?.trim()),
    imageUrl: item.imagePath ? freeResourcePublicUrl(item.imagePath) : null,
    bodyMd: item.bodyMd ? unescapeText(item.bodyMd) : "",
  };
}

function Section({
  icon: Icon,
  label,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className={`shrink-0 p-2 rounded-xl border ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

function UniversityCard({
  uni,
  expanded,
  onToggle,
}: {
  uni: UniView;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`card-3d group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-500 ease-out ${
        expanded
          ? "border-wisdom-cyan/45 bg-wisdom-card shadow-[0_0_40px_-12px_rgba(34,211,238,0.35)] md:col-span-2"
          : "border-white/12 bg-wisdom-card/90 hover:border-wisdom-cyan/30"
      }`}
    >
      {uni.imageUrl && (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-wisdom-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uni.imageUrl} alt={uni.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-transparent to-transparent" />
        </div>
      )}

      <button type="button" onClick={onToggle} className="w-full text-left p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-wisdom-cyan/15 text-wisdom-cyan border border-wisdom-cyan/25">
                {uni.abbr}
              </span>
              {uni.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
              <span className="text-xs text-wisdom-muted">{uni.region}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug group-hover:text-wisdom-cyan transition-colors">{uni.name}</h3>
            {uni.location && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-wisdom-muted">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-wisdom-cyan/70" />
                <span className="truncate">{uni.location}</span>
              </p>
            )}
          </div>
          <div className={`shrink-0 p-2 rounded-xl border border-white/10 transition-transform ${expanded ? "rotate-180 text-wisdom-cyan" : ""}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {!expanded && (
          <p className="mt-3 text-sm text-wisdom-muted/90 line-clamp-2">
            {uni.knownFor?.[0] || uni.strengths[0] || uni.campuses || ""}
          </p>
        )}
      </button>

      <div className={`grid transition-all duration-500 ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-6 space-y-5 border-t border-white/8 pt-5">
            {uni.founded && (
              <p className="text-xs text-wisdom-muted">
                Established <span className="text-white/80 font-medium">{uni.founded}</span>
              </p>
            )}
            {uni.campuses && (
              <Section icon={Building2} label="Campuses" accent="bg-sky-500/10 border-sky-500/20 text-sky-300">
                <p className="text-sm text-wisdom-muted leading-relaxed uni-list-block">{uni.campuses}</p>
              </Section>
            )}
            {uni.climate && (
              <Section icon={Thermometer} label="Weather & climate" accent="bg-amber-500/10 border-amber-500/20 text-amber-300">
                <p className="text-sm text-wisdom-muted leading-relaxed uni-list-block">{uni.climate}</p>
              </Section>
            )}
            {uni.knownFor && uni.knownFor.length > 0 && (
              <Section icon={BookOpen} label="Well known for" accent="bg-violet-500/10 border-violet-500/20 text-violet-300">
                <div className="flex flex-wrap gap-2">
                  {uni.knownFor.map((k) => (
                    <span key={k} className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-100">{k}</span>
                  ))}
                </div>
              </Section>
            )}
            {uni.strengths.length > 0 && (
              <Section icon={GraduationCap} label="Strengths" accent="bg-wisdom-cyan/10 border-wisdom-cyan/20 text-wisdom-cyan">
                <ul className="space-y-1.5">
                  {uni.strengths.map((s) => (
                    <li key={s} className="text-sm text-wisdom-muted flex gap-2 leading-relaxed">
                      <span className="text-wisdom-cyan mt-1.5 shrink-0">•</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {uni.whatToExpect.length > 0 && (
              <div className="rounded-xl bg-wisdom-dark/60 border border-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">What campus life is like</p>
                <ul className="space-y-2">
                  {uni.whatToExpect.map((item) => (
                    <li key={item} className="text-sm text-wisdom-muted leading-relaxed pl-3 border-l-2 border-wisdom-cyan/25">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {uni.studentFit && (
              <Section icon={Target} label="Who thrives here" accent="bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
                <p className="text-sm text-wisdom-muted leading-relaxed">{uni.studentFit}</p>
              </Section>
            )}
            {uni.tips && uni.tips.length > 0 && (
              <Section icon={Lightbulb} label="Tips for new students" accent="bg-amber-500/10 border-amber-500/20 text-amber-300">
                <ul className="space-y-1.5">
                  {uni.tips.map((t) => (
                    <li key={t} className="text-sm text-wisdom-muted flex gap-2 leading-relaxed">
                      <span className="text-amber-300/80 mt-1.5 shrink-0">•</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {uni.bodyMd?.trim() && (
              <div className="border-t border-white/8 pt-4">
                <FormattedBody text={uni.bodyMd} />
              </div>
            )}
            {uni.website && uni.website !== "#" && (
              <a href={uni.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-wisdom-cyan/15 border border-wisdom-cyan/30 text-wisdom-cyan text-sm font-semibold"
                onClick={(e) => e.stopPropagation()}>
                Official website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
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
  const [page, setPage] = useState<FreeResourcePage | null>(null);
  const [list, setList] = useState<UniView[]>([]);
  const [fromDb, setFromDb] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [pageRes, itemsRes] = await Promise.all([
      getFreeResourcePage("universities"),
      listFreeResourceItems({ pageSlug: "universities", publishedOnly: true, kind: "university" }),
    ]);
    setPage(pageRes.item ?? null);
    if (itemsRes.items.length > 0) {
      setList(itemsRes.items.map(itemToUniversity));
      setFromDb(true);
    } else {
      setList(staticUniversities.map((u) => ({ ...u })));
      setFromDb(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((u) => {
      if (showFeaturedOnly && !u.featured) return false;
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
  }, [list, query, region, showFeaturedOnly]);

  const title = page?.title?.trim() || "Ethiopian Universities";
  const subtitle = page?.subtitle?.trim() || "Practical guides — distance, climate, campuses, and first-year life.";
  const intro = page?.published ? unescapeText(page.bodyMd || "").trim() : "";

  return (
    <div className="relative min-h-screen">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-14 animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">Free resource</p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-white">{title.split(" ").slice(0, -1).join(" ")} </span>
            <span className="text-wisdom-cyan">{title.split(" ").slice(-1)[0]}</span>
          </h1>
          {subtitle && <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">{subtitle}</p>}
          {intro && (
            <div className="mt-4 max-w-2xl">
              <FormattedBody text={intro} className="text-base" />
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wisdom-card border border-white/10 text-wisdom-muted">
              <Building2 className="w-3.5 h-3.5 text-wisdom-cyan" />
              {loading ? "…" : `${list.length} institutions`}
            </span>
            {fromDb && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-200 text-xs font-medium">
                Live from admin
              </span>
            )}
          </div>
        </header>

        <div className="sticky top-0 z-20 -mx-4 px-4 py-4 mb-8 bg-wisdom-dark/85 backdrop-blur-xl border-b border-white/5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-wisdom-muted" />
              <input type="search" placeholder="Search by name, city…" value={query}
                onChange={(e) => setQuery(e.target.value)} className="field-input pl-10 py-3 text-sm" />
            </div>
            <select value={region} onChange={(e) => setRegion(e.target.value as Region | "all")}
              className="field-input py-3 text-sm min-w-[140px]">
              <option value="all">All regions</option>
              {regions.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
            <button type="button" onClick={() => setShowFeaturedOnly((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
                showFeaturedOnly ? "bg-amber-500/20 border-amber-500/40 text-amber-200" : "bg-wisdom-card border-white/12 text-wisdom-muted"
              }`}>
              <Star className="w-3.5 h-3.5" /> Featured
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-20 text-wisdom-muted">
            <Loader2 className="w-5 h-5 animate-spin text-wisdom-cyan" /> Loading…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 rounded-3xl border border-white/10 bg-wisdom-card/50">
            <p className="text-wisdom-muted mb-2">No universities match.</p>
            <button type="button" onClick={() => { setQuery(""); setRegion("all"); setShowFeaturedOnly(false); }} className="text-wisdom-cyan text-sm">Clear filters</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="perspective-scene grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filtered.map((uni) => (
              <UniversityCard key={uni.id} uni={uni}
                expanded={expandedId === uni.id}
                onToggle={() => setExpandedId((id) => (id === uni.id ? null : uni.id))} />
            ))}
          </div>
        )}

        <div className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-wisdom-card to-wisdom-card p-8 text-center">
          <h2 className="font-display text-xl font-bold mb-3">Choosing where you will study</h2>
          <p className="text-wisdom-muted max-w-lg mx-auto mb-6 leading-relaxed">
            Know climate, distance, and campus culture before you rank options.
          </p>
          <Link href="/academy" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium">
            Back to Academy <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
