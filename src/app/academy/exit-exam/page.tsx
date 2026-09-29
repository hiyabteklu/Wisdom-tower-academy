import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import { FileCheck2, Shield, Play, Sparkles } from "lucide-react";

export default function ExitExamPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-wisdom-card text-fuchsia-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Academic branch
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-fuchsia-400">Exit Exam</span>
          </h1>
          <p className="text-wisdom-muted text-sm leading-relaxed max-w-lg">
            University exit exam revision tracks and academic wave defense drills.
          </p>
        </div>

        {/* Featured Interactive Game: Tower Defense of Knowledge */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 sm:p-8 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Shield className="w-32 h-32 text-cyan-400" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Study Game · Now Live</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-2">
              Tower Defense of Knowledge
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-xl">
              Authentic exit exam questions march as incoming adversaries against your Knowledge Citadel.
              Deploy precision calculations, maintain combo streaks, and earn tactical power-ups.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/academy/exit-exam/tower-defense"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/50 hover:brightness-110 active:scale-95 transition-all text-sm font-display"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Exit Exam Defense</span>
              </Link>

              <Link
                href="/games/tower-defense"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/80 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-700 transition-all text-sm"
              >
                <span>Browse All Exam Citadels</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <PackageOfferBanner packageId="exit-exam" />
        </div>
      </div>
    </div>
  );
}
