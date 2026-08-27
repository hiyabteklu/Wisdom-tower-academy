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
  Lock,
  Unlock,
} from "lucide-react";
import {
  academyPackages,
  formatEtb,
  getPackage,
  type AcademyPackage,
} from "@/data/packages";
import { listMyEnrollments, listMyOrders, type ManualOrder } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

type UnlockedRow = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  enrolledAt?: string;
};

export default function LearningPage() {
  const [unlocked, setUnlocked] = useState<UnlockedRow[]>([]);
  const [pending, setPending] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setLoggedIn(Boolean(session?.user));
      setUserEmail(session?.user?.email ?? null);

      if (!session?.user) {
        setUnlocked([]);
        setPending([]);
        setLoading(false);
        return;
      }

      const [enrollments, orders] = await Promise.all([
        listMyEnrollments(),
        listMyOrders(),
      ]);
      if (cancelled) return;

      const mapped: UnlockedRow[] = enrollments.map((e) => {
        const pkg = getPackage(e.packageId);
        return {
          id: e.packageId,
          title: pkg?.name || e.packageName,
          subtitle: pkg?.description || "Enrolled package",
          href: pkg?.href || "/academy",
          image:
            pkg?.image ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
          enrolledAt: new Date(e.createdAt).toLocaleDateString(),
        };
      });

      const unlockedIds = new Set(mapped.map((r) => r.id));
      const pendingOrders = orders.filter(
        (o) =>
          o.status === "pending_verification" &&
          !unlockedIds.has(o.packageId)
      );

      setUnlocked(mapped);
      setPending(pendingOrders);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocked.map((u) => u.id)), [unlocked]);
  const pendingIds = useMemo(() => new Set(pending.map((p) => p.packageId)), [pending]);

  const lockedPackages = useMemo(
    () =>
      academyPackages.filter(
        (p) => !unlockedIds.has(p.id) && !pendingIds.has(p.id)
      ),
    [unlockedIds, pendingIds]
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
                Unlocked packages open full paths. Locked ones need a verified payment.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 self-start sm:self-auto">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
              >
                My orders
              </Link>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white/90 hover:border-cyan-400/40 hover:text-cyan-300 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Packages
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
            {[
              { label: "Unlocked", value: unlocked.length },
              { label: "Pending", value: pending.length },
              { label: "Locked", value: lockedPackages.length },
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
              Use the <strong className="text-white/80">same email</strong> you put on checkout so
              verified packages unlock here.
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
        ) : (
          <div className="space-y-10">
            {/* Unlocked */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-white">Unlocked</h2>
                <span className="text-xs text-wisdom-muted">({unlocked.length})</span>
              </div>
              {unlocked.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/12 p-8 text-center">
                  <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-wisdom-muted">
                    No verified packages yet
                    {userEmail ? (
                      <>
                        {" "}
                        for <span className="text-white/70">{userEmail}</span>
                      </>
                    ) : null}
                    . After admin approves payment, they appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unlocked.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-emerald-400/25 bg-wisdom-card hover:border-emerald-400/45 transition-all duration-300 shadow-card-3d"
                    >
                      <div className="relative sm:w-44 h-36 sm:h-auto shrink-0 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-wisdom-card via-wisdom-card/40 to-transparent" />
                        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Unlocked
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center min-w-0">
                        <h3 className="font-display font-bold text-white group-hover:text-wisdom-cyan transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm text-wisdom-muted mb-3 line-clamp-2">
                          {item.subtitle}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-wisdom-muted mb-2">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Enrolled{item.enrolledAt ? ` · ${item.enrolledAt}` : ""}
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
            </section>

            {/* Pending */}
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h2 className="font-semibold text-white">Pending verification</h2>
                </div>
                <ul className="space-y-3">
                  {pending.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-white">{o.packageName}</p>
                          <p className="text-xs font-mono text-wisdom-muted mt-0.5">{o.id}</p>
                          <p className="text-sm text-amber-200/90 mt-1">
                            {formatEtb(o.amountEtb)} · awaiting admin approval
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-400/40 bg-amber-500/15 text-amber-200 px-2.5 py-1">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-wisdom-muted mt-3">
                        You’ll get email/SMS when approved (if configured). Then this moves to
                        Unlocked.
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Locked catalog */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-wisdom-muted" />
                <h2 className="font-semibold text-white">Locked packages</h2>
                <span className="text-xs text-wisdom-muted">({lockedPackages.length})</span>
              </div>
              {lockedPackages.length === 0 ? (
                <p className="text-sm text-wisdom-muted text-center py-6">
                  You’ve unlocked or requested every package in the catalog.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {lockedPackages.map((pkg) => (
                    <LockedCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-wisdom-muted flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" />
          Checkout email must match your account for fastest unlock
        </p>
      </div>
    </div>
  );
}

function LockedCard({ pkg }: { pkg: AcademyPackage }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 overflow-hidden flex flex-col">
      <div className="relative h-28 shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 grayscale"
          style={{ backgroundImage: `url(${pkg.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 text-white/70 px-2 py-0.5 text-[10px] font-bold uppercase">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-white/90 text-sm leading-snug">{pkg.name}</h3>
        <p className="text-xs text-wisdom-muted mt-1 line-clamp-2 flex-1">{pkg.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-amber-300">{formatEtb(pkg.priceEtb)}</span>
          <Link
            href={`/checkout/${pkg.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Get access
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
