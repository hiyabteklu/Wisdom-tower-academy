"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getFreeResourcePage,
  listFreeResourceItems,
  freeResourcePublicUrl,
  type FreeResourceItem,
  type FreeResourcePage,
} from "@/lib/free-resources";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  Trophy,
  Quote,
  Star,
  Loader2,
  ChevronDown,
  Medal,
} from "lucide-react";

function StoryCard({
  story,
  index,
}: {
  story: FreeResourceItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const name = String(story.meta.studentName || "");
  const program = String(story.meta.program || "");
  const result = String(story.meta.result || story.title || "");
  const year = String(story.meta.year || "");
  const quote = String(story.meta.quote || "");
  const body = (story.bodyMd || "").trim();
  const img = story.imagePath ? freeResourcePublicUrl(story.imagePath) : null;
  const longBody = body.length > 220;

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ease-spring
        ${open
          ? "border-amber-400/40 bg-wisdom-card shadow-[0_0_48px_-16px_rgba(251,191,36,0.35)]"
          : "border-white/12 bg-wisdom-card/95 hover:border-amber-400/30 hover:shadow-card-3d-hover"
        }`}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      {/* Photo — full width, large */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] bg-wisdom-dark overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={name || result}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/15 via-wisdom-dark to-wisdom-dark">
            <Trophy className="w-16 h-16 text-amber-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-dark via-wisdom-dark/40 to-transparent" />

        {story.featured && (
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-wisdom-dark shadow-lg">
            <Star className="w-3.5 h-3.5" /> Featured
          </span>
        )}

        {/* Score + name over photo */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <p className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
            {result}
          </p>
          {(name || program || year) && (
            <p className="mt-1.5 text-sm sm:text-base text-white/85 font-medium">
              {[name, program, year].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {quote && (
          <p className="flex gap-2.5 text-[15px] sm:text-base text-amber-100/95 leading-relaxed">
            <Quote className="w-5 h-5 shrink-0 text-amber-400/90 mt-0.5" />
            <span className="italic">{quote}</span>
          </p>
        )}

        {body && (
          <div className="border-t border-white/8 pt-4">
            <div
              className={`text-[15px] text-wisdom-muted leading-relaxed whitespace-pre-wrap transition-all duration-500 ease-spring
                ${!open && longBody ? "line-clamp-3" : ""}`}
            >
              {body}
            </div>
            {longBody && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors"
              >
                {open ? "Show less" : "Read full story"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function SuccessStoriesPage() {
  const [page, setPage] = useState<FreeResourcePage | null>(null);
  const [stories, setStories] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [pageRes, itemsRes] = await Promise.all([
      getFreeResourcePage("success-stories", { publishedOnly: false }),
      listFreeResourceItems({
        pageSlug: "success-stories",
        publishedOnly: true,
        kind: "success_story",
      }),
    ]);
    // Page shell may be draft; still use title/subtitle if present for admins.
    // Public only needs published items.
    if (itemsRes.error) setError(itemsRes.error);
    setPage(pageRes.item ?? null);
    setStories(itemsRes.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Prefer admin page title/subtitle only — never claim “trained with Academy”
  const title = page?.title?.trim() || "Success Stories";
  const subtitle = page?.subtitle?.trim() || "";
  const intro = page?.published ? (page.bodyMd || "").trim() : "";

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-amber-500/12 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-yellow-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-14 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Medal className="w-4.5 h-4.5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-amber-400/90">
              Free resource
            </p>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            {title.includes(" ") ? (
              <>
                <span className="text-white">{title.split(" ").slice(0, -1).join(" ")} </span>
                <span className="text-amber-400">{title.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="text-amber-400">{title}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">{subtitle}</p>
          )}
          {intro && (
            <div className="mt-4 text-wisdom-muted text-[15px] leading-relaxed whitespace-pre-wrap max-w-2xl">
              {intro}
            </div>
          )}
          {!loading && stories.length > 0 && (
            <p className="mt-5 text-xs font-medium text-wisdom-muted/80">
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </p>
          )}
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-24 text-wisdom-muted animate-fade-up">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            Loading…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            Could not load stories. {error}
          </div>
        )}

        {!loading && !error && stories.length === 0 && (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card/90 p-12 text-center animate-scale-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">No stories yet</h2>
            <p className="text-wisdom-muted text-sm max-w-sm mx-auto leading-relaxed">
              Published stories will appear here as large photo cards.
            </p>
          </div>
        )}

        {!loading && stories.length > 0 && (
          <ul className="space-y-7 md:space-y-8">
            {stories.map((story, i) => (
              <li key={story.id} className="animate-fade-up">
                <StoryCard story={story} index={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
