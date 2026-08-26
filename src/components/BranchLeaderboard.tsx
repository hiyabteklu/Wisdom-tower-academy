"use client";

import { useState } from "react";
import { Trophy, Medal, ChevronDown } from "lucide-react";

export type LeaderEntry = {
  rank: number;
  name: string;
  score: number;
  badge?: string;
};

export function sampleLeaders(branchLabel: string): LeaderEntry[] {
  const seeds = [
    "Amanuel T.",
    "Sara K.",
    "Yonas M.",
    "Hiwot B.",
    "Daniel G.",
    "Meron A.",
    "Kidus R.",
    "Betty S.",
    "Natnael W.",
    "Ruth L.",
  ];
  return seeds.map((name, i) => ({
    rank: i + 1,
    name,
    score: 980 - i * 37 - (branchLabel.length % 7),
    badge: i === 0 ? "Champion" : i === 1 ? "Runner-up" : i === 2 ? "Third" : undefined,
  }));
}

type Props = {
  branchName: string;
  accent?: string;
  /** Start collapsed to save space (default true) */
  defaultOpen?: boolean;
};

export default function BranchLeaderboard({
  branchName,
  accent = "text-amber-400",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const leaders = sampleLeaders(branchName);
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const podiumStyles = [
    "order-2 sm:order-1 sm:mt-6 border-amber-400/50 bg-gradient-to-b from-amber-500/20 to-transparent",
    "order-1 sm:order-2 border-yellow-300/60 bg-gradient-to-b from-yellow-400/25 to-transparent scale-105",
    "order-3 sm:mt-8 border-orange-400/40 bg-gradient-to-b from-orange-500/15 to-transparent",
  ];
  const trophyColor = ["text-amber-300", "text-yellow-300", "text-orange-400"];

  return (
    <section className="mb-10 md:mb-12 rounded-3xl border border-white/12 bg-wisdom-card/80 overflow-hidden shadow-card-3d">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30">
            <Trophy className={`w-5 h-5 ${accent}`} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              {branchName} <span className={accent}>Leaderboard</span>
            </h2>
            <p className="text-xs text-wisdom-muted">
              {open ? "Top 10 · tap to collapse" : "Top 10 · tap to expand"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!open && (
            <div className="hidden sm:flex items-center -space-x-2">
              {top3.map((e) => (
                <span
                  key={e.rank}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-wisdom-dark text-[10px] font-bold ${accent}`}
                  title={`#${e.rank} ${e.name}`}
                >
                  {e.rank}
                </span>
              ))}
            </div>
          )}
          <ChevronDown
            className={`w-5 h-5 text-wisdom-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10">
            <div className="px-4 sm:px-6 pt-8 pb-4 grid grid-cols-3 gap-2 sm:gap-4 items-end">
              {[top3[1], top3[0], top3[2]].map((entry) => {
                if (!entry) return null;
                const rank = entry.rank;
                const style =
                  rank === 1 ? podiumStyles[1] : rank === 2 ? podiumStyles[0] : podiumStyles[2];
                const tColor =
                  rank === 1 ? trophyColor[1] : rank === 2 ? trophyColor[0] : trophyColor[2];
                return (
                  <div
                    key={entry.rank}
                    className={`relative rounded-2xl border px-2 sm:px-4 py-4 text-center ${style}`}
                  >
                    <div className={`mx-auto mb-2 flex justify-center ${tColor}`}>
                      {rank === 1 ? <Trophy className="w-8 h-8" /> : <Medal className="w-7 h-7" />}
                    </div>
                    <p className="text-2xl sm:text-3xl font-black font-display tabular-nums text-white/90">
                      {rank}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-semibold truncate">{entry.name}</p>
                    <p className={`text-[11px] sm:text-xs font-bold mt-0.5 ${accent}`}>{entry.score} pts</p>
                  </div>
                );
              })}
            </div>

            <ul className="px-4 sm:px-6 pb-6 space-y-1.5">
              {rest.map((entry) => (
                <li
                  key={entry.rank}
                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-wisdom-dark/40 px-3 py-2.5"
                >
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-wisdom-muted tabular-nums">
                    {entry.rank}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{entry.name}</span>
                  <span className={`text-sm font-semibold tabular-nums ${accent}`}>{entry.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
