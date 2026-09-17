"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { listMyOrders, type ManualOrder } from "@/lib/orders";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  kind: "verified" | "pending" | "rejected";
};

function orderToNotice(o: ManualOrder): Notice | null {
  if (o.status === "verified") {
    return {
      id: `ord-${o.id}-ok`,
      title: "Package unlocked",
      body: `${o.packageName || o.packageId} is ready in My Learning.`,
      href: "/learning",
      createdAt: o.verifiedAt || o.createdAt,
      kind: "verified",
    };
  }
  if (o.status === "pending_verification" || o.status === "pending_payment") {
    return {
      id: `ord-${o.id}-wait`,
      title: "Payment pending",
      body: `${o.packageName || o.packageId} — waiting for verification.`,
      href: "/orders",
      createdAt: o.createdAt,
      kind: "pending",
    };
  }
  if (o.status === "rejected") {
    return {
      id: `ord-${o.id}-no`,
      title: "Payment needs attention",
      body: `${o.packageName || o.packageId} could not be verified.`,
      href: "/orders",
      createdAt: o.verifiedAt || o.createdAt,
      kind: "rejected",
    };
  }
  return null;
}

const READ_KEY = "wt_notice_read_v1";

function readReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export default function NotificationsPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setLoggedIn(Boolean(session?.user));
    if (!session?.user) {
      setNotices([]);
      setLoading(false);
      return;
    }
    const orders = await listMyOrders();
    const list = orders
      .map(orderToNotice)
      .filter((n): n is Notice => Boolean(n))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 30);
    setNotices(list);
    const ids = readReadIds();
    setReadIds(ids);
    const next = new Set(ids);
    list.forEach((n) => next.add(n.id));
    setReadIds(next);
    writeReadIds(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-[70vh] max-w-lg mx-auto px-4 py-8 sm:py-12" data-scroll-zoom-skip>
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-wisdom-muted hover:text-cyan-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Account
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
          <Bell className="w-5 h-5" />
        </span>
        <h1 className="font-display text-3xl font-extrabold text-white">Notifications</h1>
      </div>
      <p className="text-wisdom-muted text-sm mb-8">
        Package status and account alerts only.
      </p>

      {!loggedIn && !loading && (
        <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 p-6 text-center">
          <p className="text-sm text-wisdom-muted mb-4">Sign in to see your notifications.</p>
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-wisdom-dark"
          >
            Sign in
          </Link>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/25 border-t-cyan-400 animate-spin" />
        </div>
      )}

      {loggedIn && !loading && notices.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-wisdom-card/80 px-4 py-12 text-center text-sm text-wisdom-muted">
          No notifications yet
        </div>
      )}

      {loggedIn && !loading && notices.length > 0 && (
        <ul className="rounded-2xl border border-white/12 bg-[#0a0f1a] overflow-hidden divide-y divide-white/5">
          {notices.map((n) => {
            const Icon =
              n.kind === "verified" ? CheckCircle2 : n.kind === "rejected" ? XCircle : Clock;
            const color =
              n.kind === "verified"
                ? "text-emerald-400"
                : n.kind === "rejected"
                  ? "text-rose-400"
                  : "text-amber-400";
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="flex gap-3 px-4 py-3.5 hover:bg-white/5 transition"
                >
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-wisdom-muted leading-relaxed">{n.body}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
