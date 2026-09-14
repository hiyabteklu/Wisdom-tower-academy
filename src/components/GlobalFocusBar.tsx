"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer } from "lucide-react";
import {
  FOCUS_EVENT,
  formatFocusClock,
  pickNudge,
  readFocusState,
  remainingSec,
  resetFocus,
} from "@/lib/focus-timer";

/**
 * Floating bar while a focus session is active — survives leaving My Learning.
 */
export default function GlobalFocusBar() {
  const pathname = usePathname() || "/";
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [leaveNudge, setLeaveNudge] = useState<ReturnType<typeof pickNudge> | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const sync = useCallback(() => {
    const s = readFocusState();
    const r = remainingSec(s);
    setLeft(r);
    setRunning(Boolean(s.running && r > 0));
    if (s.running && r <= 0) {
      resetFocus(s.totalSec);
    }
  }, []);

  useEffect(() => {
    sync();
    const onEvt = () => sync();
    window.addEventListener(FOCUS_EVENT, onEvt);
    window.addEventListener("storage", onEvt);
    const id = window.setInterval(sync, 500);
    return () => {
      window.removeEventListener(FOCUS_EVENT, onEvt);
      window.removeEventListener("storage", onEvt);
      window.clearInterval(id);
    };
  }, [sync]);

  // Soft nudge when leaving the learning area while timer runs
  useEffect(() => {
    if (!running) return;
    if (pathname.startsWith("/learning")) return;

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      if (href.startsWith("/learning")) return;
      // Allow academy content while studying
      if (href.startsWith("/academy") || href.startsWith("/packages")) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
      setLeaveNudge(pickNudge());
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [running, pathname]);

  if (!running && !leaveNudge) return null;

  return (
    <>
      {running ? (
        <Link
          href="/learning"
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2.5 rounded-2xl border border-amber-400/40 bg-wisdom-card/95 px-3.5 py-2.5 shadow-lg shadow-black/40 backdrop-blur-md hover:border-amber-300/60 transition-colors"
          title="Focus timer running"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
            <Timer className="w-4 h-4" />
          </span>
          <span className="font-display text-base font-black tabular-nums text-white">
            {formatFocusClock(left)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80 hidden sm:inline">
            Focus
          </span>
        </Link>
      ) : null}

      {leaveNudge && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-sm rounded-3xl border border-rose-400/30 bg-wisdom-card p-6 text-center shadow-card-3d">
            <p className="text-5xl mb-3" aria-hidden>
              {leaveNudge.face}
            </p>
            <h3 className="font-display text-xl font-bold text-white mb-2">{leaveNudge.title}</h3>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-6">{leaveNudge.body}</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setLeaveNudge(null);
                  setPendingHref(null);
                }}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400"
              >
                Stay on task
              </button>
              <button
                type="button"
                onClick={() => {
                  const href = pendingHref;
                  setLeaveNudge(null);
                  setPendingHref(null);
                  if (href) window.location.href = href;
                }}
                className="w-full rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-wisdom-muted hover:text-white"
              >
                Leave anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
