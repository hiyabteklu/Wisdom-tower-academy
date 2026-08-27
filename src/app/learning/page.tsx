"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  LogIn,
} from "lucide-react";
import { getPackage } from "@/data/packages";
import { listMyEnrollments } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

type LearningRow = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  progress: number;
  status: "in_progress" | "not_started" | "completed";
  lastAccess?: string;
};

export default function LearningPage() {
  const [rows, setRows] = useState<LearningRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setLoggedIn(Boolean(session?.user));

      if (!session?.user) {
        setRows([]);
        setLoading(false);
        return;
      }

      const enrollments = await listMyEnrollments();
      if (cancelled) return;

      const mapped: LearningRow[] = enrollments.map((e) => {
        const pkg = getPackage(e.packageId);
        return {
          id: e.packageId,
          title: pkg?.name || e.packageName,
          subtitle: pkg?.description || "Enrolled package",
          href: pkg?.href || "/academy",
          image:
            pkg?.image ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
          progress: 0,
          status: "not_started" as const,
          lastAccess: new Date(e.createdAt).toLocaleDateString(),
        };
      });

      setRows(mapped);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((i) => i.status === "in_progress").length,
      done: rows.filter((i) => i.status === "completed").length,
    }),
    [rows]
  );

  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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
                Packages you’ve purchased and we’ve verified appear here.
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

        {loading ? (
          <p className="text-center text-wisdom-muted py-16">Loading…</p>
        ) : !loggedIn ? (
          <div className="rounded-3xl border border-white/10 bg-wisdom-card p-10 text-center">
            <LogIn className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Sign in to see your library</p>
            <p className="text-sm text-wisdom-muted mb-6 max-w-sm mx-auto">
              Use the same email you put on checkout so verified packages unlock here.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
              >
                Sign in
              </Link>
              <Link
                href="/packages"
                className="px-4 py-2 rounded-xl border border-amber-400/40 text-amber-300 text-sm font-semibold"
              >
                Browse packages
              </Link>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-wisdom-card p-10 text-center">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Nothing here yet</p>
            <p className="text-sm text-wisdom-muted mb-6 max-w-sm mx-auto">
              After you pay and we verify your transfer, packages appear in this library.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/packages"
                className="px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold"
              >
                Browse packages
              </Link>
              <Link
                href="/academy"
                className="px-4 py-2 rounded-xl border border-cyan-400/40 text-cyan-300 text-sm font-semibold"
              >
                Explore Academy
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((item) => (
              <Link
                key={item.id}
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
                    <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      <GraduationCap className="w-3 h-3" />
                      Academy
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
                  <h3 className="font-display font-bold text-white group-hover:text-wisdom-cyan transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-wisdom-muted mb-3 line-clamp-2">{item.subtitle}</p>
                  <div className="flex items-center gap-2 text-[11px] text-wisdom-muted mb-2">
                    {item.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    Enrolled{item.lastAccess ? ` · ${item.lastAccess}` : ""}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-wisdom-cyan">
                    Open path
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-wisdom-muted flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Verified purchases sync from your account email
        </p>
      </div>
    </div>
  );
}
