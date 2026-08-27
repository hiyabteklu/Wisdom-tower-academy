"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Monitor,
  Play,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { demoLearning, type LearningItem } from "@/data/learning";

type Tab = "all" | "in_progress" | "completed" | "academy" | "digital";

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "academy", label: "Academy" },
  { id: "digital", label: "Digital" },
];

function ProgressBar({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${accent}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function LearningCard({ item }: { item: LearningItem }) {
  const isAcademy = item.space === "academy";
  const bar = isAcademy ? "bg-amber-400" : "bg-cyan-400";
  const chip =
    item.status === "completed"
      ? "border-emerald-400/35 text-emerald-300 bg-emerald-500/10"
      : item.status === "in_progress"
        ? isAcademy
          ? "border-amber-400/35 text-amber-300 bg-amber-500/10"
          : "border-cyan-400/35 text-cyan-300 bg-cyan-500/10"
        : "border-white/15 text-white/70 bg-white/5";

  return (
    <Link
      href={item.href}
      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card hover:border-white/25 transition-all duration-300 shadow-card-3d"
    >
      <div className="relative sm:w-44 h-36 sm:h-auto shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${item.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-wisdom-card via-wisdom-card/40 to-transparent" />
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
          <span
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isAcademy
                ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                : "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
            }`}
          >
            {isAcademy ? (
              <GraduationCap className="w-3 h-3" />
            ) : (
              <Monitor className="w-3 h-3" />
            )}
            {item.space}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-white group-hover:text-wisdom-cyan transition-colors leading-snug">
            {item.title}
          </h3>
          {item.badge && (
            <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${chip}`}>
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-sm text-wisdom-muted mb-3 line-clamp-2">{item.subtitle}</p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-wisdom-muted">
            <span className="flex items-center gap-1">
              {item.status === "completed" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {item.status === "completed"
                ? "Completed"
                : item.status === "not_started"
                  ? "Not started"
                  : `${item.progress}% complete`}
            </span>
            {item.lastAccess && <span>{item.lastAccess}</span>}
          </div>
          <ProgressBar value={item.progress} accent={bar} />
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-wisdom-cyan">
          {item.status === "completed" ? (
            <>
              Review
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </>
          ) : item.status === "not_started" ? (
            <>
              Start
              <Play className="w-3.5 h-3.5 fill-current" />
            </>
          ) : (
            <>
              Continue
              <Play className="w-3.5 h-3.5 fill-current" />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LearningPage() {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    return demoLearning.filter((item) => {
      if (tab === "all") return true;
      if (tab === "in_progress") return item.status === "in_progress";
      if (tab === "completed") return item.status === "completed";
      if (tab === "academy") return item.space === "academy";
      if (tab === "digital") return item.space === "digital";
      return true;
    });
  }, [tab]);

  const continueItem = demoLearning.find((i) => i.status === "in_progress");
  const stats = {
    total: demoLearning.length,
    active: demoLearning.filter((i) => i.status === "in_progress").length,
    done: demoLearning.filter((i) => i.status === "completed").length,
  };

  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Hero */}
        <div className="mb-10 md:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-2">
            Your library
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                My Learning
              </h1>
              <p className="mt-2 text-wisdom-muted max-w-lg text-sm sm:text-base leading-relaxed">
                Courses, exam paths, and digital work you’ve enrolled in or purchased — one place,
                clear progress.
              </p>
            </div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Cart
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
            {[
              { label: "In library", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Completed", value: stats.done },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-wisdom-card/80 px-3 py-3 text-center"
              >
                <p className="text-xl font-black tabular-nums text-white">{s.value}</p>
                <p className="text-[10px] text-wisdom-muted uppercase tracking-wider mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Continue learning spotlight */}
        {continueItem && (
          <div className="mb-10 rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 via-wisdom-card to-wisdom-card overflow-hidden shadow-card-3d">
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-56 h-40 md:h-auto shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${continueItem.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-wisdom-card to-transparent" />
              </div>
              <div className="p-6 md:p-8 flex-1">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pick up where you left off
                </p>
                <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-1">
                  {continueItem.title}
                </h2>
                <p className="text-sm text-wisdom-muted mb-4">{continueItem.subtitle}</p>
                <ProgressBar value={continueItem.progress} accent="bg-cyan-400" />
                <p className="text-xs text-wisdom-muted mt-2 mb-5">
                  {continueItem.progress}% complete
                  {continueItem.lastAccess ? ` · ${continueItem.lastAccess}` : ""}
                </p>
                <Link
                  href={continueItem.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold hover:bg-cyan-300 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Continue learning
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                tab === t.id
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 bg-white/[0.03] text-wisdom-muted hover:text-white hover:border-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-wisdom-card p-10 text-center">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Nothing here yet</p>
            <p className="text-sm text-wisdom-muted mb-6 max-w-sm mx-auto">
              Explore Academy programs or Digital services — enrolled and purchased items will show
              up in this library.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/academy"
                className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold"
              >
                Browse Academy
              </Link>
              <Link
                href="/digital"
                className="px-4 py-2 rounded-xl border border-cyan-400/40 text-cyan-300 text-sm font-semibold"
              >
                Browse Digital
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <LearningCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-wisdom-muted">
          Demo library — real purchases and enrollments will sync here from your account.
        </p>
      </div>
    </div>
  );
}
