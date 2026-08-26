import { Trophy, Medal } from "lucide-react";

export type LeaderEntry = {
  rank: number;
  name: string;
  score: number;
  badge?: string;
};

/** Placeholder ranks until live scoring is wired */
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
};

export default function BranchLeaderboard({ branchName, accent = "text-amber-400" }: Props) {
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
    <section className="mb-12 md:mb-14 rounded-3xl border border-white/12 bg-wisdom-card/80 overflow-hidden shadow-card-3d">
      <div className="px-5 sm:px-7 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30">
            <Trophy className={`w-5 h-5 ${accent}`} />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight">
              {branchName} <span className={accent}>Leaderboard</span>
            </h2>
            <p className="text-xs text-wisdom-muted">Top 10 · updates as learners complete practice</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 text-wisdom-muted">
          Live ranks soon
        </span>
      </div>

      {/* Podium 1–3 */}
      <div className="px-4 sm:px-6 pt-8 pb-4 grid grid-cols-3 gap-2 sm:gap-4 items-end">
        {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
          if (!entry) return null;
          const styleIdx = visualIdx; // 1st visual is silver (rank2), center gold, right bronze
          const rank = entry.rank;
          const style =
            rank === 1 ? podiumStyles[1] : rank === 2 ? podiumStyles[0] : podiumStyles[2];
          const tColor = rank === 1 ? trophyColor[1] : rank === 2 ? trophyColor[0] : trophyColor[2];
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
              {entry.badge && (
                <p className="mt-1 text-[9px] uppercase tracking-wider text-wisdom-muted">{entry.badge}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* 4–10 list */}
      <ul className="px-4 sm:px-6 pb-6 space-y-1.5">
        {rest.map((entry) => (
          <li
            key={entry.rank}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-wisdom-dark/40 px-3 py-2.5 hover:border-white/12 transition-colors"
          >
            <span className="w-7 h-7 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-wisdom-muted tabular-nums">
              {entry.rank}
            </span>
            <span className="flex-1 text-sm font-medium truncate">{entry.name}</span>
            <span className={`text-sm font-semibold tabular-nums ${accent}`}>{entry.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
