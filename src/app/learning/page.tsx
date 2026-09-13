"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Lock,
  ShoppingBag,
  GraduationCap,
} from "lucide-react";
import { listMyEnrollments, listMyOrders, type ManualOrder } from "@/lib/orders";
import { getPackage, formatEtb, type AcademyPackage } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { listSellablePackages } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import StudyPlanner from "@/components/learning/StudyPlanner";

type UnlockedRow = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  enrolledAt?: string;
};

function learningHrefForPackage(packageId: string, packageName?: string) {
  const pkg = getPackageResolved(packageId) || getPackage(packageId);
  if (pkg) {
    return {
      href: pkg.href || "/packages",
      title: pkg.name,
      subtitle: pkg.shortName || pkg.name,
      image: pkg.image,
    };
  }
  return {
    href: "/packages",
    title: packageName || packageId,
    subtitle: packageId,
    image: "",
  };
}

export default function LearningPage() {
  const [unlocked, setUnlocked] = useState<UnlockedRow[]>([]);
  const [pending, setPending] = useState<ManualOrder[]>([]);
  const [lockedPackages, setLockedPackages] = useState<AcademyPackage[]>([]);
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
        setLoading(false);
        return;
      }
      try {
        const [enrolls, orders, catalog] = await Promise.all([
          listMyEnrollments(),
          listMyOrders(),
          listSellablePackages(),
        ]);
        if (cancelled) return;

        const rows: UnlockedRow[] = [];
        const seen = new Set<string>();

        for (const e of enrolls || []) {
          const meta = learningHrefForPackage(e.packageId, e.packageName);
          if (seen.has(e.packageId)) continue;
          seen.add(e.packageId);
          rows.push({
            id: e.packageId,
            title: meta.title,
            subtitle: meta.subtitle,
            href: meta.href,
            image: meta.image,
            enrolledAt: e.createdAt,
          });
        }

        for (const o of orders || []) {
          if (o.status !== "verified") continue;
          if (seen.has(o.packageId)) continue;
          seen.add(o.packageId);
          const meta = learningHrefForPackage(o.packageId, o.packageName);
          rows.push({
            id: o.packageId,
            title: meta.title,
            subtitle: meta.subtitle,
            href: meta.href,
            image: meta.image,
            enrolledAt: o.verifiedAt || o.createdAt,
          });
        }

        setUnlocked(rows);
        setPending(
          (orders || []).filter(
            (o) => o.status === "pending_verification" || o.status === "pending_payment"
          )
        );
        setLockedPackages((catalog || []).filter((p) => !seen.has(p.id)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-[70vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-1">
            Dashboard
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-cyan-300" />
            My Learning
          </h1>
          <p className="mt-2 text-sm text-wisdom-muted">
            Your unlocked packages, weekly study plan, and next steps.
          </p>
        </div>

        {!loggedIn && !loading ? (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card p-8 text-center mb-10">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="font-semibold text-white mb-2">Sign in to see your learning</p>
            <p className="text-sm text-wisdom-muted mb-5">
              Packages you purchase unlock here after verification.
            </p>
            <Link
              href="/login?next=/learning"
              className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-wisdom-dark"
            >
              Sign in
            </Link>
          </div>
        ) : null}

        {/* Study planner — available to everyone browsing this page */}
        <StudyPlanner />

        {loading ? (
          <p className="text-sm text-wisdom-muted">Loading your packages…</p>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Unlocked packages
              </h2>
              {unlocked.length === 0 ? (
                <p className="text-sm text-wisdom-muted rounded-2xl border border-white/10 bg-wisdom-card/60 px-4 py-6">
                  No packages unlocked yet. Browse the catalog when you are ready.
                </p>
              ) : (
                <ul className="space-y-3">
                  {unlocked.map((row) => (
                    <li key={row.id}>
                      <Link
                        href={row.href}
                        className="flex gap-3 rounded-2xl border border-white/12 bg-wisdom-card p-3 sm:p-4 hover:border-cyan-400/35 transition"
                      >
                        {row.image ? (
                          <div
                            className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
                            style={{ backgroundImage: `url(${row.image})` }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-wisdom-navy shrink-0 border border-white/10" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{row.title}</p>
                          <p className="text-xs text-wisdom-muted">{row.subtitle}</p>
                          <span className="text-xs font-semibold text-cyan-300 mt-1 inline-block">
                            Open pathway →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {pending.length > 0 && (
              <section className="mb-12">
                <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Pending verification
                </h2>
                <ul className="space-y-2">
                  {pending.map((p) => {
                    const name =
                      getPackageResolved(p.packageId)?.name ||
                      getPackage(p.packageId)?.name ||
                      p.packageName ||
                      p.packageId;
                    return (
                      <li
                        key={p.id}
                        className="surface-card rounded-xl border border-amber-400/25 px-4 py-3 text-sm text-white/90"
                      >
                        {name} · {p.status}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section>
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-wisdom-muted" />
                Available packages
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {lockedPackages.slice(0, 6).map((pkg: AcademyPackage) => (
                  <li key={pkg.id}>
                    <Link
                      href="/packages"
                      className="surface-card block rounded-2xl border border-white/12 p-4 hover:border-wisdom-cyan/35 transition"
                    >
                      <p className="font-semibold text-white">{pkg.name}</p>
                      <p className="text-sm text-amber-300 font-bold mt-1">
                        {formatEtb(pkg.priceEtb)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/packages" className="btn-secondary inline-flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  All packages
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
