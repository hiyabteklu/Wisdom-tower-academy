"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";
import {
  Inbox,
  RefreshCw,
  LogOut,
  Shield,
  Download,
  Search,
  Users,
  CheckCheck,
  Trash2,
  Copy,
  Check,
  Mail,
  LayoutDashboard,
  X,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Clock,
  BarChart3,
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

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string | null;
}

const STATUS_OPTIONS = ["new", "read", "replied", "closed"] as const;

type AdminTab = "overview" | "inquiries" | "users";

function statusStyle(status: string) {
  const s = (status || "new").toLowerCase();
  if (s === "replied") return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (s === "closed") return "bg-slate-500/20 text-slate-300 border-slate-500/30";
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

function formatDateOnly(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return iso;
  }
}

function formatRelative(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDateOnly(iso);
}

function downloadCsv(filename: string, rows: Record<string, unknown>[], keys: string[]) {
  if (!rows.length) return;
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [keys.join(",")].concat(rows.map((r) => keys.map((k) => esc(r[k])).join(",")));
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
  const [tab, setTab] = useState<AdminTab>("overview");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      if (!u || !isAdminEmail(u.email)) {
        router.replace(u ? "/account" : "/login");
        return;
      }
      await ensureProfile(u);
      setUser(u);
      setLoading(false);
    });
  }, [router]);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    setError("");
    try {
      const client = getClient();
      const [inqRes, profRes] = await Promise.all([
        client.from("inquiries").select("*").order("created_at", { ascending: false }).limit(500),
        client.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      ]);

      if (inqRes.error) setError(inqRes.error.message);
      setInquiries((inqRes.data as Inquiry[]) || []);

      if (profRes.error) {
        if (!inqRes.error) setError(profRes.error.message + " — run the profiles SQL if not done yet");
        setProfiles([]);
      } else {
        setProfiles((profRes.data as Profile[]) || []);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
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
    setToast(`Marked as ${status}`);
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

  const deleteInquiry = async (id: string) => {
    setUpdatingId(id);
    const client = getClient();
    const { error: err } = await client.from("inquiries").delete().eq("id", id);
    setUpdatingId("");
    setConfirmDelete(null);
    if (err) {
      setToast("Delete failed: " + err.message);
      return;
    }
    setToast("Inquiry deleted");
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    const client = getClient();
    const ids = Array.from(selectedIds);
    const { error: err } = await client.from("inquiries").update({ status }).in("id", ids);
    setBulkBusy(false);
    if (err) {
      setToast("Bulk update failed: " + err.message);
      return;
    }
    setToast(`${ids.length} marked as ${status}`);
    setInquiries((prev) => prev.map((i) => (selectedIds.has(i.id) ? { ...i, status } : i)));
    setSelectedIds(new Set());
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} inquir${selectedIds.size === 1 ? "y" : "ies"}? This cannot be undone.`)) return;
    setBulkBusy(true);
    const client = getClient();
    const ids = Array.from(selectedIds);
    const { error: err } = await client.from("inquiries").delete().in("id", ids);
    setBulkBusy(false);
    if (err) {
      setToast("Bulk delete failed: " + err.message);
      return;
    }
    setToast(`${ids.length} deleted`);
    setInquiries((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    if (selectedId && selectedIds.has(selectedId)) setSelectedId(null);
    setSelectedIds(new Set());
  };

  const markAllNewRead = async () => {
    const news = inquiries.filter((i) => (i.status || "new") === "new");
    if (!news.length) {
      setToast("No new inquiries");
      return;
    }
    setBulkBusy(true);
    const client = getClient();
    const ids = news.map((i) => i.id);
    const { error: err } = await client.from("inquiries").update({ status: "read" }).in("id", ids);
    setBulkBusy(false);
    if (err) {
      setToast("Failed: " + err.message);
      return;
    }
    setToast(`${ids.length} marked as read`);
    setInquiries((prev) =>
      prev.map((i) => ((i.status || "new") === "new" ? { ...i, status: "read" } : i))
    );
  };

  const copyEmail = async (email: string, id: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setToast("Could not copy");
    }
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

  const selectedInquiry = useMemo(
    () => inquiries.find((i) => i.id === selectedId) || null,
    [inquiries, selectedId]
  );

  const inquiryCountByEmail = useMemo(() => {
    const map: Record<string, number> = {};
    inquiries.forEach((i) => {
      const key = (i.email || "").toLowerCase();
      if (!key) return;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [inquiries]);

  const usersWithStats = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return profiles
      .map((p) => ({
        ...p,
        inquiry_count: inquiryCountByEmail[(p.email || "").toLowerCase()] || 0,
      }))
      .filter((p) => {
        if (!q) return true;
        return (
          (p.full_name || "").toLowerCase().includes(q) ||
          (p.email || "").toLowerCase().includes(q)
        );
      });
  }, [profiles, inquiryCountByEmail, userSearch]);

  const stats = useMemo(
    () => ({
      total: inquiries.length,
      new: inquiries.filter((i) => (i.status || "new") === "new").length,
      read: inquiries.filter((i) => i.status === "read").length,
      replied: inquiries.filter((i) => i.status === "replied").length,
      closed: inquiries.filter((i) => i.status === "closed").length,
      users: profiles.length,
    }),
    [inquiries, profiles]
  );

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

  const recentActivity = useMemo(() => inquiries.slice(0, 8), [inquiries]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxBar = Math.max(...last7Days.map((d) => d.value), 1);

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inquiries", label: "Inquiries", icon: Inbox, count: stats.total },
    { id: "users", label: "Users", icon: Users, count: stats.users },
  ];

  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-wisdom-cyan/40 bg-wisdom-card px-5 py-3 text-sm font-medium text-wisdom-cyan shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 md:py-10">
        {/* Top bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-wisdom-cyan/20 to-cyan-600/10 text-wisdom-cyan border border-wisdom-cyan/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-cyan">Control Center</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-wisdom-muted mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-wisdom-cyan font-medium">{stats.new} new</span>
                <span className="text-white/20">·</span>
                <span>{stats.total} inquiries</span>
                <span className="text-white/20">·</span>
                <span>{stats.users} users</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadAll}
              disabled={dataLoading}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl border border-white/12 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {stats.new > 0 && (
              <button
                onClick={markAllNewRead}
                disabled={bulkBusy}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm font-medium text-amber-300 hover:bg-amber-500/20 disabled:opacity-50 transition"
              >
                <CheckCheck className="w-4 h-4" />
                Mark {stats.new} new as read
              </button>
            )}
            <Link
              href="/account"
              className="inline-flex items-center min-h-[40px] px-4 py-2 rounded-xl border border-white/12 bg-white/5 text-sm font-medium hover:bg-white/10 transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Side nav */}
          <aside className="lg:w-52 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 lg:sticky lg:top-24">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTab(t.id);
                      setSelectedId(null);
                    }}
                    className={`flex items-center gap-2.5 min-h-[44px] px-3.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                      active
                        ? "bg-wisdom-cyan/15 text-wisdom-cyan border border-wisdom-cyan/30"
                        : "text-wisdom-muted hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {t.label}
                    {t.count !== undefined && (
                      <span
                        className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                          active ? "bg-wisdom-cyan/20" : "bg-white/10"
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {stats.new > 0 && (
              <div className="hidden lg:block mt-4 rounded-xl border border-wisdom-cyan/25 bg-wisdom-cyan/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-wisdom-cyan mb-1">Attention</p>
                <p className="text-sm text-white/90">
                  <strong className="text-wisdom-cyan">{stats.new}</strong> new inquir{stats.new === 1 ? "y" : "ies"} waiting
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTab("inquiries");
                    setStatusFilter("new");
                  }}
                  className="mt-2 text-xs font-semibold text-wisdom-cyan hover:underline"
                >
                  Review now →
                </button>
              </div>
            )}
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
                <p className="font-semibold">Notice</p>
                <p className="mt-1 opacity-90">{error}</p>
              </div>
            )}

            {tab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    { label: "Users", value: stats.users, color: "text-purple-400", bg: "from-purple-500/10" },
                    { label: "Inquiries", value: stats.total, color: "text-wisdom-cyan", bg: "from-cyan-500/10" },
                    { label: "New", value: stats.new, color: "text-green-400", bg: "from-green-500/10" },
                    { label: "Read", value: stats.read, color: "text-amber-400", bg: "from-amber-500/10" },
                    { label: "Replied", value: stats.replied, color: "text-blue-400", bg: "from-blue-500/10" },
                    { label: "Closed", value: stats.closed, color: "text-wisdom-muted", bg: "from-slate-500/10" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        if (s.label === "Users") setTab("users");
                        else {
                          setTab("inquiries");
                          setStatusFilter(
                            s.label === "Inquiries" ? "all" : s.label.toLowerCase()
                          );
                        }
                      }}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${s.bg} to-transparent border border-white/8 text-left hover:border-white/20 transition group`}
                    >
                      <span className="text-xs text-wisdom-muted group-hover:text-white/70">{s.label}</span>
                      <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                    </button>
                  ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-3 rounded-2xl border border-white/8 bg-wisdom-card p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-wisdom-cyan" />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-wisdom-muted">
                        Activity · last 7 days
                      </h2>
                    </div>
                    <div className="flex h-40 items-end gap-2">
                      {last7Days.map((d) => (
                        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                          <span className="text-[10px] font-semibold tabular-nums text-wisdom-muted">
                            {d.value || ""}
                          </span>
                          <div className="flex w-full flex-1 items-end justify-center">
                            <div
                              className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-wisdom-cyan to-cyan-300/90 transition-all duration-500"
                              style={{
                                height: `${Math.max((d.value / maxBar) * 100, d.value > 0 ? 10 : 3)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-wisdom-muted">{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-wisdom-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-wisdom-cyan" />
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-wisdom-muted">
                          Recent
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTab("inquiries")}
                        className="text-xs font-semibold text-wisdom-cyan hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    {recentActivity.length === 0 ? (
                      <p className="text-sm text-wisdom-muted py-8 text-center">No inquiries yet</p>
                    ) : (
                      <ul className="space-y-2">
                        {recentActivity.map((r) => (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setTab("inquiries");
                                setSelectedId(r.id);
                                setStatusFilter("all");
                              }}
                              className="w-full flex items-start gap-2 rounded-xl px-2.5 py-2 hover:bg-white/5 text-left transition"
                            >
                              <span
                                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                                  (r.status || "new") === "new" ? "bg-wisdom-cyan" : "bg-white/25"
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{r.name}</p>
                                <p className="text-[11px] text-wisdom-muted truncate">
                                  {r.service || "General"} · {formatRelative(r.created_at)}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusStyle(
                                  r.status
                                )}`}
                              >
                                {r.status || "new"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setTab("users")}
                    className="rounded-2xl border border-white/10 bg-wisdom-card p-5 text-left hover:border-purple-500/40 transition group"
                  >
                    <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition" />
                    <h2 className="font-semibold">Registered Users</h2>
                    <p className="mt-1 text-sm text-wisdom-muted">{stats.users} accounts · search & export</p>
                  </button>
                  <button
                    onClick={() => setTab("inquiries")}
                    className="rounded-2xl border border-white/10 bg-wisdom-card p-5 text-left hover:border-wisdom-cyan/40 transition group"
                  >
                    <Inbox className="w-8 h-8 text-wisdom-cyan mb-3 group-hover:scale-110 transition" />
                    <h2 className="font-semibold">Inquiry Inbox</h2>
                    <p className="mt-1 text-sm text-wisdom-muted">
                      {stats.new} new · bulk actions, notes, delete
                    </p>
                  </button>
                </div>
              </div>
            )}

            {tab === "users" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wisdom-muted" />
                    <input
                      type="search"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name or email…"
                      className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-white/10 bg-wisdom-card text-sm outline-none focus:border-wisdom-cyan"
                    />
                  </div>
                  <button
                    onClick={() =>
                      downloadCsv(
                        "wisdom-tower-users.csv",
                        usersWithStats as unknown as Record<string, unknown>[],
                        ["full_name", "email", "created_at", "inquiry_count", "id"]
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-wisdom-cyan/30 bg-wisdom-cyan/10 text-sm font-medium text-wisdom-cyan hover:bg-wisdom-cyan/20 transition"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                {dataLoading ? (
                  <p className="py-16 text-center text-wisdom-muted">Loading…</p>
                ) : usersWithStats.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
                    <Users className="w-12 h-12 text-wisdom-muted mx-auto mb-4 opacity-40" />
                    <p className="text-wisdom-muted">No registered users yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white/5 text-wisdom-muted uppercase text-xs tracking-wide">
                        <tr>
                          <th className="px-4 py-3 font-semibold">#</th>
                          <th className="px-4 py-3 font-semibold">User</th>
                          <th className="px-4 py-3 font-semibold">Email</th>
                          <th className="px-4 py-3 font-semibold">Registered</th>
                          <th className="px-4 py-3 font-semibold text-right">Inquiries</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {usersWithStats.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-white/[0.03]">
                            <td className="px-4 py-3 text-wisdom-muted tabular-nums">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-wisdom-cyan to-cyan-800 flex items-center justify-center text-xs font-bold text-wisdom-dark shrink-0">
                                  {p.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (p.full_name || p.email || "?").charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="font-medium">{p.full_name || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-wisdom-muted">{p.email}</td>
                            <td className="px-4 py-3 text-wisdom-muted whitespace-nowrap">
                              {formatDateOnly(p.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex min-w-[2rem] justify-center rounded-full bg-wisdom-cyan/10 text-wisdom-cyan px-2 py-0.5 text-xs font-semibold tabular-nums">
                                {p.inquiry_count}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-4 py-3 border-t border-white/5 text-xs text-wisdom-muted">
                      Total registered: <strong className="text-white">{usersWithStats.length}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "inquiries" && (
              <div className="flex flex-col xl:flex-row gap-4">
                <div className={`min-w-0 ${selectedInquiry ? "xl:w-[48%]" : "w-full"}`}>
                  {/* Filters */}
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
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
                      <button
                        onClick={() =>
                          downloadCsv(
                            "wisdom-tower-inquiries.csv",
                            filtered as unknown as Record<string, unknown>[],
                            ["id", "created_at", "name", "email", "service", "message", "status", "admin_notes"]
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl border border-wisdom-cyan/30 bg-wisdom-cyan/10 text-sm font-medium text-wisdom-cyan hover:bg-wisdom-cyan/20 transition"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-wisdom-muted mr-1" />
                      {(["all", ...STATUS_OPTIONS] as const).map((s) => {
                        const count =
                          s === "all"
                            ? inquiries.length
                            : inquiries.filter((i) => (i.status || "new") === s).length;
                        const active = statusFilter === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(s)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize border transition ${
                              active
                                ? "border-wisdom-cyan/50 bg-wisdom-cyan/15 text-wisdom-cyan"
                                : "border-white/10 text-wisdom-muted hover:text-white hover:border-white/20"
                            }`}
                          >
                            {s} <span className="opacity-70 tabular-nums">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bulk bar */}
                    {selectedIds.size > 0 && (
                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-wisdom-cyan/25 bg-wisdom-cyan/5 px-3 py-2.5">
                        <span className="text-xs font-semibold text-wisdom-cyan tabular-nums">
                          {selectedIds.size} selected
                        </span>
                        <div className="h-4 w-px bg-white/15" />
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={bulkBusy}
                            onClick={() => bulkUpdateStatus(s)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold capitalize hover:bg-white/10 disabled:opacity-50"
                          >
                            → {s}
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={bulkBusy}
                          onClick={bulkDelete}
                          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedIds(new Set())}
                          className="text-[11px] text-wisdom-muted hover:text-white"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {dataLoading ? (
                    <p className="py-16 text-center text-wisdom-muted">Loading…</p>
                  ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
                      <Inbox className="w-12 h-12 text-wisdom-muted mx-auto mb-4 opacity-40" />
                      <p className="text-wisdom-muted">No inquiries match</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                      <div className="flex items-center gap-3 px-3 py-2 border-b border-white/8 bg-white/[0.03]">
                        <label className="flex items-center gap-2 text-xs text-wisdom-muted cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={allFilteredSelected}
                            onChange={toggleSelectAll}
                            className="rounded border-white/20 bg-black/40 text-wisdom-cyan focus:ring-wisdom-cyan/40"
                          />
                          Select all ({filtered.length})
                        </label>
                      </div>
                      <ul className="divide-y divide-white/5 max-h-[min(70vh,720px)] overflow-y-auto">
                        {filtered.map((inquiry) => {
                          const isSel = selectedId === inquiry.id;
                          const checked = selectedIds.has(inquiry.id);
                          const isNew = (inquiry.status || "new") === "new";
                          return (
                            <li
                              key={inquiry.id}
                              className={`flex gap-2 px-2 sm:px-3 py-2.5 transition ${
                                isSel ? "bg-wisdom-cyan/10" : "hover:bg-white/[0.03]"
                              } ${isNew ? "border-l-2 border-l-wisdom-cyan" : "border-l-2 border-l-transparent"}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelect(inquiry.id)}
                                className="mt-2.5 rounded border-white/20 bg-black/40 text-wisdom-cyan focus:ring-wisdom-cyan/40 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                type="button"
                                className="flex-1 min-w-0 text-left"
                                onClick={() => setSelectedId(inquiry.id)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className={`text-sm truncate ${isNew ? "font-bold text-white" : "font-medium text-white/90"}`}>
                                      {inquiry.name}
                                    </p>
                                    <p className="text-[11px] text-wisdom-muted truncate">
                                      {inquiry.email}
                                      {inquiry.service ? ` · ${inquiry.service}` : ""}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusStyle(
                                        inquiry.status
                                      )}`}
                                    >
                                      {inquiry.status || "new"}
                                    </span>
                                    <span className="text-[10px] text-wisdom-muted">
                                      {formatRelative(inquiry.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-1 text-xs text-wisdom-muted/80 line-clamp-1">{inquiry.message}</p>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Detail panel */}
                {selectedInquiry && (
                  <div className="xl:w-[52%] rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden xl:sticky xl:top-24 self-start">
                    <div className="flex items-start justify-between gap-2 px-4 sm:px-5 py-4 border-b border-white/8 bg-gradient-to-r from-wisdom-cyan/10 to-transparent">
                      <div className="min-w-0">
                        <p className="text-xs text-wisdom-muted mb-0.5">{formatDate(selectedInquiry.created_at)}</p>
                        <h3 className="text-lg font-bold truncate">{selectedInquiry.name}</h3>
                        <p className="text-sm text-wisdom-muted truncate">{selectedInquiry.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="p-2 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/10 shrink-0"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 space-y-4 max-h-[min(75vh,800px)] overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                            selectedInquiry.status
                          )}`}
                        >
                          {selectedInquiry.status || "new"}
                        </span>
                        {selectedInquiry.service && (
                          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80">
                            {selectedInquiry.service}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => copyEmail(selectedInquiry.email, selectedInquiry.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                        >
                          {copiedId === selectedInquiry.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          Copy email
                        </button>
                        <a
                          href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                            "Re: Your inquiry to Wisdom Tower"
                          )}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Reply
                        </a>
                        <a
                          href={`mailto:${selectedInquiry.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open mail
                        </a>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-wisdom-muted">
                          Status
                        </label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={updatingId === selectedInquiry.id}
                              onClick={() => updateStatus(selectedInquiry.id, s)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize border transition disabled:opacity-50 ${
                                (selectedInquiry.status || "new") === s
                                  ? "border-wisdom-cyan/50 bg-wisdom-cyan/15 text-wisdom-cyan"
                                  : "border-white/10 text-wisdom-muted hover:text-white hover:border-white/25"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-wisdom-muted">
                          Message
                        </label>
                        <p className="mt-1.5 text-sm text-white/90 whitespace-pre-wrap leading-relaxed rounded-xl border border-white/8 bg-black/25 p-3.5">
                          {selectedInquiry.message}
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wide text-wisdom-muted">
                          Internal notes
                        </label>
                        <textarea
                          value={noteDraft[selectedInquiry.id] ?? selectedInquiry.admin_notes ?? ""}
                          onChange={(e) =>
                            setNoteDraft((d) => ({ ...d, [selectedInquiry.id]: e.target.value }))
                          }
                          rows={4}
                          placeholder="Private notes for your team…"
                          className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-wisdom-cyan resize-y"
                        />
                        <button
                          type="button"
                          disabled={updatingId === selectedInquiry.id}
                          onClick={() =>
                            saveNote(
                              selectedInquiry.id,
                              noteDraft[selectedInquiry.id] ?? selectedInquiry.admin_notes ?? ""
                            )
                          }
                          className="mt-2 rounded-lg bg-wisdom-cyan px-4 py-2 text-xs font-bold text-wisdom-dark hover:bg-wisdom-cyan-dark disabled:opacity-50 transition"
                        >
                          Save notes
                        </button>
                      </div>

                      <div className="pt-2 border-t border-white/8">
                        {confirmDelete === selectedInquiry.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-red-400 font-medium">Delete permanently?</span>
                            <button
                              type="button"
                              disabled={updatingId === selectedInquiry.id}
                              onClick={() => deleteInquiry(selectedInquiry.id)}
                              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              Yes, delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-wisdom-muted hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(selectedInquiry.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400/80 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete inquiry
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!selectedInquiry && filtered.length > 0 && (
                  <div className="hidden xl:flex xl:w-[52%] items-center justify-center rounded-2xl border border-dashed border-white/10 min-h-[280px]">
                    <div className="text-center px-6">
                      <MoreHorizontal className="w-10 h-10 text-wisdom-muted/40 mx-auto mb-3" />
                      <p className="text-sm text-wisdom-muted">Select an inquiry to open the detail panel</p>
                      <p className="text-xs text-wisdom-muted/70 mt-1">Status, notes, reply & delete</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
