"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

type Props = {
  body: string;
  resourceId: string;
  onProgress?: (pct: number) => void;
};

/** Simple markdown-ish renderer + AI explain placeholder */
export default function NotesViewer({ body, resourceId, onProgress }: Props) {
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);

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

  const blocks = body.split(/\n\n+/);

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-white/12 bg-wisdom-card p-5 sm:p-6 prose-invert max-w-none">
        {blocks.map((block, i) => {
          const t = block.trim();
          if (t.startsWith("## ")) {
            return (
              <h2
                key={i}
                className="font-display text-xl font-bold text-amber-200 mt-4 mb-2"
              >
                {t.replace(/^##\s+/, "")}
              </h2>
            );
          }
          if (t.startsWith("# ")) {
            return (
              <h1 key={i} className="font-display text-2xl font-extrabold text-white mb-3">
                {t.replace(/^#\s+/, "")}
              </h1>
            );
          }
          if (t.startsWith("> ")) {
            return (
              <div
                key={i}
                className="my-3 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-50"
              >
                {t.replace(/^>\s+/, "")}
              </div>
            );
          }
          return (
            <p key={i} className="text-sm text-white/85 leading-relaxed mb-3">
              {t}
            </p>
          );
        })}
      </article>

      <button
        type="button"
        onClick={() => void explain()}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-200 text-sm font-semibold"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? "Explaining…" : "Explain with AI"}
      </button>
      {ai && (
        <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
          {ai}
        </div>
      )}
    </div>
  );
}
