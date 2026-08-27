"use client";

import { Play } from "lucide-react";

type Props = {
  /** Clean section title, e.g. "What you'll find here" */
  title: string;
  /** Short supporting line under the title */
  subtitle?: string;
  /** Optional YouTube video id — when set, embeds the real player */
  youtubeId?: string;
  /** Visual accent: academy (amber) | digital (cyan) */
  variant?: "academy" | "digital";
};

/**
 * 16:9 welcome video in a framed card.
 * Without youtubeId: polished placeholder until real video is ready.
 */
export default function WelcomeVideoCard({
  title,
  subtitle,
  youtubeId,
  variant = "academy",
}: Props) {
  const isAcademy = variant === "academy";
  const accent = isAcademy
    ? {
        label: "text-amber-400/90",
        border: "border-amber-400/25",
        glow: "from-amber-500/15 via-transparent to-transparent",
        play: "bg-amber-500/20 border-amber-400/40 text-amber-200",
        ring: "ring-amber-400/20",
      }
    : {
        label: "text-cyan-400/90",
        border: "border-cyan-400/25",
        glow: "from-cyan-500/15 via-transparent to-transparent",
        play: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200",
        ring: "ring-cyan-400/20",
      };

  return (
    <section className="w-full max-w-3xl mx-auto" aria-label={title}>
      <div
        className={`rounded-3xl border ${accent.border} bg-wisdom-card overflow-hidden shadow-card-3d`}
      >
        {/* Header */}
        <div className={`px-5 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r ${accent.glow}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${accent.label} mb-1`}>
            Welcome
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-wisdom-muted leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* 16:9 frame */}
        <div className="relative w-full aspect-video bg-wisdom-dark/80">
          {youtubeId ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-wisdom-navy via-wisdom-dark to-black/80 ring-1 ring-inset ${accent.ring}`}
            >
              <div
                className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border ${accent.play}`}
                aria-hidden
              >
                <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
              </div>
              <p className="text-sm font-medium text-white/80">Video coming soon</p>
              <p className="text-xs text-wisdom-muted max-w-[16rem] text-center px-4">
                A short welcome clip will play here — 16:9, same frame when the real file is ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
