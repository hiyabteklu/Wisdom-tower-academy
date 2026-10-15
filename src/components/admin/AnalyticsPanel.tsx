"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchAdminStats, type AdminStats } from "@/lib/admin-data";
import { statusLabel } from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import BrandLoader from "@/components/BrandLoader";
import {
  Users,
  CreditCard,
  GraduationCap,
  Activity,
  RefreshCw,
  TrendingUp,
  Percent,
  Wallet,
  Clock,
  AlertCircle,
  Award,
} from "lucide-react";

/**
 * Admin Overview (analytics) tab.
 *
 * 2026-10-15 (Admin mobile redesign, slice A9): LAYOUT ONLY. Audit hits before the change: `animate-ping` (pulse
 * dot), `animate-spin` (Refresh icon), `transition-*` on bars and cards, a 5-button segmented activity filter,
 * a nested `max-h-[460px] overflow-y-auto` feed, `truncate` rows that cut the text, text under 11 px, and a
 * 44 px-short Refresh button. Now: one 44 px pill, a 2-column KPI grid, a static pulse dot, charts stacked in one
 * column, activity filter as wrapping pills, feed rows that wrap (no nested scroller; the list was already capped
 * at 16 items). Data loading, calculations and the activity list are unchanged.
 * Fake-content rule (HANDOFF section 7): removed three claims that were not real data: "Updated in real time"
 * (the page loads once and on Refresh), "100% Ethiopian Rail", and "Live stream" / "Real-Time" in the feed
 * title and subtitle (now "Recent Activity"). The unused `activityOpen` state and unused icon imports were dropped.
 */

function MetricCard({
  label,
  value,
  secondary,
  hint,
  icon: Icon,
  accentColor,
  trend,
}: {
  label: string;
  value: string | number;
  secondary?: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: "emerald" | "amber" | "cyan" | "purple" | "rose" | "sky";
  trend?: string;
}) {
  const colorMap = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-wisdom-card p-3.5 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">{label}</p>
          <p className="text-xl font-extrabold text-white tracking-tight tabular-nums mt-1 break-words">
            {value}
          </p>
          {secondary && <p className="text-xs font-semibold text-wisdom-muted mt-0.5">{secondary}</p>}
        </div>
        <div className={`p-2 rounded-xl border shrink-0 ${colorMap[accentColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {(hint || trend) && (
        <div className="mt-2.5 pt-2 border-t border-white/6 text-xs text-wisdom-muted">
          <span>{hint}</span>
          {trend && <span className="font-semibold text-emerald-400 ml-1">{trend}</span>}
        </div>
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
  const [activityFilter, setActivityFilter] = useState<"all" | "order" | "enroll" | "inquiry" | "user">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminStats();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activityItems = useMemo(() => {
    if (!stats) return [];
    type ActivityItem = { id: string; text: string; when: string; kind: "order" | "enroll" | "inquiry" | "user"; detail?: string };
    const list: ActivityItem[] = [];

    for (const o of stats.recentOrders) {
      list.push({
        id: `o-${o.id}`,
        kind: "order",
        when: o.createdAt,
        text: `Order ${o.id} · ${o.packageName} · ${o.studentName}`,
        detail: `${statusLabel(o.status)} (${formatEtb(o.amountEtb)}) via ${o.paymentMethod || "bank"}`,
      });
    }
    for (const e of stats.recentEnrollments) {
      list.push({
        id: `e-${e.id}`,
        kind: "enroll",
        when: e.created_at,
        text: `Unlocked · ${e.package_name}`,
        detail: e.email || "Active Enrollment",
      });
    }
    for (const i of stats.recentInquiries) {
      list.push({
        id: `i-${i.id}`,
        kind: "inquiry",
        when: i.created_at,
        text: `Inquiry from ${i.name} (${i.service || "General"})`,
        detail: i.message.slice(0, 90) + (i.message.length > 90 ? "…" : ""),
      });
    }
    for (const u of stats.recentUsers) {
      list.push({
        id: `u-${u.id}`,
        kind: "user",
        when: u.created_at,
        text: `New student registration: ${u.full_name || u.email || "Scholar"}`,
        detail: [u.school_name, u.stream, u.town_region].filter(Boolean).join(" · ") || u.email || "Registered profile",
      });
    }

    list.sort((a, b) => b.when.localeCompare(a.when));
    return list;
  }, [stats]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") return activityItems.slice(0, 16);
    return activityItems.filter((i) => i.kind === activityFilter).slice(0, 16);
  }, [activityItems, activityFilter]);

  if (loading && !stats) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3" data-wta-spinner="true">
        <BrandLoader size="md" label="Loading executive metrics..." />
      </div>
    );
  }

  const s = stats!;
  const maxDayOrders = Math.max(1, ...s.last7Days.map((d) => d.orders));

  return (
    <div className="space-y-4">
      {/* Header and Refresh */}
      <div className="space-y-3 border-b border-white/8 pb-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
            <span>Executive Intelligence & Operational Overview</span>
          </h2>
          <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
            Financial, student enrollment, and platform usage metrics
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-full border border-white/12 text-sm font-semibold text-white/90 active:bg-white/10 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>{loading ? "Loading..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Today's Pulse */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-3.5 space-y-2.5 text-sm">
        <div className="flex items-start gap-2.5">
          <span className="inline-block h-3 w-3 rounded-full bg-cyan-500 shrink-0 mt-1" />
          <div className="min-w-0">
            <span className="font-bold text-white">Today&apos;s Pulse:</span>{" "}
            <span className="text-cyan-200">
              {s.todayOrdersCount} order{s.todayOrdersCount === 1 ? "" : "s"} placed today
            </span>
            <span className="text-wisdom-muted"> · </span>
            <span className="text-emerald-300 font-semibold">
              {formatEtb(s.todayRevenueEtb)} verified today
            </span>
          </div>
        </div>

        {s.urgentPendingOrdersCount > 0 && (
          <div className="flex items-start gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {s.urgentPendingOrdersCount} order{s.urgentPendingOrdersCount === 1 ? "" : "s"} awaiting approval &gt; 2 hrs
            </span>
          </div>
        )}
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard
          label="Verified Revenue"
          value={formatEtb(s.revenueVerifiedEtb)}
          hint={`${s.ordersVerified} approved orders`}
          secondary={`avg ${formatEtb(s.avgOrderEtb)}`}
          icon={Wallet}
          accentColor="emerald"
        />
        <MetricCard
          label="Pending Pipeline"
          value={formatEtb(s.pipelineEtb)}
          hint={`${s.ordersPending} pending payment confirmation`}
          icon={Clock}
          accentColor="amber"
        />
        <MetricCard
          label="Registered Scholars"
          value={s.users}
          hint={`${s.enrollments} total unlocked package grants`}
          icon={Users}
          accentColor="purple"
        />
        <MetricCard
          label="Order Conversion"
          value={`${s.conversionPct}%`}
          hint={`${s.ordersTotal} checkouts initiated`}
          icon={Percent}
          accentColor="cyan"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="min-w-0 rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">Course Enrollments</p>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">{s.enrollments}</p>
          <p className="text-xs text-wisdom-muted mt-0.5">Active scholar access seats</p>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">AI Explanations</p>
          <p className="text-xl font-bold text-cyan-300 mt-1 tabular-nums">{s.explanationsCached}</p>
          <p className="text-xs text-wisdom-muted mt-0.5">Cached tutor explanations</p>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">Quiz Submissions</p>
          <p className="text-xl font-bold text-emerald-300 mt-1 tabular-nums">{s.academicResults}</p>
          <p className="text-xs text-wisdom-muted mt-0.5">Completed exam sessions</p>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">Inquiries & Support</p>
          <p className="text-xl font-bold text-white mt-1 tabular-nums">
            {s.inquiriesTotal}
            {s.inquiriesNew > 0 && (
              <span className="text-xs font-semibold text-amber-400 ml-1.5">({s.inquiriesNew} new)</span>
            )}
          </p>
          <p className="text-xs text-wisdom-muted mt-0.5">Student support messages</p>
        </div>
      </div>

      {/* Last 7 days */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card p-3.5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="font-semibold text-white">Daily Order & Revenue Velocity</h3>
          </div>
          <span className="text-xs text-wisdom-muted shrink-0">Last 7 Days</span>
        </div>

        <div className="flex items-end justify-between gap-1.5 h-40 pt-2 border-b border-white/8 pb-3">
          {s.last7Days.map((d) => {
            const heightPct = Math.round((d.orders / maxDayOrders) * 100);
            return (
              <div key={d.day} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full max-w-[40px] h-28 flex flex-col justify-end rounded-lg bg-white/5 p-0.5 overflow-hidden">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-cyan-600 via-cyan-400 to-amber-300"
                    style={{ height: `${Math.max(d.orders ? 10 : 2, heightPct)}%` }}
                    title={`${d.day}: ${d.orders} orders (${d.verified} verified, ${formatEtb(d.revenue)})`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white tabular-nums">{d.orders}</p>
                  <p className="text-[11px] text-wisdom-muted uppercase tracking-wider">{d.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-wisdom-muted pt-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span>Orders placed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span>Verified revenue</span>
          </div>
        </div>
      </div>

      {/* Payment method share */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card p-3.5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="font-semibold text-white">Payment Rail Share</h3>
          </div>
          <span className="text-xs text-wisdom-muted shrink-0">{s.ordersTotal} transactions</span>
        </div>

        {s.byMethod.length === 0 ? (
          <p className="text-sm text-wisdom-muted text-center py-8">No orders recorded yet</p>
        ) : (
          <div className="space-y-3">
            {s.byMethod.map((m) => {
              const pct = s.ordersTotal > 0 ? Math.round((m.count / s.ordersTotal) * 100) : 0;
              return (
                <div key={m.method} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-semibold text-white uppercase tracking-wider min-w-0 break-words">
                      {m.method}
                    </span>
                    <span className="text-wisdom-muted text-right shrink-0">
                      <strong className="text-emerald-300">{formatEtb(m.totalEtb)}</strong> · {m.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top packages */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="font-semibold text-white">Top Packages by Enrollment</h3>
          </div>
          <span className="text-xs text-wisdom-muted shrink-0">By order volume</span>
        </div>

        {s.byPackage.length === 0 ? (
          <p className="text-sm text-wisdom-muted text-center py-6">No package enrollments yet</p>
        ) : (
          <div className="space-y-3">
            {s.byPackage.map((pkg, idx) => (
              <div key={pkg.name} className="flex items-start justify-between gap-3 text-sm">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-wisdom-muted">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-white/90 break-words min-w-0">{pkg.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-amber-300">{formatEtb(pkg.revenue)}</span>
                  <span className="text-xs text-wisdom-muted block">{pkg.count} orders</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stream demographics */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
            <h3 className="font-semibold text-white">Scholar Stream Demographics</h3>
          </div>
          <span className="text-xs text-wisdom-muted shrink-0">{s.users} registered</span>
        </div>

        {s.byStream.length === 0 ? (
          <p className="text-sm text-wisdom-muted text-center py-6">No student profiles registered yet</p>
        ) : (
          <div className="space-y-3">
            {s.byStream.map((stream) => {
              const pct = s.users > 0 ? Math.round((stream.count / s.users) * 100) : 0;
              return (
                <div key={stream.stream} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="font-medium text-white/90 min-w-0 break-words">{stream.stream}</span>
                    <span className="text-wisdom-muted shrink-0">
                      {stream.count} scholars ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden">
        <div className="p-3.5 border-b border-white/8 space-y-3">
          <div className="flex items-start gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h3 className="font-semibold text-white">Recent Activity</h3>
              <p className="text-xs text-wisdom-muted mt-0.5">
                Latest student signups, order payments, access grants, and inquiries
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["order", "Orders"],
                ["enroll", "Grants"],
                ["inquiry", "Inquiries"],
                ["user", "Scholars"],
              ] as const
            ).map(([filterId, filterLabel]) => (
              <button
                key={filterId}
                type="button"
                onClick={() => setActivityFilter(filterId)}
                className={`min-h-[44px] px-4 rounded-full border text-sm font-semibold cursor-pointer ${
                  activityFilter === filterId
                    ? "bg-cyan-500 border-cyan-400 text-wisdom-dark font-bold"
                    : "bg-white/5 border-white/10 text-wisdom-muted active:bg-white/10"
                }`}
              >
                {filterLabel}
              </button>
            ))}
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="p-6 text-center text-wisdom-muted text-sm">
            No events found in this filter category
          </div>
        ) : (
          <div className="divide-y divide-white/6">
            {filteredActivity.map((item) => (
              <div key={item.id} className="p-3.5 text-sm">
                <div className="flex items-start gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                      item.kind === "order"
                        ? "bg-amber-400"
                        : item.kind === "enroll"
                          ? "bg-emerald-400"
                          : item.kind === "inquiry"
                            ? "bg-sky-400"
                            : "bg-purple-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white/95 break-words">{item.text}</p>
                    {item.detail && (
                      <p className="text-xs text-wisdom-muted mt-0.5 break-words">{item.detail}</p>
                    )}
                    <p className="text-xs text-wisdom-muted mt-1 tabular-nums">{timeAgo(item.when)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
