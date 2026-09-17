"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getFreeResourcePage,
  listFreeResourceItems,
  freeResourcePublicUrl,
  type FreeResourceItem,
  type FreeResourcePage,
} from "@/lib/free-resources";
import FormattedBody from "@/components/FormattedBody";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  GraduationCap,
  Calendar,
  Star,
  Loader2,
  ChevronDown,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";

function formatDeadline(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isDeadlineSoon(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 45;
}

function ScholarshipCard({
  item,
  index,
}: {
  item: FreeResourceItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const provider = String(item.meta.provider || item.meta.organization || "");
  const amount = String(item.meta.amount || item.meta.award || "");
  const eligibility = String(item.meta.eligibility || "");
  const level = String(item.meta.level || item.meta.degree || "");
  const country = String(item.meta.country || item.meta.location || "");
  const body = (item.bodyMd || "").trim();
  const img = item.imagePath ? freeResourcePublicUrl(item.imagePath) : null;
  const deadlineLabel = formatDeadline(item.deadline);
  const soon = isDeadlineSoon(item.deadline);
  const longBody = body.length > 240;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ease-out
        ${
          open
            ? "border-rose-400/40 bg-wisdom-card shadow-[0_0_48px_-16px_rgba(244,63,94,0.28)]"
            : "border-white/12 bg-wisdom-card/95 hover:border-rose-400/30 hover:shadow-[0_12px_40px_-16px_rgba(244,63,94,0.2)]"
        }`}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] bg-wisdom-dark overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-500/20 via-wisdom-dark to-wisdom-navy">
            <GraduationCap className="w-16 h-16 text-rose-400/35" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-dark via-wisdom-dark/50 to-transparent" />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {item.featured && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-wisdom-dark shadow-lg">
              <Star className="w-3.5 h-3.5" /> Featured
            </span>
          )}
          {soon && deadlineLabel && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-lg">
              Closing soon
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-lg leading-snug">
            {item.title}
          </h3>
          {(provider || amount) && (
            <p className="mt-1.5 text-sm sm:text-base text-white/85 font-medium">
              {[provider, amount].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {deadlineLabel && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium
                ${
                  soon
                    ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
                    : "border-white/12 bg-white/[0.04] text-wisdom-muted"
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Deadline: {deadlineLabel}
            </span>
          )}
          {level && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs text-wisdom-muted">
              {level}
            </span>
          )}
          {country && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs text-wisdom-muted">
              {country}
            </span>
          )}
        </div>

        {item.subtitle && (
          <p className="text-[15px] text-wisdom-muted leading-relaxed">{item.subtitle}</p>
        )}

        {eligibility && (
          <div className="rounded-xl border border-white/8 bg-wisdom-dark/50 px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
              Eligibility
            </p>
            <p className="text-sm text-wisdom-muted leading-relaxed">{eligibility}</p>
          </div>
        )}

        {body && (
          <div className="border-t border-white/8 pt-4">
            <FormattedBody text={body} clamped={!open && longBody} />
            {longBody && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-300 hover:text-rose-200 transition-colors"
              >
                {open ? "Show less" : "Read full details"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        )}

        {item.externalUrl && (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-8px_rgba(244,63,94,0.55)] transition-all hover:bg-rose-400 hover:shadow-[0_0_28px_-6px_rgba(244,63,94,0.65)]"
          >
            Apply / Official page
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}

const DEFAULT_INTRO = `Scholarships can change what is possible for secondary and university learners — lower fees, cover materials, or open doors to programs abroad.

This page collects opportunities relevant for Ethiopian students and the wider region: local awards, national schemes, and international programs that accept applicants from Africa. Each card is practical: who it is for, what it covers, deadlines when we have them, and a direct link to apply or learn more.

How to use this page
• Read eligibility notes carefully — many awards are limited by grade, field, gender, or need.
• Start early. Strong applications need transcripts, recommendations, and a clear personal statement.
• Keep a simple tracker of deadlines, required documents, and status.
• Prefer official sites and verified partners.

We add and update listings over time. If you know of a solid scholarship that is missing, use Contact us and send the official link.`;

export default function ScholarshipsPage() {
  const [page, setPage] = useState<FreeResourcePage | null>(null);
  const [items, setItems] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [pageRes, itemsRes] = await Promise.all([
      getFreeResourcePage("scholarships", { publishedOnly: false }),
      listFreeResourceItems({
        pageSlug: "scholarships",
        publishedOnly: true,
        kind: "scholarship",
      }),
    ]);
    if (itemsRes.error) setError(itemsRes.error);
    setPage(pageRes.item ?? null);
    setItems(itemsRes.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const title = page?.title?.trim() || "Scholarship Info";
  const subtitle =
    page?.subtitle?.trim() ||
    "Funding options and how to prepare strong applications.";
  // Always show CMS body when present; otherwise the full default guide.
  const intro = ((page?.bodyMd || "").trim() || DEFAULT_INTRO);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-rose-500/12 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-fuchsia-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-14 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
              <GraduationCap className="w-4.5 h-4.5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-rose-400/90">
              Free resource
            </p>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            {title.includes(" ") ? (
              <>
                <span className="text-white">
                  {title.split(" ").slice(0, -1).join(" ")}{" "}
                </span>
                <span className="text-rose-400">{title.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="text-rose-400">{title}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">{subtitle}</p>
          )}
          {intro && (
            <div className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-wisdom-card/60 p-5 sm:p-6">
              <FormattedBody text={intro} />
            </div>
          )}
          {!loading && items.length > 0 && (
            <p className="mt-5 text-xs font-medium text-wisdom-muted/80">
              {items.length} {items.length === 1 ? "opportunity" : "opportunities"}
            </p>
          )}
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-24 text-wisdom-muted animate-fade-up">
            <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
            Loading scholarships…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            Could not load scholarships. {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card/90 p-12 text-center animate-fade-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/10 text-rose-300">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">No scholarships yet</h2>
            <p className="text-wisdom-muted text-sm max-w-sm mx-auto leading-relaxed mb-6">
              Published scholarship opportunities will appear here as cards with deadlines and apply links.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-wisdom-dark hover:bg-amber-400 transition-colors"
            >
              Suggest a scholarship
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-7 md:space-y-8">
            {items.map((item, i) => (
              <li key={item.id} className="animate-fade-up">
                <ScholarshipCard item={item} index={i} />
              </li>
            ))}
          </ul>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-14 rounded-2xl border border-white/10 bg-wisdom-card/80 p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10 text-rose-300">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <p className="text-sm text-wisdom-muted leading-relaxed max-w-md mx-auto">
              Always verify deadlines and requirements on the official page. Requirements change.
              Treat this as a starting guide.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
