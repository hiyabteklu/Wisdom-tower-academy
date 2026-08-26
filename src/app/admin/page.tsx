"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";
import {
  Inbox,
  Mail,
  Clock,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Shield,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
  admin_notes?: string | null;
}

const STATUS_OPTIONS = ["new", "read", "replied", "closed"] as const;

function statusStyle(status: string) {
  const s = (status || "new").toLowerCase();
  if (s === "replied" || s === "closed") return "bg-green-500/15 text-green-400 border-green-500/30";
  if (s === "read") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-wisdom-cyan/15 text-wisdom-cyan border-wisdom-cyan/30";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function downloadCsv(filename: string, rows: Inquiry[]) {
  if (!rows.length) return;
  const keys = ["id", "created_at", "name", "email", "service", "message", "status", "admin_notes"];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [keys.join(",")].concat(
    rows.map((r) => keys.map((k) => esc((r as any)[k])).join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      if (!u || !isAdminEmail(u.email)) {
        router.replace(u ? "/account" : "/login");
        return;
      }
      setUser(u);
      setLoading(false);
    });
  }, [router]);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setError("");
    try {
      const client = getClient();
      const { data, error: err } = await client
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (err) {
        setError(err.message);
        setInquiries([]);
      } else {
        setInquiries((data as Inquiry[]) || []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const client = getClient();
    const { error: err } = await client.from("inquiries").update({ status }).eq("id", id);
    setUpdatingId("");
    if (err) {
      setToast("Update failed: " + err.message);
      return;
    }
    setToast("Status updated");
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const saveNote = async (id: string, note: string) => {
    setUpdatingId(id);
    const client = getClient();
    const { error: err } = await client.from("inquiries").update({ admin_notes: note }).eq("id", id);
    setUpdatingId("");
    if (err) {
      setToast("Note save failed: " + err.message);
      return;
    }
    setToast("Notes saved");
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, admin_notes: note } : i)));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inquiries.filter((r) => {
      const st = (r.status || "new").toLowerCase();
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (!q) return true;
      return JSON.stringify(r).toLowerCase().includes(q);
    });
  }, [inquiries, search, statusFilter]);

  const stats = useMemo(() => ({
    total: inquiries.length,
    new: inquiries.filter((i) => (i.status || "new") === "new").length,
    read: inquiries.filter((i) => i.status === "read").length,
    replied: inquiries.filter((i) => i.status === "replied").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  }), [inquiries]);

  const last7Days = useMemo(() => {
    const days: { key: string; label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      days.push({ key, label, value: 0 });
    }
    const map = Object.fromEntries(days.map((x) => [x.key, x]));
    inquiries.forEach((r) => {
      const key = (r.created_at || "").slice(0, 10);
      if (map[key]) map[key].value += 1;
    });
    return days.map(({ label, value }) => ({ label, value }));
  }, [inquiries]);

  const serviceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    inquiries.forEach((r) => {
      const key = (r.service || "General").trim() || "General";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [inquiries]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxBar = Math.max(...last7Days.map((d) => d.value), 1);
  const maxService = Math.max(...serviceCounts.map((d) => d.value), 1);

  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-wisdom-cyan/40 bg-wisdom-card px-5 py-3 text-sm font-medium text-wisdom-cyan shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-wisdom-cyan/10 text-wisdom-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-cyan">Control Center</p>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-wisdom-muted mt-1">
                {stats.new} new · {stats.total} total · {user.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadAll}
              disabled={dataLoading}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
              {dataLoading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => downloadCsv("wisdom-tower-inquiries.csv", filtered)}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-full border border-wisdom-cyan/30 bg-wisdom-cyan/10 text-sm font-medium text-wisdom-cyan hover:bg-wisdom-cyan/20"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <Link href="/account" className="inline-flex items-center min-h-[40px] px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
            <p className="font-semibold">Load error</p>
            <p className="mt-1 opacity-90">{error}</p>
            <p className="mt-2 text-xs text-wisdom-muted">
              If rows exist in Supabase but not here, run the SELECT policy for authenticated users.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-wisdom-cyan", filter: "all" },
            { label: "New", value: stats.new, color: "text-green-400", filter: "new" },
            { label: "Read", value: stats.read, color: "text-amber-400", filter: "read" },
            { label: "Replied", value: stats.replied, color: "text-blue-400", filter: "replied" },
            { label: "Closed", value: stats.closed, color: "text-wisdom-muted", filter: "closed" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setStatusFilter(s.filter)}
              className="p-4 rounded-2xl bg-wisdom-card border border-white/5 text-left hover:border-white/15 transition-colors"
            >
              <span className="text-xs text-wisdom-muted">{s.label}</span>
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-4 mb-8">
          <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-wisdom-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-wisdom-muted">Activity · last 7 days</h2>
              <span className="text-xs text-wisdom-muted">{last7Days.reduce((a, b) => a + b.value, 0)} new</span>
            </div>
            <div className="flex h-36 items-end gap-2">
              {last7Days.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold tabular-nums text-wisdom-muted">{d.value || ""}</span>
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-[36px] rounded-t-md bg-gradient-to-t from-wisdom-cyan to-cyan-400 transition-all duration-500"
                      style={{ height: `${Math.max((d.value / maxBar) * 100, d.value > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-wisdom-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-wisdom-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-wisdom-muted mb-4">By service</h2>
            {serviceCounts.length === 0 ? (
              <p className="text-sm text-wisdom-muted py-6 text-center">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {serviceCounts.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-xs text-wisdom-muted" title={d.label}>{d.label}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded-lg bg-white/5">
                      <div
                        className="flex h-full items-center rounded-lg px-2 bg-wisdom-cyan transition-all duration-500"
                        style={{ width: `${Math.max((d.value / maxService) * 100, d.value > 0 ? 12 : 0)}%` }}
                      >
                        {d.value > 0 && <span className="text-[10px] font-bold text-wisdom-dark">{d.value}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wisdom-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, service, message…"
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-white/10 bg-wisdom-card text-sm outline-none focus:border-wisdom-cyan"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] rounded-xl border border-white/10 bg-wisdom-card px-3 text-sm outline-none focus:border-wisdom-cyan"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {dataLoading ? (
          <p className="py-16 text-center text-wisdom-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
            <Inbox className="w-12 h-12 text-wisdom-muted mx-auto mb-4 opacity-40" />
            <p className="text-wisdom-muted">No inquiries yet</p>
            <p className="text-sm text-wisdom-muted mt-1">Submit a test from Contact or a service request form</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inquiry) => {
              const open = expandedId === inquiry.id;
              const noteVal = noteDraft[inquiry.id] ?? inquiry.admin_notes ?? "";
              return (
                <article
                  key={inquiry.id}
                  className="rounded-2xl border border-white/5 border-l-4 border-l-wisdom-cyan bg-wisdom-card p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setExpandedId(open ? "" : inquiry.id)}>
                      <h3 className="font-semibold text-white">{inquiry.name}</h3>
                      <p className="text-sm text-wisdom-muted mt-0.5">
                        {[inquiry.email, inquiry.service].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(inquiry.status)}`}>
                      {inquiry.status || "new"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-wisdom-muted leading-relaxed whitespace-pre-wrap line-clamp-3">{inquiry.message}</p>
                  <div className="mt-3 text-xs text-wisdom-muted">{formatDate(inquiry.created_at)}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={inquiry.status || "new"}
                      disabled={updatingId === inquiry.id}
                      onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                      className="min-h-[36px] rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs font-medium outline-none focus:border-wisdom-cyan disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <a
                      href={`mailto:${inquiry.email}?subject=Re: Your inquiry to Wisdom Tower`}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                    >
                      Reply by email
                    </a>
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? "" : inquiry.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                    >
                      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {open ? "Hide" : "Notes"}
                    </button>
                  </div>
                  {open && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      <p className="text-sm text-white whitespace-pre-wrap">{inquiry.message}</p>
                      <textarea
                        value={noteVal}
                        onChange={(e) => setNoteDraft((d) => ({ ...d, [inquiry.id]: e.target.value }))}
                        rows={3}
                        placeholder="Internal admin notes…"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-wisdom-cyan"
                      />
                      <button
                        type="button"
                        disabled={updatingId === inquiry.id}
                        onClick={() => saveNote(inquiry.id, noteVal)}
                        className="rounded-lg bg-wisdom-cyan px-4 py-2 text-xs font-bold text-wisdom-dark disabled:opacity-50"
                      >
                        Save notes
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
