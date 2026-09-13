import CategoryBackButton from "@/components/CategoryBackButton";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import { Users, Clock } from "lucide-react";
import { COMING_SOON_BODY, COMING_SOON_TITLE } from "@/data/content-availability";

export default function GatPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/30 bg-wisdom-card text-rose-400">
              <Users className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Academic branch
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-rose-400">GAT</span> pathway
          </h1>
          <p className="text-wisdom-muted text-base leading-relaxed max-w-xl">
            Graduate Admission Test resources will be organized by field and department — not a
            single shared hub grid.
          </p>
        </div>

        <div className="mb-8">
          <PackageOfferBanner packageId="gat" />
        </div>

        <div className="rounded-3xl border border-rose-400/25 bg-wisdom-card p-8 sm:p-10 text-center shadow-card-3d">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">{COMING_SOON_TITLE}</h2>
          <p className="text-sm text-wisdom-muted leading-relaxed max-w-md mx-auto">
            {COMING_SOON_BODY}
          </p>
          <p className="mt-4 text-xs text-wisdom-muted">
            Leaderboard, progress tracker, books, and practice hubs are intentionally hidden until
            department tracks are ready.
          </p>
        </div>
      </div>
    </div>
  );
}
