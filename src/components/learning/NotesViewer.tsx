"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lightbulb } from "lucide-react";
import RichContent from "@/components/learning/RichContent";

type Props = {
  body: string;
  resourceId: string;
  onProgress?: (pct: number) => void;
};

export default function NotesViewer({ body, resourceId, onProgress }: Props) {
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrubPct, setScrubPct] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);
  const dragging = useRef(false);

  useEffect(() => {
    reported.current = false;

    const onScroll = () => {
      if (dragging.current) return;
      const pageH = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const pct = Math.min(100, Math.round((scrolled / pageH) * 100));
      setScrubPct(pct);
      onProgress?.(pct);
      if (pct >= 95 && !reported.current) {
        reported.current = true;
        onProgress?.(100);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [body, onProgress]);

  const scrollToRatio = useCallback((ratio: number) => {
    const pageH = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
    setScrubPct(pct);
    window.scrollTo({ top: pageH * ratio, behavior: "auto" });
  }, []);

  const scrubFromClientY = useCallback(
    (clientY: number, track: HTMLElement) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      scrollToRatio(ratio);
    },
    [scrollToRatio]
  );

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubFromClientY(e.clientY, e.currentTarget);
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    e.preventDefault();
    scrubFromClientY(e.clientY, e.currentTarget);
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

  return (
    <div className="relative space-y-4 w-full max-w-full">
      {/* Vertical swipe control — right edge, no labels */}
      <div
        className="fixed z-30 right-2 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ height: "min(42vh, 320px)" }}
      >
        <div
          role="slider"
          aria-label="Scroll page"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={scrubPct}
          tabIndex={0}
          className="relative h-full w-7 sm:w-8 rounded-full border border-white/15 bg-black/50 backdrop-blur-md shadow-xl cursor-ns-resize touch-none select-none active:border-amber-400/50"
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerUp={onTrackPointerUp}
          onPointerCancel={onTrackPointerUp}
        >
          {/* Filled track from top → current position */}
          <div
            className="absolute inset-x-1.5 top-1.5 rounded-full bg-gradient-to-b from-amber-400/90 to-cyan-400/80 pointer-events-none"
            style={{ height: `calc(${scrubPct}% - 6px)`, minHeight: scrubPct > 0 ? 8 : 0 }}
          />
          {/* Thumb */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-md border-2 border-amber-400 pointer-events-none"
            style={{
              top: `calc(${scrubPct}% - 10px)`,
            }}
          />
        </div>
      </div>

      {/* Full-page notes content */}
      <div
        ref={articleRef}
        className="w-full max-w-full rounded-2xl border border-white/12 bg-wisdom-card/90 p-5 sm:p-7 shadow-card-3d pr-10 sm:pr-12"
      >
        <RichContent body={body} />
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
