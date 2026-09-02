"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type LeaderEntry = {
  rank: number;
  name: string;
  score: number;
  badge?: string;
};

/** Fallback sample data when DB is empty or offline */
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
  /** Matches academic_results.scope_id (e.g. gat, freshman, uat). Defaults to lowercase branchName. */
  scopeId?: string;
  accent?: string;
  /** Expand ranks 4–10 by default (default false — only top 3 always visible) */
  defaultRestOpen?: boolean;
};

export default function BranchLeaderboard({
  branchName,
  scopeId,
  accent = "text-amber-400",
  defaultRestOpen = false,
}: Props) {
  const resolvedScope = (scopeId || branchName).toLowerCase().replace(/\s+/g, "-");
  const [restOpen, setRestOpen] = useState(defaultRestOpen);
  const [leaders, setLeaders] = useState<LeaderEntry[]>(() => sampleLeaders(branchName));
  const [fromDb, setFromDb] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Prefer RPC for ranked rows
        const { data: rpcData, error: rpcErr } = await supabase.rpc("get_leaderboard", {
          p_scope_id: resolvedScope,
          p_limit: 10,
        });

        if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
          if (cancelled) return;
          const mapped: LeaderEntry[] = rpcData.map(
            (row: {
              rank: number;
              name: string;
              score: number;
            }) => ({
              rank: Number(row.rank),
              name: String(row.name || "Student"),
              score: Number(row.score || 0),
              badge:
                Number(row.rank) === 1
                  ? "Champion"
                  : Number(row.rank) === 2
                    ? "Runner-up"
                    : Number(row.rank) === 3
                      ? "Third"
                      : undefined,
            })
          );
          setLeaders(mapped);
          setFromDb(true);
          return;
        }

        // Fallback: query view directly
        const { data: viewData, error: viewErr } = await supabase
          .from("leaderboard_by_scope")
          .select("display_name, score, best_percent, attempts")
          .eq("scope_id", resolvedScope)
          .order("score", { ascending: false })
          .limit(10);

        if (!viewErr && Array.isArray(viewData) && viewData.length > 0) {
          if (cancelled) return;
          const mapped: LeaderEntry[] = viewData.map((row, i) => ({
            rank: i + 1,
            name: String(row.display_name || "Student"),
            score: Number(row.score || 0),
            badge: i === 0 ? "Champion" : i === 1 ? "Runner-up" : i === 2 ? "Third" : undefined,
          }));
          setLeaders(mapped);
          setFromDb(true);
          return;
        }

        // No real data yet — keep sample
        if (!cancelled) {
          setLeaders(sampleLeaders(branchName));
          setFromDb(false);
        }
      } catch {
        if (!cancelled) {
          setLeaders(sampleLeaders(branchName));
          setFromDb(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [resolvedScope, branchName]);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3, 10);

  const podiumStyles = [
    "order-2 sm:order-1 sm:mt-6 border-amber-400/50 bg-gradient-to-b from-amber-500/20 to-transparent",
    "order-1 sm:order-2 border-yellow-300/60 bg-gradient-to-b from-yellow-400/25 to-transparent scale-105",
    "order-3 sm:mt-8 border-orange-400/40 bg-gradient-to-b from-orange-500/15 to-transparent",
  ];
  const trophyColor = ["text-amber-300", "text-yellow-300", "text-orange-400"];

  return (
    <section className="mb-10 md:mb-12 rounded-3xl border border-white/12 bg-wisdom-card/80 overflow-hidden shadow-card-3d">
      {/* Header — always visible */}
      <div className="w-full px-5 sm:px-7 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30">
            <Trophy className={`w-5 h-5 ${accent}`} />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              {branchName} <span className={accent}>Leaderboard</span>
            </h2>
            <p className="text-xs text-wisdom-muted">
              {loading
                ? "Loading…"
                : fromDb
                  ? "Live top performers · from your results"
                  : "Demo ranking · real scores appear after exams"}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 podium — ALWAYS visible (never collapsed) */}
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

        {/* Ranks 4–10 — collapsible */}
        {rest.length > 0 && (
          <div className="px-4 sm:px-6 pb-4">
            <button
              type="button"
              onClick={() => setRestOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-wisdom-dark/30 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
              aria-expanded={restOpen}
            >
              <span className="text-xs sm:text-sm text-wisdom-muted">
                {restOpen ? "Hide ranks 4–10" : `Show ranks 4–${Math.min(10, 3 + rest.length)}`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-wisdom-muted transition-transform duration-300 ${
                  restOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                restOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <ul className="pt-2 pb-2 space-y-1.5">
                  {rest.map((entry) => (
                    <li
                      key={entry.rank}
                      className="flex items-center gap-3 rounded-xl border border-white/6 bg-wisdom-dark/40 px-3 py-2.5"
                    >
                      <span className="w-7 h-7 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-wisdom-muted tabular-nums">
                        {entry.rank}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{entry.name}</span>
                      <span className={`text-sm font-semibold tabular-nums ${accent}`}>
                        {entry.score}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
