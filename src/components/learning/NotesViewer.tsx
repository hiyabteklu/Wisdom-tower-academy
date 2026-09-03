"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
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
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrubPct, setScrubPct] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);
  const dragging = useRef(false);

  // Window scroll → reading progress + active section + scrubber position
  useEffect(() => {
    reported.current = false;

    const onScroll = () => {
      if (dragging.current) return;

      const el = articleRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const pageH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const pct = Math.min(100, Math.round((scrolled / pageH) * 100));
      setScrubPct(pct);
      onProgress?.(pct);
      if (pct >= 95 && !reported.current) {
        reported.current = true;
        onProgress?.(100);
      }

      // Highlight the section nearest the top of the viewport
      if (toc.length) {
        let best = 0;
        for (let i = 0; i < toc.length; i++) {
          const node = document.getElementById(toc[i].id);
          if (!node) continue;
          const top = node.getBoundingClientRect().top;
          if (top <= 120) best = i;
        }
        setActiveIdx(best);
      }

      // Keep TS happy — rect used for layout readiness
      void rect.height;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [body, onProgress, toc]);

  const jumpToSection = useCallback((id: string, index: number) => {
    const node = document.getElementById(id);
    if (!node) return;
    setActiveIdx(index);
    const y = node.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, []);

  /** Drag / tap on the horizontal track to fast-scroll the page */
  const scrubFromClientX = useCallback((clientX: number, track: HTMLElement) => {
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const pct = Math.round(ratio * 100);
    setScrubPct(pct);

    const pageH = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: pageH * ratio, behavior: "auto" });

    // Snap active section to whatever is under the new viewport
    if (toc.length) {
      let best = 0;
      for (let i = 0; i < toc.length; i++) {
        const node = document.getElementById(toc[i].id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= 120) best = i;
      }
      setActiveIdx(best);
    }
  }, [toc]);

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubFromClientX(e.clientX, e.currentTarget);
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    scrubFromClientX(e.clientX, e.currentTarget);
  };

  const onTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

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

  // Prefer major headings for the chip row (h1/h2); fall back to all toc
  const chips = toc.filter((t) => t.level <= 2);
  const navItems = chips.length ? chips : toc;

  return (
    <div className="space-y-4 w-full max-w-full">
      {/* Horizontal fast-scroll indicator (gallery-style) */}
      {(navItems.length > 0 || true) && (
        <div className="sticky top-[4.25rem] z-20 -mx-1 px-1">
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/95 backdrop-blur-md shadow-lg p-3 space-y-2.5">
            {/* Draggable progress track */}
            <div
              role="slider"
              aria-label="Reading position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={scrubPct}
              tabIndex={0}
              className="relative h-3 rounded-full bg-white/10 cursor-pointer touch-none select-none"
              onPointerDown={onTrackPointerDown}
              onPointerMove={onTrackPointerMove}
              onPointerUp={onTrackPointerUp}
              onPointerCancel={onTrackPointerUp}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-[width] duration-75"
                style={{ width: `${scrubPct}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-2 border-amber-400 shadow-md pointer-events-none"
                style={{ left: `calc(${scrubPct}% - 8px)` }}
              />
            </div>

            {/* Section chips — tap to jump */}
            {navItems.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                {navItems.map((t) => {
                  const globalIdx = toc.findIndex((x) => x.id === t.id);
                  const active = globalIdx === activeIdx;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => jumpToSection(t.id, globalIdx >= 0 ? globalIdx : 0)}
                      className={`shrink-0 max-w-[10rem] truncate rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                        active
                          ? "bg-amber-500/90 text-wisdom-dark"
                          : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                      title={t.text}
                    >
                      {t.text}
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-[10px] tabular-nums text-white/40 text-right">{scrubPct}% through</p>
          </div>
        </div>
      )}

      {/* Full-page notes content (no fixed window) */}
      <div
        ref={articleRef}
        className="w-full max-w-full rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-7 shadow-card-3d"
      >
        <RichContent body={body} onToc={setToc} />
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
