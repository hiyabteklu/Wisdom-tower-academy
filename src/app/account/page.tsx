"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile, getFullProfile, type UserProfileRecord } from "@/lib/profile";
import StudentAvatar from "@/components/StudentAvatar";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  HardDrive,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings2,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  Zap,
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
  if (s === "replied" || s === "closed" || s === "approved") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (s === "read" || s === "reviewing") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  return "bg-cyan-500/15 text-cyan-300 border-cyan-400/30";
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "packages" | "requests">("overview");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/account");
        return;
      }
      await ensureProfile(session.user);
      const full = await getFullProfile(session.user.id);
      setUser(session.user);
      setProfile(full);
      setLoading(false);
    });
  }, [router]);

  const loadUserData = useCallback(async () => {
    if (!user?.email) return;
    setDataLoading(true);
    try {
      // Load user inquiries
      const { data: inqData } = await supabase
        .from("inquiries")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });
      setInquiries((inqData as Inquiry[]) || []);

      // Load user orders and access grants
      const myOrders = await listMyOrders();
      setOrders(myOrders);
    } catch {
      setInquiries([]);
    }
    setDataLoading(false);
  }, [user?.email]);

  useEffect(() => {
    if (user) loadUserData();
  }, [user, loadUserData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-wisdom-muted font-medium">Opening student dashboard...</p>
      </div>
    );
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Student";

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Active";

  const isAdmin = isAdminEmail(user.email);
  const activeRequests = inquiries.filter(
    (i) => !["closed", "replied"].includes((i.status || "").toLowerCase())
  ).length;

  return (
    <div className="py-8 sm:py-12 md:py-16 min-h-[85vh] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Digital Student Identity Card */}
        <div className="mb-8 rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-wisdom-card via-wisdom-navy/95 to-wisdom-dark shadow-2xl overflow-hidden relative">
          <div className="h-24 sm:h-28 bg-gradient-to-r from-cyan-500/20 via-sky-600/15 to-transparent relative">
            <div className="absolute top-3 right-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                Verified Student ID
              </span>
            </div>
          </div>

          <div className="-mt-12 px-6 pb-6 sm:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <StudentAvatar
                avatarPreset={profile?.avatar_preset}
                avatarUrl={profile?.avatar_url}
                name={displayName}
                size="xl"
                className="ring-4 ring-wisdom-dark shadow-xl"
              />
              <div className="pb-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {displayName}
                  </h1>
                  {isAdmin && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      Faculty / Admin
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-cyan-300 font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  {profile?.education_level || "Academic Pathway"}
                  {profile?.stream ? ` · ${profile.stream}` : ""}
                </p>

                <p className="text-xs text-wisdom-muted mt-1">
                  {profile?.school_name ? `${profile.school_name} · ` : ""}
                  {profile?.town_region ? `${profile.town_region} · ` : ""}
                  Member since {memberSince}
                </p>

                {profile?.bio && (
                  <p className="mt-2 text-xs italic text-slate-300/90 max-w-xl line-clamp-2">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex flex-wrap gap-2.5 self-start sm:self-end">
              <Link
                href="/settings"
                className="btn-secondary text-xs sm:text-sm px-4 py-2.5 border-white/20 hover:border-cyan-400/50"
              >
                <Settings2 className="w-4 h-4 text-cyan-300" />
                Advanced Settings
              </Link>
              <Link
                href="/learning"
                className="btn-primary text-xs sm:text-sm px-5 py-2.5"
              >
                <BookOpen className="w-4 h-4" />
                My Learning Hub
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-purple-400/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 flex items-center gap-1.5 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="mb-6 flex gap-2 border-b border-white/10 overflow-x-auto pb-1">
          {[
            { id: "overview" as const, label: "Dashboard Overview", icon: LayoutDashboard },
            {
              id: "packages" as const,
              label: `Unlocked Packages (${orders.length})`,
              icon: Package,
            },
            {
              id: "requests" as const,
              label: `Support & Inquiries (${inquiries.length})`,
              icon: Inbox,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? "border-cyan-400 text-cyan-300 bg-cyan-500/[0.04]"
                    : "border-transparent text-wisdom-muted hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-cyan-300" : ""}`} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panes */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Quick Metrics & Target Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card-modern p-4 sm:p-5 border-white/10 bg-wisdom-card/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted block mb-1">
                  Daily Study Target
                </span>
                <p className="font-display text-2xl sm:text-3xl font-black text-amber-300">
                  {profile?.daily_study_goal_minutes || 45}
                  <span className="text-xs text-wisdom-muted font-normal ml-1">mins</span>
                </p>
                <Link
                  href="/settings?tab=study"
                  className="text-[11px] text-cyan-300 hover:underline mt-1 block"
                >
                  Edit goal →
                </Link>
              </div>

              <div className="card-modern p-4 sm:p-5 border-white/10 bg-wisdom-card/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted block mb-1">
                  Target Exam
                </span>
                <p className="font-display text-sm sm:text-base font-bold text-white truncate">
                  {profile?.target_exam || "Not set yet"}
                </p>
                <Link
                  href="/settings?tab=profile"
                  className="text-[11px] text-cyan-300 hover:underline mt-1 block"
                >
                  Set milestone →
                </Link>
              </div>

              <div className="card-modern p-4 sm:p-5 border-white/10 bg-wisdom-card/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted block mb-1">
                  Packages
                </span>
                <p className="font-display text-2xl sm:text-3xl font-black text-emerald-400">
                  {orders.length}
                </p>
                <button
                  onClick={() => setTab("packages")}
                  className="text-[11px] text-cyan-300 hover:underline mt-1 block text-left"
                >
                  View access →
                </button>
              </div>

              <div className="card-modern p-4 sm:p-5 border-white/10 bg-wisdom-card/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-wisdom-muted block mb-1">
                  Inquiries
                </span>
                <p className="font-display text-2xl sm:text-3xl font-black text-purple-300">
                  {activeRequests}
                  <span className="text-xs text-wisdom-muted font-normal ml-1">pending</span>
                </p>
                <button
                  onClick={() => setTab("requests")}
                  className="text-[11px] text-cyan-300 hover:underline mt-1 block text-left"
                >
                  Check tickets →
                </button>
              </div>
            </div>

            {/* Quick Settings Access Grid */}
            <div className="card-modern p-5 sm:p-7 border-white/10 bg-wisdom-card/60">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-300" />
                Quick Setting Controls
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/settings?tab=profile"
                  className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-400/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/25 flex items-center justify-center text-cyan-300">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">Academic Stream</p>
                      <p className="text-[11px] text-wisdom-muted">Update school & grade level</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-wisdom-muted" />
                </Link>

                <Link
                  href="/settings?tab=app"
                  className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-400/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center text-amber-300">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">App Display & AMOLED</p>
                      <p className="text-[11px] text-wisdom-muted">Pure black & text scale</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-wisdom-muted" />
                </Link>

                <Link
                  href="/settings?tab=storage"
                  className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-400/40 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center text-purple-300">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">Offline Sync Manager</p>
                      <p className="text-[11px] text-wisdom-muted">Sync offline study logs</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-wisdom-muted" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Unlocked Packages Tab */}
        {tab === "packages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs sm:text-sm text-wisdom-muted">
                Your enrolled courses and payment verification orders.
              </p>
              <Link href="/packages" className="btn-secondary text-xs px-3 py-1.5 border-white/15">
                Browse catalog →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <Package className="w-12 h-12 text-wisdom-muted mx-auto mb-3 opacity-40" />
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  No packages unlocked yet
                </h3>
                <p className="text-xs sm:text-sm text-wisdom-muted mb-6 max-w-md mx-auto">
                  Explore Academy pathways (Grades 9–12, Freshman, Exit Exam, GAT) and unlock full question banks and notes.
                </p>
                <Link href="/packages" className="btn-primary text-xs px-6 py-3">
                  Explore Packages
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl border border-white/10 bg-wisdom-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-cyan-400/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display font-bold text-white text-base">
                          {o.packageName || o.packageId || "Curriculum Track"}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyle(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-wisdom-muted font-mono">
                        Ref: {o.transactionRef || o.id} · {o.paymentMethod || "Domestic Transfer"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <Link
                        href="/learning"
                        className="btn-secondary text-xs px-4 py-2 border-cyan-400/30 text-cyan-300"
                      >
                        Enter Learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs sm:text-sm text-wisdom-muted">
                Your submitted messages, service requests, and inquiry replies.
              </p>
              <Link href="/contact" className="btn-secondary text-xs px-3 py-1.5 border-white/15">
                New message →
              </Link>
            </div>

            {dataLoading ? (
              <p className="text-center text-xs text-wisdom-muted py-10">Loading requests...</p>
            ) : inquiries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <Inbox className="w-12 h-12 text-wisdom-muted mx-auto mb-3 opacity-40" />
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  No inquiries or service requests
                </h3>
                <p className="text-xs sm:text-sm text-wisdom-muted mb-6 max-w-md mx-auto">
                  Have a question about a course, syllabus, or payment? Our academic team is here to help.
                </p>
                <Link href="/contact" className="btn-primary text-xs px-6 py-3">
                  Submit Inquiry
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-white/10 bg-wisdom-card space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-white text-sm">
                        {q.service || "General Inquiry"}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusStyle(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {q.message}
                    </p>
                    <p className="text-[10px] text-wisdom-muted font-mono">
                      {new Date(q.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
