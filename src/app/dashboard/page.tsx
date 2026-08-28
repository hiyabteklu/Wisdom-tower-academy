"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import UserHubNav from "@/components/UserHubNav";
import {
  getBusinessCartServices,
  BUSINESS_CART_EVENT,
} from "@/lib/business-cart";
import { formatBizPrice, type BusinessService } from "@/data/business-services";

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
  const [bizCart, setBizCart] = useState<BusinessService[]>([]);

  useEffect(() => {
    const sync = () => setBizCart(getBusinessCartServices());
    sync();
    window.addEventListener(BUSINESS_CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(BUSINESS_CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const load = useCallback(async (uid: string) => {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id, name, status, industry, website")
      .eq("owner_user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1);

    const b = businesses?.[0] as Biz | undefined;
    if (!b) {
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
        <UserHubNav />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="section-eyebrow mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Digital hub
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
              {biz?.name || "My Dashboard"}
            </h1>
            <p className="text-base text-wisdom-muted mt-1">
              {demo
                ? "Register a business to connect live data — or manage your service cart below."
                : `Status: ${biz?.status || "—"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {biz && (
              <button
                type="button"
                onClick={() => user && load(user.id)}
                className="btn-ghost"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
            <Link href="/business/register" className="btn-primary">
              <Building2 className="w-4 h-4" />
              {biz ? "Add services" : "Register business"}
            </Link>
          </div>
        </div>

        <div className="surface-card rounded-2xl border border-white/12 p-5 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-wisdom-cyan" />
              Service cart
            </h2>
            <Link href="/business/cart" className="text-sm font-semibold text-wisdom-cyan hover:underline">
              Open cart →
            </Link>
          </div>
          {bizCart.length === 0 ? (
            <p className="text-sm text-wisdom-muted">
              No services selected.{" "}
              <Link href="/digital#register-business" className="text-wisdom-cyan font-semibold hover:underline">
                Browse subscriptions
              </Link>
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {bizCart.map((s) => (
                <li
                  key={s.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white/90"
                >
                  {s.name}
                  <span className="text-xs text-wisdom-cyan">{formatBizPrice(s.priceFromEtb, s.billing)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {DEMO_METRICS.map((m) => (
            <div key={m.label} className="surface-card rounded-2xl border border-white/12 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted">{m.label}</p>
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
          <div className="lg:col-span-3 space-y-6">
            <div className="surface-card rounded-2xl border border-white/12 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-wisdom-cyan" />
                  Subscribed services
                </h2>
              </div>
              {subs.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-wisdom-muted mb-4">
                    After registration and approval, active services appear here.
                  </p>
                  <Link href="/business/register" className="text-sm font-semibold text-wisdom-cyan inline-flex items-center gap-1">
                    Choose services <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-white/8">
                  {subs.map((s) => (
                    <li key={s.id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{s.service_name}</p>
                        <p className="text-[11px] text-wisdom-muted capitalize">{s.billing}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${statusBadge(s.status)}`}>
                        {s.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={submitUpdate} className="surface-card rounded-2xl border border-white/12 p-5 space-y-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-wisdom-cyan" />
                Submit to the team
              </h2>
              <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="field-input" disabled={!biz || demo}>
                <option value="goal">Weekly goal</option>
                <option value="draft">Draft / brief</option>
                <option value="note">Note</option>
              </select>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="field-input" disabled={!biz || demo} />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Details…" className="field-input resize-none" disabled={!biz || demo} />
              <button type="submit" disabled={sending || !biz || demo || !title.trim() || !body.trim()} className="btn-primary w-full">
                {sending ? "Sending…" : (<><Send className="w-4 h-4" /> Send</>)}
              </button>
              {demo && (
                <p className="text-[11px] text-amber-400/90 flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Register a business and sign in to submit live updates.
                </p>
              )}
            </form>

            <div className="surface-card rounded-2xl border border-white/12 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/10">
                <h2 className="font-semibold text-white text-sm">Recent submissions</h2>
              </div>
              {updates.length === 0 ? (
                <p className="p-6 text-sm text-wisdom-muted text-center">No submissions yet.</p>
              ) : (
                <ul className="divide-y divide-white/8 max-h-72 overflow-y-auto">
                  {updates.map((u) => (
                    <li key={u.id} className="px-5 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-wisdom-muted">{u.kind}</p>
                      <p className="text-sm font-semibold text-white">{u.title}</p>
                      <p className="text-xs text-wisdom-muted line-clamp-2 mt-0.5">{u.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
