"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, RotateCcw, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { saveProgress } from "@/lib/content";
import RichContent from "@/components/learning/RichContent";

type Card = { front: string; back: string };

type Props = {
  meta: Record<string, unknown>;
  resourceId?: string;
};

type Grade = "know" | "learning" | "again";

type SlidePhase = "idle" | "exit" | "enter";

const CARD_MIN_H = 300;
const SLIDE_MS = 280;

export default function FlashcardViewer({ meta, resourceId }: Props) {
  const cards = (Array.isArray(meta.cards) ? meta.cards : []) as Card[];
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [grades, setGrades] = useState<Record<number, Grade>>({});
  const [done, setDone] = useState(false);

  // Slide transition state
  const [phase, setPhase] = useState<SlidePhase>("idle");
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = next (left), -1 = prev (right)
  const pendingIndex = useRef<number | null>(null);
  const animLock = useRef(false);

  const card = cards[i];

  const stats = useMemo(() => {
    const vals = Object.values(grades);
    const know = vals.filter((g) => g === "know").length;
    const learning = vals.filter((g) => g === "learning").length;
    const again = vals.filter((g) => g === "again").length;
    const seen = vals.length;
    return { know, learning, again, seen, total: cards.length };
  }, [grades, cards.length]);

  useEffect(() => {
    if (!resourceId || stats.seen === 0) return;
    const pct =
      cards.length > 0 ? Math.round((stats.know / cards.length) * 100) : 0;
    void saveProgress({
      resourceId,
      progressPct: pct,
      meta: {
        flashcards: {
          know: stats.know,
          learning: stats.learning,
          again: stats.again,
          seen: stats.seen,
          total: stats.total,
          accuracy:
            stats.seen > 0
              ? Math.round((stats.know / stats.seen) * 100)
              : 0,
        },
      },
    });
  }, [stats, resourceId, cards.length]);

  // Reset flip when card index changes
  useEffect(() => {
    setFlipped(false);
  }, [i]);

  function slideTo(nextIndex: number, dir: 1 | -1) {
    if (animLock.current || nextIndex === i) return;
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    animLock.current = true;
    pendingIndex.current = nextIndex;
    setDirection(dir);
    setPhase("exit");

    window.setTimeout(() => {
      const target = pendingIndex.current;
      if (target != null) setI(target);
      setFlipped(false);
      setPhase("enter");

      // Force enter start frame, then animate to idle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("idle");
          window.setTimeout(() => {
            animLock.current = false;
            pendingIndex.current = null;
          }, SLIDE_MS);
        });
      });
    }, SLIDE_MS);
  }

  if (!cards.length) {
    return <p className="text-sm text-wisdom-muted">No cards in this deck.</p>;
  }

  function grade(g: Grade) {
    setGrades((prev) => ({ ...prev, [i]: g }));
    setFlipped(false);
    if (i >= cards.length - 1) {
      setDone(true);
    } else {
      slideTo(i + 1, 1);
    }
  }

  function reset() {
    setI(0);
    setFlipped(false);
    setGrades({});
    setDone(false);
    setPhase("idle");
    animLock.current = false;
    pendingIndex.current = null;
  }

  function goPrev() {
    if (i <= 0 || animLock.current) return;
    slideTo(i - 1, -1);
  }

  function goNext() {
    if (animLock.current) return;
    if (i >= cards.length - 1) {
      setDone(true);
      return;
    }
    slideTo(i + 1, 1);
  }

  // Transform for slide phases
  const slideStyle = ((): React.CSSProperties => {
    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    if (phase === "exit") {
      return {
        transform: `translateX(${direction === 1 ? "-110%" : "110%"}) scale(0.94)`,
        opacity: 0,
        transition: `transform ${SLIDE_MS}ms ${ease}, opacity ${SLIDE_MS}ms ease`,
      };
    }
    if (phase === "enter") {
      // Start off-screen from the opposite side (no transition yet)
      return {
        transform: `translateX(${direction === 1 ? "110%" : "-110%"}) scale(0.94)`,
        opacity: 0,
        transition: "none",
      };
    }
    // idle — settled
    return {
      transform: "translateX(0) scale(1)",
      opacity: 1,
      transition: `transform ${SLIDE_MS}ms ${ease}, opacity ${SLIDE_MS}ms ease`,
    };
  })();

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 text-center">
          <BarChart3 className="w-8 h-8 text-amber-300 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-white mb-1">
            Deck report
          </h3>
          <p className="text-sm text-wisdom-muted mb-4">
            {stats.seen} of {stats.total} cards reviewed
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Know" value={stats.know} color="text-emerald-300" />
            <Stat label="Learning" value={stats.learning} color="text-amber-300" />
            <Stat label="Again" value={stats.again} color="text-rose-300" />
          </div>
          <p className="mt-4 text-sm text-white/80">
            Mastery:{" "}
            <span className="font-bold text-amber-200">
              {stats.total ? Math.round((stats.know / stats.total) * 100) : 0}%
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" /> Study again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between text-xs text-wisdom-muted">
        <span>
          Card {i + 1}/{cards.length}
        </span>
        <span>
          Know {stats.know} · Learning {stats.learning} · Again {stats.again}
        </span>
      </div>

      {/* Slide stage — overflow hides entering/exiting cards */}
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: CARD_MIN_H }}>
        <div
          className="relative w-full cursor-pointer will-change-transform"
          style={{ perspective: "1200px", minHeight: CARD_MIN_H, ...slideStyle }}
          onClick={() => {
            if (phase !== "idle") return;
            setFlipped((f) => !f);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (phase !== "idle") return;
              setFlipped((f) => !f);
            }
          }}
          aria-label={flipped ? "Show prompt" : "Show answer"}
        >
          <div
            className="relative w-full h-full transition-transform duration-500 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              minHeight: CARD_MIN_H,
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-[#1a2332] via-wisdom-card to-[#0f172a] p-7 sm:p-8 text-center shadow-xl overflow-y-auto"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <p className="text-[10px] uppercase tracking-wider text-amber-300/80 mb-3 font-semibold">
                Prompt · tap to flip
              </p>
              <div className="text-xl sm:text-2xl font-semibold text-white leading-snug study-prose w-full">
                <RichContent body={card.front} />
              </div>
            </div>

            {/* Back — deeper green */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-emerald-800/50 bg-gradient-to-br from-[#0d3b2e] via-[#0a2f25] to-[#06261e] p-7 sm:p-8 text-center shadow-xl shadow-emerald-950/50 overflow-y-auto"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-emerald-200/70 mb-3 font-semibold">
                Answer · tap to flip back
              </p>
              <div className="text-xl sm:text-2xl font-semibold text-white leading-snug study-prose w-full">
                <RichContent body={card.back} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Prev / Next navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={i === 0 || phase !== "idle"}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 bg-wisdom-dark/50 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-400/40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          disabled={phase !== "idle"}
          className="px-3 py-2 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-xs font-bold disabled:opacity-40"
        >
          {flipped ? "Show prompt" : "Flip card"}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={phase !== "idle"}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-60"
        >
          {i >= cards.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {flipped && phase === "idle" ? (
        <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-300">
          <button
            type="button"
            onClick={() => grade("again")}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 text-xs font-semibold"
          >
            <X className="w-4 h-4" /> Again
          </button>
          <button
            type="button"
            onClick={() => grade("learning")}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-xs font-semibold"
          >
            ~ Learning
          </button>
          <button
            type="button"
            onClick={() => grade("know")}
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-xs font-semibold"
          >
            <Check className="w-4 h-4" /> Know
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-wisdom-muted">
          Flip the card, then rate how well you knew it — or use Previous / Next to move.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-wisdom-dark/40 py-3">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">
        {label}
      </p>
    </div>
  );
}
