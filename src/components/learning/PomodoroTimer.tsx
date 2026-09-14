"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";

const PRESETS = [
  { label: "Focus 25", minutes: 25 },
  { label: "Short 5", minutes: 5 },
  { label: "Long 15", minutes: 15 },
] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function PomodoroTimer() {
  const [totalSec, setTotalSec] = useState(25 * 60);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);

  const reset = useCallback((sec?: number) => {
    const t = sec ?? totalSec;
    setRunning(false);
    endAt.current = null;
    setLeft(t);
    if (sec != null) setTotalSec(sec);
  }, [totalSec]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (endAt.current == null) return;
      const remaining = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0) {
        setRunning(false);
        endAt.current = null;
        try {
          if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.(200);
          }
        } catch {
          /* ignore */
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running]);

  function start() {
    if (left <= 0) return;
    endAt.current = Date.now() + left * 1000;
    setRunning(true);
  }

  function pause() {
    if (endAt.current) {
      setLeft(Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000)));
    }
    endAt.current = null;
    setRunning(false);
  }

  const mins = Math.floor(left / 60);
  const secs = left % 60;
  const progress = totalSec > 0 ? 1 - left / totalSec : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);

  return (
    <CollapsibleSection
      title="Focus timer"
      subtitle={running ? "Running" : left < totalSec && left > 0 ? "Paused" : "Pomodoro"}
      icon={<Timer className="w-5 h-5 text-amber-300" />}
      defaultOpen={false}
    >
      <div className="rounded-3xl border border-white/12 bg-wisdom-card p-6 sm:p-8 text-center shadow-card-3d">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={running}
              onClick={() => reset(p.minutes * 60)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
                totalSec === p.minutes * 60
                  ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                  : "border-white/10 text-wisdom-muted hover:border-white/25"
              } disabled:opacity-50`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-4xl sm:text-5xl font-black tabular-nums text-white tracking-tight">
              {pad(mins)}:{pad(secs)}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-wisdom-muted mt-1">
              {running ? "Focus" : left === 0 ? "Done" : "Ready"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {running ? (
            <button
              type="button"
              onClick={pause}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              disabled={left <= 0}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400 disabled:opacity-40"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          )}
          <button
            type="button"
            onClick={() => reset(totalSec)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-wisdom-muted hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}
