"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, RotateCcw, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { saveProgress } from "@/lib/contentWithOffline";
import RichContent from "@/components/learning/RichContent";

type Card = { front: string; back: string };
type Props = { meta: Record<string, unknown>; resourceId?: string };
type Grade = "know" | "learning" | "again";

export default function FlashcardViewer({ meta, resourceId }: Props) {
  const cards = (Array.isArray(meta.cards) ? meta.cards : []) as Card[];
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [grades, setGrades] = useState<Record<number, Grade>>({});
  const [done, setDone] = useState(false);

  const stats = useMemo(() => {
    const vals = Object.values(grades);
    const know = vals.filter((g) => g === "know").length;
    const learning = vals.filter((g) => g === "learning").length;
    const again = vals.filter((g) => g === "again").length;
    const seen = vals.length;
    const total = cards.length;
    const accuracy = seen ? Math.round((know / seen) * 100) : 0;
    return { know, learning, again, seen, total, accuracy };
  }, [grades, cards.length]);

  useEffect(() => {
    if (!resourceId || cards.length === 0) return;
    void saveProgress({
      resourceId,
      progressPct: Math.round((stats.seen / Math.max(1, cards.length)) * 100),
      meta: { flashcards: stats },
    });
  }, [stats, resourceId, cards.length]);

  if (!cards.length) {
    return <p className="text-sm text-wisdom-muted">No cards in this deck yet.</p>;
  }

  function grade(g: Grade) {
    setGrades((prev) => ({ ...prev, [i]: g }));
    if (i < cards.length - 1) {
      setI((x) => x + 1);
      setFlipped(false);
    } else setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-6 text-center space-y-3">
        <BarChart3 className="w-8 h-8 mx-auto text-violet-300" />
        <p className="font-display text-xl font-bold text-white">Deck complete</p>
        <p className="text-sm text-wisdom-muted">
          Know {stats.know} · Learning {stats.learning} · Again {stats.again}
        </p>
        <p className="text-xs text-cyan-300/80">Saved on this device. Syncs when online.</p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            setGrades({});
            setI(0);
            setFlipped(false);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-bold"
        >
          <RotateCcw className="w-4 h-4" /> Practice again
        </button>
      </div>
    );
  }

  const card = cards[i];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg border border-white/10 px-2.5 py-1 text-wisdom-muted">
          {i + 1}/{cards.length}
        </span>
        <span className="rounded-lg border border-emerald-400/25 px-2.5 py-1 text-emerald-200">Know {stats.know}</span>
        <span className="rounded-lg border border-amber-400/25 px-2.5 py-1 text-amber-200">Learning {stats.learning}</span>
        <span className="rounded-lg border border-rose-400/25 px-2.5 py-1 text-rose-200">Again {stats.again}</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full text-left rounded-2xl border border-white/12 bg-wisdom-card p-6"
        style={{ minHeight: 300 }}
      >
        <p className="text-[10px] uppercase tracking-wider text-violet-300/80 mb-2">
          {flipped ? "Answer" : "Question"} · tap to flip
        </p>
        <div className="study-prose text-white text-base leading-relaxed">
          <RichContent body={flipped ? card.back : card.front} />
        </div>
      </button>

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <button type="button" onClick={() => { if (i > 0) { setI(i - 1); setFlipped(false); } }} disabled={i === 0}
            className="p-2 rounded-xl border border-white/12 disabled:opacity-40">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => { if (i < cards.length - 1) { setI(i + 1); setFlipped(false); } }} disabled={i >= cards.length - 1}
            className="p-2 rounded-xl border border-white/12 disabled:opacity-40">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => grade("again")}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-400/40 text-rose-200 text-sm font-semibold">
            <X className="w-4 h-4" /> Again
          </button>
          <button type="button" onClick={() => grade("learning")}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-amber-400/40 text-amber-200 text-sm font-semibold">
            Learning
          </button>
          <button type="button" onClick={() => grade("know")}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500 text-wisdom-dark text-sm font-bold">
            <Check className="w-4 h-4" /> Know
          </button>
        </div>
      </div>
    </div>
  );
}
