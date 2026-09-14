"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  FOCUS_EVENT,
  formatFocusClock,
  pauseFocus,
  pickNudge,
  pickStartLine,
  readFocusState,
  remainingSec,
  resetFocus,
  setPreset,
  startFocus,
  type FocusState,
} from "@/lib/focus-timer";

const PRESETS = [
  { label: "Focus 25", minutes: 25 },
  { label: "Short 5", minutes: 5 },
  { label: "Long 15", minutes: 15 },
] as const;

export default function PomodoroTimer() {
  const [state, setState] = useState<FocusState>(() => readFocusState());
  const [left, setLeft] = useState(() => remainingSec(readFocusState()));
  const [startLine, setStartLine] = useState<string | null>(null);
  const [nudge, setNudge] = useState<ReturnType<typeof pickNudge> | null>(null);
  const [pendingAction, setPendingAction] = useState<"pause" | "reset" | null>(null);

  const sync = useCallback(() => {
    const s = readFocusState();
    setState(s);
    setLeft(remainingSec(s));
  }, []);

  useEffect(() => {
    sync();
    const onEvt = () => sync();
    window.addEventListener(FOCUS_EVENT, onEvt);
    window.addEventListener("storage", onEvt);
    return () => {
      window.removeEventListener(FOCUS_EVENT, onEvt);
      window.removeEventListener("storage", onEvt);
    };
  }, [sync]);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      const s = readFocusState();
      const r = remainingSec(s);
      setLeft(r);
      if (r <= 0 && s.running) {
        resetFocus(s.totalSec);
        sync();
        try {
          navigator.vibrate?.(200);
        } catch {
          /* ignore */
        }
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [state.running, sync]);

  function onStart() {
    startFocus();
    setStartLine(pickStartLine());
    sync();
  }

  function requestStop(kind: "pause" | "reset") {
    if (!state.running) {
      if (kind === "reset") {
        resetFocus();
        setStartLine(null);
        sync();
      }
      return;
    }
    setPendingAction(kind);
    setNudge(pickNudge());
  }

  function confirmStop() {
    if (pendingAction === "pause") pauseFocus();
    if (pendingAction === "reset") resetFocus();
    setPendingAction(null);
    setNudge(null);
    setStartLine(null);
    sync();
  }

  function keepGoing() {
    setPendingAction(null);
    setNudge(null);
  }

  const progress = state.totalSec > 0 ? 1 - left / state.totalSec : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const running = state.running && left > 0;

  return (
    <>
      <CollapsibleSection
        title="Focus timer"
        subtitle={running ? "Running · stays on while you study" : left < state.totalSec && left > 0 ? "Paused" : "Pomodoro"}
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
                onClick={() => {
                  setPreset(p.minutes * 60);
                  setStartLine(null);
                  sync();
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  state.totalSec === p.minutes * 60
                    ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                    : "border-white/10 text-wisdom-muted hover:border-white/25"
                } disabled:opacity-50`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
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
                {formatFocusClock(left)}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-wisdom-muted mt-1">
                {running ? "Focus" : left === 0 ? "Done" : "Ready"}
              </p>
            </div>
          </div>

          {startLine && running ? (
            <p className="mb-5 text-sm text-amber-100/90 leading-relaxed max-w-sm mx-auto font-medium">
              {startLine}
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-3">
            {running ? (
              <button
                type="button"
                onClick={() => requestStop("pause")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={onStart}
                disabled={left <= 0}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400 disabled:opacity-40"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
            <button
              type="button"
              onClick={() => requestStop("reset")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-wisdom-muted hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <p className="mt-4 text-[11px] text-wisdom-muted">
            Timer keeps running when you open books, notes, or other pages.
          </p>
        </div>
      </CollapsibleSection>

      {nudge && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-400/30 bg-wisdom-card p-6 text-center shadow-card-3d">
            <p className="text-5xl mb-3" aria-hidden>
              {nudge.face}
            </p>
            <h3 className="font-display text-xl font-bold text-white mb-2">{nudge.title}</h3>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-6">{nudge.body}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={keepGoing}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400"
              >
                Keep studying
              </button>
              <button
                type="button"
                onClick={confirmStop}
                className="w-full rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-wisdom-muted hover:text-white"
              >
                {pendingAction === "reset" ? "Reset anyway" : "Pause anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
