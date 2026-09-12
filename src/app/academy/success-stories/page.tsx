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
import { Trophy, Quote, Star, Loader2 } from "lucide-react";

export default function SuccessStoriesPage() {
  const [page, setPage] = useState<FreeResourcePage | null>(null);
  const [stories, setStories] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [pageRes, itemsRes] = await Promise.all([
      getFreeResourcePage("success-stories", { publishedOnly: true }),
      listFreeResourceItems({
        pageSlug: "success-stories",
        publishedOnly: true,
        kind: "success_story",
      }),
    ]);
    if (pageRes.error) setError(pageRes.error);
    else if (itemsRes.error) setError(itemsRes.error);
    setPage(pageRes.item ?? null);
    setStories(itemsRes.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const title = page?.title || "Success Stories";
  const subtitle =
    page?.subtitle ||
    "Real results from students who trained with Wisdom Tower Academy.";

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-12 animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-amber-400/90 mb-3">
            Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Success </span>
            <span className="text-amber-400">Stories</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">{subtitle}</p>
          {page?.bodyMd?.trim() && (
            <div className="mt-4 text-wisdom-muted text-sm leading-relaxed whitespace-pre-wrap">
              {page.bodyMd.trim()}
            </div>
          )}
        </header>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-20 text-wisdom-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading stories…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            Could not load stories. {error}
          </div>
        )}

        {!loading && !error && stories.length === 0 && (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card/90 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">No stories published yet</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed">
              When an admin publishes a success story in the dashboard, it will appear here.
            </p>
          </div>
        )}

        {!loading && stories.length > 0 && (
          <ul className="space-y-6">
            {stories.map((story) => {
              const name = String(story.meta.studentName || story.subtitle || "");
              const program = String(story.meta.program || "");
              const result = String(story.meta.result || story.title || "");
              const year = String(story.meta.year || "");
              const quote = String(story.meta.quote || "");
              const img = story.imagePath
                ? freeResourcePublicUrl(story.imagePath)
                : null;

              return (
                <li
                  key={story.id}
                  className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden shadow-lg shadow-black/20 animate-fade-up"
                >
                  <div className="flex flex-col sm:flex-row gap-0">
                    <div className="sm:w-44 md:w-52 shrink-0 bg-wisdom-dark/60 relative min-h-[11rem] sm:min-h-0">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={name || story.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-amber-300/40">
                          <Trophy className="w-12 h-12" />
                        </div>
                      )}
                      {story.featured && (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-wisdom-dark">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="flex-1 p-5 sm:p-6 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                            {result || story.title}
                          </h2>
                          {(name || program || year) && (
                            <p className="mt-1 text-sm text-wisdom-muted">
                              {[name, program, year].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>

                      {quote && (
                        <p className="flex gap-2 text-sm text-amber-100/90 italic leading-relaxed">
                          <Quote className="w-4 h-4 shrink-0 text-amber-400/80 mt-0.5" />
                          <span>{quote}</span>
                        </p>
                      )}

                      {story.bodyMd?.trim() && (
                        <div className="text-sm text-wisdom-muted leading-relaxed whitespace-pre-wrap border-t border-white/8 pt-3">
                          {story.bodyMd.trim()}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
