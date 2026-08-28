"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Share2,
  Target,
  FileText,
  RefreshCw,
  Send,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Biz = {
  id: string;
  name: string;
  status: string;
  industry: string | null;
  website: string | null;
};

type Sub = {
  id: string;
  service_name: string;
  status: string;
  billing: string;
};

type Update = {
  id: string;
  kind: string;
  title: string;
  body: string;
  created_at: string;
};

/** Demo metrics until team pushes live numbers */
const DEMO_METRICS = [
  { label: "Posts this week", value: "12", hint: "Across active channels", icon: Share2 },
  { label: "Reach (7d)", value: "48.2k", hint: "Impressions snapshot", icon: Activity },
  { label: "Engagement rate", value: "4.1%", hint: "Likes, comments, shares", icon: BarChart3 },
  { label: "Open tasks", value: "5", hint: "In production with our team", icon: Target },
];

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "approved")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "pending" || s === "requested" || s === "reviewing" || s === "scoping")
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-white/10 text-wisdom-muted border-white/15";
}

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biz, setBiz] = useState<Biz | null>(null);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<"goal" | "draft" | "note">("goal");
  const [sending, setSending] = useState(false);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async (uid: string) => {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, name, status, industry, website")
      .eq("owner_user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1);

    const b = businesses?.[0] as Biz | undefined;
    if (!b) {
      // Try localStorage id from registration
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("wt_active_business_id");
      } catch {
        /* */
      }
      if (stored) {
        const { data: one } = await supabase
          .from("businesses")
          .select("id, name, status, industry, website")
          .eq("id", stored)
          .maybeSingle();
        if (one) {
          setBiz(one as Biz);
          const { data: s } = await supabase
            .from("business_subscriptions")
            .select("id, service_name, status, billing")
            .eq("business_id", one.id);
          setSubs((s as Sub[]) || []);
          const { data: u } = await supabase
            .from("business_updates")
            .select("id, kind, title, body, created_at")
            .eq("business_id", one.id)
            .order("created_at", { ascending: false })
            .limit(20);
          setUpdates((u as Update[]) || []);
          setDemo(false);
          return;
        }
      }
      setBiz(null);
      setSubs([]);
      setUpdates([]);
      setDemo(true);
      return;
    }

    setBiz(b);
    setDemo(false);
    const { data: s } = await supabase
      .from("business_subscriptions")
      .select("id, service_name, status, billing")
      .eq("business_id", b.id);
    setSubs((s as Sub[]) || []);
    const { data: u } = await supabase
      .from("business_updates")
      .select("id, kind, title, body, created_at")
      .eq("business_id", b.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setUpdates((u as Update[]) || []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        // Allow demo view without login so the product story is visible
        setUser(null);
        setDemo(true);
        setLoading(false);
        return;
      }
      setUser(session.user);
      await load(session.user.id);
      setLoading(false);
    });
  }, [load]);

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biz || !title.trim() || !body.trim()) return;
    setSending(true);
    const { error } = await supabase.from("business_updates").insert({
      business_id: biz.id,
      kind,
      title: title.trim(),
      body: body.trim(),
      created_by: user?.id ?? null,
    });
    setSending(false);
    if (!error) {
      setTitle("");
      setBody("");
      if (user) await load(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative py-10 md:py-14 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-wisdom-cyan mb-2 flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Business dashboard
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              {biz?.name || "Your company hub"}
            </h1>
            <p className="text-sm text-wisdom-muted mt-1">
              {demo
                ? "Preview mode — register a business to connect live data."
                : `Status: ${biz?.status || "—"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {biz && (
              <button
                type="button"
                onClick={() => user && load(user.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            <Link
              href="/business/register"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold"
            >
              <Building2 className="w-4 h-4" />
              {biz ? "Add services" : "Register business"}
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {DEMO_METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted">
                    {m.label}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1 tabular-nums">{m.value}</p>
                  <p className="text-[11px] text-wisdom-muted mt-1">{m.hint}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-wisdom-cyan">
                  <m.icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Subscriptions */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-wisdom-cyan" />
                  Subscribed services
                </h2>
              </div>
              {subs.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-wisdom-muted mb-4">
                    {demo
                      ? "After registration and approval, active services appear here."
                      : "No services linked yet — or still under review."}
                  </p>
                  <Link
                    href="/business/register"
                    className="text-sm font-semibold text-wisdom-cyan inline-flex items-center gap-1"
                  >
                    Choose services
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/8">
                  {subs.map((s) => (
                    <li
                      key={s.id}
                      className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{s.service_name}</p>
                        <p className="text-[11px] text-wisdom-muted capitalize">{s.billing}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${statusBadge(s.status)}`}
                      >
                        {s.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5">
              <h2 className="font-semibold text-white flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-sky-400" />
                Social & delivery pulse
              </h2>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-4">
                When channels are connected and the team is live, this board shows post counts,
                content status, and campaign results — so you are not chasing five different tools.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {["Scheduled", "Published", "In review"].map((label, i) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center"
                  >
                    <p className="text-xl font-bold text-white tabular-nums">{[4, 12, 2][i]}</p>
                    <p className="text-[11px] text-wisdom-muted">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goals / drafts */}
          <div className="lg:col-span-2 space-y-6">
            <form
              onSubmit={submitUpdate}
              className="rounded-2xl border border-white/10 bg-wisdom-card p-5 space-y-3"
            >
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-wisdom-cyan" />
                Submit to the team
              </h2>
              <p className="text-xs text-wisdom-muted">
                Weekly goals, draft notes, or expectations — we pick them up from here.
              </p>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
                className="field-input"
                disabled={!biz || demo}
              >
                <option value="goal">Weekly goal</option>
                <option value="draft">Draft / brief</option>
                <option value="note">Note</option>
              </select>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="field-input"
                disabled={!biz || demo}
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Details…"
                className="field-input resize-none"
                disabled={!biz || demo}
              />
              <button
                type="submit"
                disabled={sending || !biz || demo || !title.trim() || !body.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold disabled:opacity-40"
              >
                {sending ? "Sending…" : (
                  <>
                    Send
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
              {demo && (
                <p className="text-[11px] text-amber-400/90 flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Connect a registered business (and sign in) to submit live updates.
                </p>
              )}
            </form>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10">
                <h2 className="font-semibold text-white text-sm">Recent submissions</h2>
              </div>
              {updates.length === 0 ? (
                <p className="p-6 text-sm text-wisdom-muted text-center">No submissions yet.</p>
              ) : (
                <ul className="divide-y divide-white/8 max-h-72 overflow-y-auto">
                  {updates.map((u) => (
                    <li key={u.id} className="px-5 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">
                        {u.kind}
                      </p>
                      <p className="text-sm font-semibold text-white">{u.title}</p>
                      <p className="text-xs text-wisdom-muted line-clamp-2 mt-0.5">{u.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {!user && (
          <p className="mt-8 text-center text-sm text-wisdom-muted">
            <Link href="/login" className="text-wisdom-cyan font-semibold hover:underline">
              Sign in
            </Link>{" "}
            after registering to lock the dashboard to your account.
          </p>
        )}
      </div>
    </div>
  );
}
