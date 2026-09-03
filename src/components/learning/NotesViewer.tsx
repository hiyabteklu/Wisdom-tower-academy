"use client";

import { useEffect, useRef, useState } from "react";
import { Lightbulb, ListTree } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  // Progress from the notes scroll window (not the whole page)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    reported.current = false;

    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct =
        max <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / max) * 100));
      onProgress?.(pct);
      if (pct >= 95 && !reported.current) {
        reported.current = true;
        onProgress?.(100);
      }
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [body, onProgress]);

  async function summarize() {
    setLoading(true);
    setAi("");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: body.slice(0, 8000),
          resourceId,
          mode: "summarize",
        }),
      });
      const data = await res.json();
      setAi(data.explanation || data.error || "No summary returned.");
      onProgress?.(100);
    } catch {
      setAi("Could not reach AI. Try again later.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4 w-full max-w-full">
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
      </div>

      {/* Outline: full width on mobile, sidebar on large screens */}
      {showToc && toc.length > 0 && (
        <nav className="w-full rounded-2xl border border-white/10 bg-wisdom-dark/50 p-4 lg:hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 mb-3">
            Topics
          </p>
          <ul className="space-y-1.5 max-h-[40vh] overflow-y-auto text-sm">
            {toc.map((t) => (
              <li key={t.id} style={{ paddingLeft: (t.level - 1) * 10 }}>
                <a
                  href={`#${t.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = scrollRef.current?.querySelector(`#${CSS.escape(t.id)}`);
                    target?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
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

      <div className="grid gap-4 w-full max-w-full lg:grid-cols-[minmax(0,1fr)_220px]">
        {/* Fixed-height scroll window — page stays put, notes scroll inside */}
        <div
          ref={scrollRef}
          className="w-full max-w-full rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-7 shadow-card-3d overflow-y-auto overflow-x-hidden overscroll-contain"
          style={{ height: "min(70vh, 640px)", maxHeight: "70vh" }}
        >
          <RichContent body={body} onToc={setToc} />
        </div>

        {showToc && toc.length > 0 && (
          <nav className="hidden lg:block lg:sticky lg:top-20 h-fit rounded-2xl border border-white/10 bg-wisdom-dark/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 mb-3">
              Topics
            </p>
            <ul className="space-y-1.5 max-h-[60vh] overflow-y-auto text-sm">
              {toc.map((t) => (
                <li key={t.id} style={{ paddingLeft: (t.level - 1) * 10 }}>
                  <a
                    href={`#${t.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = scrollRef.current?.querySelector(
                        `#${CSS.escape(t.id)}`
                      );
                      target?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
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

      <div className="pt-2 border-t border-white/8">
        <button
          type="button"
          onClick={() => void summarize()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-200 text-sm font-semibold disabled:opacity-60"
        >
          <Lightbulb className="w-4 h-4" />
          {loading ? "Summarizing…" : "Summarize with AI"}
        </button>
        {ai && (
          <div className="mt-3 rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm text-white/90 leading-relaxed">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2 inline-flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> AI summary
            </p>
            <RichContent body={ai} />
          </div>
        )}
      </div>
    </div>
  );
}
