"use client";

import { useEffect } from "react";
import { CloudUpload, Sparkles, X } from "lucide-react";
import { COMING_SOON_BODY, COMING_SOON_TITLE } from "@/data/content-availability";

type Props = {
  open: boolean;
  onClose: () => void;
  hubName?: string;
};

export default function ComingSoonModal({ open, onClose, hubName }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="coming-soon-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[min(24rem,calc(100vw-2rem))] max-h-[min(90dvh,32rem)] overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-gradient-to-b from-[#121a2e] to-[#0a0f1a] shadow-2xl shadow-amber-500/10"
        style={{ margin: "auto" }}
      >
        <div className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full border border-white/10 p-2 text-wisdom-muted hover:text-white hover:bg-white/5"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative px-5 pt-9 pb-7 text-center sm:px-8 sm:pt-10 sm:pb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <CloudUpload className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="w-3 h-3" />
            Coming soon
          </p>

          <h2
            id="coming-soon-title"
            className="font-display text-lg sm:text-2xl font-extrabold text-white tracking-tight mb-2 sm:mb-3"
          >
            {COMING_SOON_TITLE}
          </h2>

          {hubName && (
            <p className="text-sm font-semibold text-cyan-300/90 mb-2">{hubName}</p>
          )}

          <p className="text-sm text-wisdom-muted leading-relaxed max-w-sm mx-auto mb-6">
            {COMING_SOON_BODY}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-wisdom-dark hover:bg-amber-400 transition-colors"
          >
            Got it — check back later
          </button>
        </div>
      </div>
    </div>
  );
}
