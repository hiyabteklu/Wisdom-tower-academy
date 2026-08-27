"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminStats,
  type AdminStats,
} from "@/lib/admin-data";
import { statusLabel } from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import {
  Users,
  CreditCard,
  GraduationCap,
  Inbox,
  Sparkles,
  Activity,
  RefreshCw,
  TrendingUp,
  BarChart3,
} from "lucide-react";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-wisdom-muted">{hint}</p>}
        </div>
        <div className={`p-2 rounded-xl border border-white/10 ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function BarList({
  title,
  items,
  colorClass,
}: {
  title: string;
  items: { label: string; count: number }[];
  colorClass: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-wisdom-cyan" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-wisdom-muted py-6 text-center">No data yet</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex justify-between text-xs mb-1 gap-2">
                <span className="text-white/85 truncate">{item.label}</span>
                <span className="text-wisdom-muted tabular-nums shrink-0">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass}`}
                  style={{ width: `${Math.round((item.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminStats();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats!;

  type ActivityItem = { id: string; text: string; when: string; kind: string };
  const activity: ActivityItem[] = [];

  for (const o of s.recentOrders) {
    activity.push({
      id: `o-${o.id}`,
      kind: "order",
      when: o.createdAt,
      text: `Order ${o.id} · ${o.packageName} · ${statusLabel(o.status)} · ${o.studentName}`,
    });
  }
  for (const e of s.recentEnrollments) {
    activity.push({
      id: `e-${e.id}`,
      kind: "enroll",
      when: e.created_at,
      text: `Enrollment unlocked · ${e.package_name}${e.email ? ` · ${e.email}` : ""}`,
    });
  }
  for (const i of s.recentInquiries) {
    activity.push({
      id: `i-${i.id}`,
      kind: "inquiry",
      when: i.created_at,
      text: `Inquiry from ${i.name} · ${i.service || "general"} · ${i.status}`,
    });
  }
  for (const u of s.recentUsers) {
    activity.push({
      id: `u-${u.id}`,
      kind: "user",
      when: u.created_at,
      text: `New user · ${u.full_name || u.email || u.id.slice(0, 8)}`,
    });
  }
  activity.sort((a, b) => b.when.localeCompare(a.when));
  const topActivity = activity.slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-wisdom-cyan" />
            Platform overview
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            Live snapshot from Supabase tables
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Registered users"
          value={s.users}
          hint="profiles table"
          icon={Users}
          accent="bg-purple-500/15 text-purple-300"
        />
        <StatCard
          label="Orders"
          value={s.ordersTotal}
          hint={`${s.ordersPending} pending verification`}
          icon={CreditCard}
          accent="bg-amber-500/15 text-amber-300"
        />
        <StatCard
          label="Verified revenue"
          value={formatEtb(s.revenueVerifiedEtb)}
          hint={`${s.ordersVerified} verified · ${s.ordersRejected} rejected`}
          icon={TrendingUp}
          accent="bg-emerald-500/15 text-emerald-300"
        />
        <StatCard
          label="Enrollments"
          value={s.enrollments}
          hint="unlocked packages"
          icon={GraduationCap}
          accent="bg-cyan-500/15 text-cyan-300"
        />
        <StatCard
          label="Inquiries"
          value={s.inquiriesTotal}
          hint={`${s.inquiriesNew} new`}
          icon={Inbox}
          accent="bg-sky-500/15 text-sky-300"
        />
        <StatCard
          label="AI explanations"
          value={s.explanationsCached}
          hint={`${s.academicResults} quiz results saved`}
          icon={Sparkles}
          accent="bg-pink-500/15 text-pink-300"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BarList
          title="Orders by status"
          colorClass="bg-amber-400/80"
          items={s.byStatus.map((x) => ({
            label: statusLabel(x.status),
            count: x.count,
          }))}
        />
        <BarList
          title="Top packages (orders)"
          colorClass="bg-wisdom-cyan/80"
          items={s.byPackage.map((x) => ({ label: x.name, count: x.count }))}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-wisdom-cyan" />
          <h3 className="font-semibold text-white">Recent activity</h3>
        </div>
        {topActivity.length === 0 ? (
          <p className="text-sm text-wisdom-muted py-8 text-center">
            No activity yet. New checkouts, sign-ups, and contact messages will show here.
          </p>
        ) : (
          <ul className="divide-y divide-white/8">
            {topActivity.map((a) => (
              <li
                key={a.id}
                className="py-3 flex flex-wrap items-start justify-between gap-2 text-sm"
              >
                <span className="text-white/85 leading-snug">{a.text}</span>
                <span className="text-xs text-wisdom-muted shrink-0">{timeAgo(a.when)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
