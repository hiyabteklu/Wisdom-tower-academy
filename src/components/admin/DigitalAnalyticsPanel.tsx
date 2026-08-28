"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDigitalAdminStats, type DigitalAdminStats } from "@/lib/admin-data";
import {
  Users,
  Inbox,
  Briefcase,
  Activity,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Monitor,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  large,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-wisdom-card ${large ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            {label}
          </p>
          <p
            className={`mt-1 font-bold text-white tabular-nums ${large ? "text-3xl" : "text-2xl"}`}
          >
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-wisdom-muted leading-snug">{hint}</p>}
        </div>
        <div className={`p-2 rounded-xl border border-white/10 shrink-0 ${accent}`}>
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
      {items.length === 0 || items.every((i) => i.count === 0) ? (
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

function WeekChart({
  title,
  days,
}: {
  title: string;
  days: { day: string; label: string; count: number }[];
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-wisdom-cyan" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-32">
        {days.map((d) => {
          const h = Math.round((d.count / max) * 100);
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] text-wisdom-muted tabular-nums">{d.count}</span>
              <div className="w-full max-w-[36px] h-24 flex flex-col justify-end rounded-md bg-white/5 overflow-hidden">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-cyan-600/80 to-wisdom-cyan/90"
                  style={{ height: `${Math.max(d.count ? 8 : 0, h)}%` }}
                />
              </div>
              <span className="text-[10px] text-wisdom-muted">{d.label}</span>
            </div>
          );
        })}
      </div>
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

export default function DigitalAnalyticsPanel() {
  const [stats, setStats] = useState<DigitalAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityOpen, setActivityOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchDigitalAdminStats();
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

  type ActivityItem = { id: string; text: string; when: string };
  const activity: ActivityItem[] = [];

  for (const i of s.recentInquiries) {
    activity.push({
      id: `i-${i.id}`,
      when: i.created_at,
      text: `Service request · ${i.name} · ${i.service || "general"} · ${i.status}`,
    });
  }
  for (const t of s.recentTalent) {
    activity.push({
      id: `t-${t.id}`,
      when: t.created_at,
      text: `Talent application · ${t.name} · ${t.service || t.category || "role"} · ${t.status}`,
    });
  }
  for (const u of s.recentUsers) {
    activity.push({
      id: `u-${u.id}`,
      when: u.created_at,
      text: `New user · ${u.full_name || u.email || u.id.slice(0, 8)}`,
    });
  }
  activity.sort((a, b) => b.when.localeCompare(a.when));
  const topActivity = activity.slice(0, 14);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-wisdom-cyan" />
            Digital overview
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            Service requests, talent applications, and pipeline activity
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          large
          label="Service requests"
          value={s.inquiriesTotal}
          hint={`${s.inquiriesNew} new · contact & quote forms`}
          icon={Inbox}
          accent="bg-sky-500/15 text-sky-300"
        />
        <StatCard
          large
          label="Talent applications"
          value={s.talentTotal}
          hint={`${s.talentNew} new · Work with us`}
          icon={Briefcase}
          accent="bg-violet-500/15 text-violet-300"
        />
        <StatCard
          large
          label="Registered users"
          value={s.users}
          hint="shared across Academy & Digital"
          icon={Users}
          accent="bg-purple-500/15 text-purple-300"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <WeekChart title="Requests · last 7 days" days={s.last7DaysInquiries} />
        <WeekChart title="Applications · last 7 days" days={s.last7DaysTalent} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BarList
          title="Applications by category"
          colorClass="bg-wisdom-cyan/80"
          items={s.byCategory}
        />
        <BarList
          title="Applications by status"
          colorClass="bg-violet-400/70"
          items={s.byTalentStatus}
        />
      </div>

      <BarList
        title="Top service lines (talent)"
        colorClass="bg-emerald-400/70"
        items={s.byService}
      />

      <div className="rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden">
        <button
          type="button"
          onClick={() => setActivityOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-white/[0.03] transition-colors"
          aria-expanded={activityOpen}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Monitor className="w-4 h-4 text-wisdom-cyan shrink-0" />
            <h3 className="font-semibold text-white">Recent digital activity</h3>
            <span className="text-xs text-wisdom-muted tabular-nums">
              ({topActivity.length})
            </span>
          </div>
          {activityOpen ? (
            <ChevronUp className="w-5 h-5 text-wisdom-muted shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-wisdom-muted shrink-0" />
          )}
        </button>

        {activityOpen && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/8">
            {topActivity.length === 0 ? (
              <p className="text-sm text-wisdom-muted py-8 text-center">
                No activity yet. Service requests and talent applications will show here.
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
        )}
      </div>
    </div>
  );
}
