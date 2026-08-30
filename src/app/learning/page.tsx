"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  ShoppingBag,
  ArrowRight,
  LogIn,
  Lock,
} from "lucide-react";
import {
  academyPackages,
  formatEtb,
  getPackage,
  type AcademyPackage,
} from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { listMyEnrollments, listMyOrders, type ManualOrder } from "@/lib/orders";
import { supabase } from "@/lib/supabase";
import UserHubNav from "@/components/UserHubNav";

type UnlockedRow = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  enrolledAt?: string;
};

/** Learning hub URL — never /packages/{id} (that route does not exist). */
function learningHrefForPackage(packageId: string, packageName?: string): {
  href: string;
  title: string;
  subtitle: string;
  image: string;
} {
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
        const [enrolls, orders] = await Promise.all([
          listMyEnrollments(),
          listMyOrders(),
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

        // Also unlock from verified orders (in case enrollment row missing)
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
            (o) =>
              o.status === "pending_payment" || o.status === "pending_verification"
          )
        );
      } catch {
        setUnlocked([]);
        setPending([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unlockedIds = useMemo(() => new Set(unlocked.map((u) => u.id)), [unlocked]);
  const pendingIds = useMemo(() => new Set(pending.map((p) => p.packageId)), [pending]);
  const lockedPackages = useMemo(
    () => academyPackages.filter((p) => !unlockedIds.has(p.id) && !pendingIds.has(p.id)),
    [unlockedIds, pendingIds]
  );

  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <UserHubNav />

        <div className="mb-10 md:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-2">
            Academy hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            My Learning
          </h1>
          <p className="text-wisdom-muted text-base md:text-lg max-w-2xl">
            Your unlocked packages and content hubs. After admin approval, open a package to
            study subjects, notes, and practice.
          </p>
        </div>

        {!loggedIn && !loading && (
          <div className="surface-card rounded-2xl border border-white/12 p-8 text-center mb-10">
            <LogIn className="w-10 h-10 text-wisdom-cyan mx-auto mb-3" />
            <p className="font-semibold text-white mb-2">Sign in to see your learning</p>
            <Link href="/login" className="btn-primary inline-flex mt-2">
              Sign in
            </Link>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Unlocked
              </h2>
              {unlocked.length === 0 ? (
                <div className="surface-card rounded-2xl border border-dashed border-white/15 p-8 text-center">
                  <BookOpen className="w-10 h-10 text-white/25 mx-auto mb-3" />
                  <p className="text-wisdom-muted text-sm mb-4">No packages unlocked yet.</p>
                  <Link href="/packages" className="btn-primary inline-flex">
                    Browse packages
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-4">
                  {unlocked.map((u) => (
                    <li key={u.id}>
                      <Link
                        href={u.href}
                        className="surface-card flex gap-3 rounded-2xl border border-white/12 p-3 hover:border-amber-400/40 transition"
                      >
                        <div
                          className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-white/10 bg-wisdom-dark"
                          style={{
                            backgroundImage: u.image ? `url(${u.image})` : undefined,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{u.title}</p>
                          <p className="text-xs text-wisdom-muted">{u.subtitle}</p>
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                            <Play className="w-3 h-3" /> Open content
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
                <Link href="/packages" className="btn-secondary inline-flex">
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
