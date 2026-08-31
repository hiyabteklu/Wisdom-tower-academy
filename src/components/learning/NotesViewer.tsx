"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ListTree, BookMarked } from "lucide-react";
import RichContent, { type TocItem } from "@/components/learning/RichContent";

type Props = {
  body: string;
  resourceId: string;
  onProgress?: (pct: number) => void;
};

export default function NotesViewer({ body, resourceId, onProgress }: Props) {
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [showToc, setShowToc] = useState(true);
  const articleRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  // Scroll-depth progress
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const visible = Math.min(
        1,
        Math.max(0, (window.innerHeight - rect.top) / (rect.height || 1))
      );
      const pct = Math.round(visible * 100);
      onProgress?.(pct);
      if (pct >= 95 && !reported.current) {
        reported.current = true;
        onProgress?.(100);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [body, onProgress]);

  async function explain() {
    setLoading(true);
    setAi("");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: body.slice(0, 4000),
          resourceId,
          mode: "notes",
        }),
      });
      const data = await res.json();
      setAi(data.explanation || data.error || "No explanation returned.");
      onProgress?.(100);
    } catch {
      setAi("Could not reach AI. Try again later.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {toc.length > 0 && (
          <button
            type="button"
            onClick={() => setShowToc((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-wisdom-muted hover:text-white"
          >
            <ListTree className="w-3.5 h-3.5" />
            {showToc ? "Hide outline" : "Outline"}
          </button>
        )}
        <span className="text-[10px] uppercase tracking-wider text-wisdom-muted flex items-center gap-1">
          <BookMarked className="w-3 h-3" />
          Use ==highlight== or [[key term]] in notes
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div
          ref={articleRef}
          className="rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-7 shadow-card-3d"
        >
          <RichContent body={body} onToc={setToc} />
        </div>

        {showToc && toc.length > 0 && (
          <nav className="lg:sticky lg:top-20 h-fit rounded-2xl border border-white/10 bg-wisdom-dark/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 mb-3">
              Topics
            </p>
            <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto text-sm">
              {toc.map((t) => (
                <li key={t.id} style={{ paddingLeft: (t.level - 1) * 10 }}>
                  <a
                    href={`#${t.id}`}
                    className={`block truncate rounded-lg px-2 py-1 transition-colors hover:bg-white/5 ${
                      t.level === 1
                        ? "font-semibold text-white"
                        : t.level === 2
                          ? "text-white/80"
                          : "text-wisdom-muted text-xs"
                    }`}
                  >
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <button
        type="button"
        onClick={() => void explain()}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-200 text-sm font-semibold disabled:opacity-60"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? "Explaining…" : "Explain with AI"}
      </button>
      {ai && (
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm text-white/90 leading-relaxed">
          <RichContent body={ai} />
        </div>
      )}
    </div>
  );
}
