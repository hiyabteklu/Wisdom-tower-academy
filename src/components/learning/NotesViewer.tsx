"use client";

import { useEffect, useRef, useState } from "react";
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
  const reported = useRef(false);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  // Only when opening / switching notes: start at the top once.
  // Do NOT depend on onProgress (unstable) or it fights the reader while scrolling.
  useEffect(() => {
    reported.current = false;
    setAi("");

    let prevRestoration: ScrollRestoration | undefined;
    try {
      if (typeof history !== "undefined" && "scrollRestoration" in history) {
        prevRestoration = history.scrollRestoration;
        history.scrollRestoration = "manual";
      }
    } catch {
      /* ignore */
    }

    // After paint so layout height is ready; still only once per resourceId
    const id = window.requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch {
        /* ignore */
      }
    });

    return () => {
      window.cancelAnimationFrame(id);
      try {
        if (prevRestoration != null && typeof history !== "undefined") {
          history.scrollRestoration = prevRestoration;
        }
      } catch {
        /* ignore */
      }
    };
  }, [resourceId]);

  // Progress tracking only — never resets scroll
  useEffect(() => {
    reported.current = false;

    const onScroll = () => {
      const pageH = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const pct = Math.min(100, Math.round((scrolled / pageH) * 100));
      onProgressRef.current?.(pct);
      if (pct >= 95 && !reported.current) {
        reported.current = true;
        onProgressRef.current?.(100);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [resourceId]);

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
      onProgressRef.current?.(100);
    } catch {
      setAi("Could not reach AI. Try again later.");
    }
    setLoading(false);
  }

  return (
    <div className="relative space-y-4 w-full max-w-full" data-scroll-zoom-skip data-learning-content>
      <div
        className="notes-reading-surface w-full max-w-full rounded-2xl border border-white/10 p-5 sm:p-8 shadow-card-3d"
        data-scroll-zoom-skip
        data-learning-content
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
