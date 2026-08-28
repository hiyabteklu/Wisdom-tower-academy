import Link from "next/link";
import { grades } from "@/data/academy";
import { BadgeCheck, ChevronRight } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";

export default function GradesPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up text-center sm:text-left">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-sky-400/90 mb-3">
            Secondary path
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Grade <span className="text-sky-400">9–12</span>
          </h1>
          <p className="text-wisdom-muted text-lg max-w-xl leading-relaxed mx-auto sm:mx-0">
            Choose your grade. Each level opens the same resource hubs.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <BranchLeaderboard branchName="Grade 9–12" accent="text-sky-400" />
        </div>

        {/* 4 grade cards — 16:9, no gradient, no subtitle */}
        <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 stagger-children">
          {grades.map((grade) => (
            <Link
              key={grade.id}
              href={`/academy/grades/${grade.id}`}
              className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border bg-wisdom-card ${grade.ring}`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={grade.image}
                  alt={grade.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8 flex items-center justify-between gap-2">
                <h2
                  className={`flex items-center gap-1.5 font-display text-lg font-bold ${grade.accent}`}
                >
                  <BadgeCheck className="w-4 h-4 shrink-0 text-sky-400" aria-label="Verified" />
                  {grade.label}
                </h2>
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${grade.accent}`}>
                  Open
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-wisdom-muted">
          Same structure in every grade — only the content depth changes.
        </p>
      </div>
    </div>
  );
}
