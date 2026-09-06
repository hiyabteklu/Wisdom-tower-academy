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

  useEffect(() => {
    reported.current = false;

    const onScroll = () => {
      const pageH = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const pct = Math.min(100, Math.round((scrolled / pageH) * 100));
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
      {/* Full-page notes content — no floating scrub UI */}
      <div className="notes-reading-surface w-full max-w-full rounded-2xl border border-white/10 p-5 sm:p-8 shadow-card-3d">
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
