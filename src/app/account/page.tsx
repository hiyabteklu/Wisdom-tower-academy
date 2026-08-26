"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Inbox,
  Shield,
  RefreshCw,
  ArrowLeft,
  Mail,
} from "lucide-react";

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
}

function statusStyle(status: string) {
  const s = (status || "new").toLowerCase();
  if (s === "replied" || s === "closed") return "bg-green-500/15 text-green-400 border-green-500/30";
  if (s === "read") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-wisdom-cyan/15 text-wisdom-cyan border-wisdom-cyan/30";
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "requests">("overview");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });
  }, [router]);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setDataLoading(true);
    try {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await client
        .from("inquiries")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });
      setInquiries((data as Inquiry[]) || []);
    } catch {
      setInquiries([]);
    }
    setDataLoading(false);
  }, [user?.email]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const isAdmin = isAdminEmail(user.email);
  const activeCount = inquiries.filter((i) => !["closed", "replied"].includes((i.status || "").toLowerCase())).length;

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Profile card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-wisdom-card">
          <div className="h-20 sm:h-24 bg-gradient-to-r from-wisdom-cyan/30 via-cyan-500/10 to-transparent" />
          <div className="-mt-10 flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:px-8">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-wisdom-card bg-gradient-to-br from-wisdom-cyan to-cyan-800 text-2xl font-bold text-wisdom-dark shadow-lg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
              <p className="text-sm text-wisdom-muted">{user.email}</p>
              <p className="mt-1 text-xs text-wisdom-muted">Member since {memberSince}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={load}
                disabled={dataLoading}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full border border-wisdom-cyan/30 bg-wisdom-cyan/10 text-sm font-medium text-wisdom-cyan hover:bg-wisdom-cyan/20"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-medium hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          {[
            { id: "overview" as const, label: "Overview" },
            { id: "requests" as const, label: "My Requests" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-[48px] px-5 py-3 text-sm font-semibold border-b-2 transition ${
                tab === t.id
                  ? "border-wisdom-cyan text-wisdom-cyan"
                  : "border-transparent text-wisdom-muted hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <button
              onClick={() => setTab("requests")}
              className="rounded-2xl border border-white/10 bg-wisdom-card p-5 text-left hover:border-wisdom-cyan/40 transition"
            >
              <Inbox className="w-8 h-8 text-wisdom-cyan mb-3" />
              <h2 className="font-semibold">My Requests</h2>
              <p className="mt-1 text-sm text-wisdom-muted">Service requests & contact messages</p>
              <p className="mt-3 text-sm font-medium text-wisdom-cyan">
                {dataLoading ? "Loading…" : `${activeCount} active · ${inquiries.length} total`}
              </p>
            </button>

            <Link
              href="/digital"
              className="rounded-2xl border border-white/10 bg-wisdom-card p-5 hover:border-wisdom-cyan/40 transition"
            >
              <LayoutDashboard className="w-8 h-8 text-wisdom-cyan mb-3" />
              <h2 className="font-semibold">Browse Services</h2>
              <p className="mt-1 text-sm text-wisdom-muted">Explore Digital & Academy offerings</p>
              <p className="mt-3 text-sm font-medium text-wisdom-cyan">Go to services →</p>
            </Link>

            <Link
              href="/contact"
              className="rounded-2xl border border-white/10 bg-wisdom-card p-5 hover:border-wisdom-cyan/40 transition"
            >
              <Mail className="w-8 h-8 text-wisdom-cyan mb-3" />
              <h2 className="font-semibold">Contact Us</h2>
              <p className="mt-1 text-sm text-wisdom-muted">Send a new message or custom request</p>
              <p className="mt-3 text-sm font-medium text-wisdom-cyan">Open form →</p>
            </Link>
          </div>
        )}

        {tab === "requests" && (
          <div>
            <p className="mb-4 text-sm text-wisdom-muted">
              Requests submitted with your email appear here. Status updates when our team reviews them.
            </p>
            {dataLoading ? (
              <p className="text-center text-wisdom-muted py-12">Loading…</p>
            ) : inquiries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
                <Inbox className="w-12 h-12 text-wisdom-muted mx-auto mb-4 opacity-40" />
                <h2 className="text-xl font-semibold mb-2">No requests yet</h2>
                <p className="text-sm text-wisdom-muted mb-6 max-w-md mx-auto">
                  Request a service or use the contact form. Use the same email as this account to see them here.
                </p>
                <Link
                  href="/digital"
                  className="inline-flex px-6 py-3 rounded-full bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark"
                >
                  Browse services
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {inquiries.map((q) => (
                  <li
                    key={q.id}
                    className="rounded-xl border border-white/10 border-l-4 border-l-wisdom-cyan bg-wisdom-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">{q.service || "General inquiry"}</h3>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(q.status)}`}>
                        {q.status || "new"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-wisdom-muted whitespace-pre-wrap line-clamp-3">{q.message}</p>
                    <p className="mt-2 text-xs text-wisdom-muted">
                      {new Date(q.created_at).toLocaleString()}
                    </p>
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
