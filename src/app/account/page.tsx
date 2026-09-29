"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile, getFullProfile, type UserProfileRecord } from "@/lib/profile";
import { computeStudentId, persistStudentIdIfNeeded, type StudentIdData } from "@/lib/student-id";
import StudentIdCard from "@/components/StudentIdCard";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import BrandLoader from "@/components/BrandLoader";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
  Copy,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings2,
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
  const [tab, setTab] = useState<"analytics" | "requests">("analytics");
  const [copiedFolio, setCopiedFolio] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login?next=/account");
        return;
      }
      await ensureProfile(session.user);
      const full = await getFullProfile(session.user.id);

      // Auto-assign and persist student ID if not yet assigned
      if (session.user.id && !full?.student_id_number) {
        const assigned = await persistStudentIdIfNeeded(session.user.id, full?.student_id_number);
        if (full) full.student_id_number = assigned;
      }

      setUser(session.user);
      setProfile(full);
      setLoading(false);
    });
  }, [router]);

  const loadUserData = useCallback(async () => {
    if (!user?.email || !user?.id) return;
    setDataLoading(true);
    try {
      const [inqRes, myOrders] = await Promise.all([
        supabase
          .from("inquiries")
          .select("*")
          .eq("email", user.email)
          .order("created_at", { ascending: false }),
        listMyOrders(),
      ]);

      setInquiries((inqRes.data as Inquiry[]) || []);
      setOrders(myOrders);
    } catch {
      setInquiries([]);
    }
    setDataLoading(false);
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (user) loadUserData();
  }, [user, loadUserData]);

  const displayName = useMemo(() => {
    return (
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Student Scholar"
    );
  }, [profile, user]);

  const idData: StudentIdData = useMemo(() => {
    return computeStudentId(profile, user?.created_at);
  }, [profile, user?.created_at]);

  // Check if profile is 100% completed to unlock golden avatar crown
  const profileCompleted = useMemo(() => {
    let score = 0;
    if (profile?.first_name || profile?.full_name) score += 20;
    if (profile?.education_level) score += 20;
    if (profile?.stream) score += 15;
    if (profile?.school_name) score += 15;
    if (profile?.town_region) score += 10;
    if (profile?.target_exam) score += 10;
    if (profile?.phone) score += 10;
    return score >= 100;
  }, [profile]);

  const handleCopyFolio = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(idData.folioNumber);
      setCopiedFolio(true);
      setTimeout(() => setCopiedFolio(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-[65vh] flex flex-col items-center justify-center gap-3"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading student command center..." />
      </div>
    );
  }

  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="py-6 sm:py-10 md:py-14 min-h-[85vh] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================= */}
        {/* TOP HERO: OFFICIAL DIGITAL STUDENT ID & TOOLBAR            */}
        {/* ========================================================= */}
        <section className="flex flex-col items-center gap-5">
          {/* Centered Digital Student ID Card */}
          <div className="w-full max-w-md mx-auto">
            <StudentIdCard
              idData={idData}
              studentName={displayName}
              avatarPreset={profile?.avatar_preset}
              avatarUrl={profile?.avatar_url}
              educationLevel={profile?.education_level}
              stream={profile?.stream}
              schoolName={profile?.school_name}
              region={profile?.town_region}
              hasCrown={profileCompleted}
              autoFlipOnMount={true}
            />
          </div>

          {/* Clean Student Toolbar */}
          <div className="w-full max-w-xl mx-auto rounded-2xl border border-white/10 bg-wisdom-card p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-wisdom-muted font-mono">
                Folio: <strong className="text-white">{idData.folioNumber}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyFolio}
                className="text-wisdom-muted hover:text-cyan-300 transition-colors p-1"
                title="Copy Student Folio"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copiedFolio && (
                <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/learning"
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Learning Hub
              </Link>

              <Link
                href="/settings"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-300" />
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400 hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                Log Out
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-400/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAB NAVIGATION STRIP (2 Clean Tabs)                        */}
        {/* ========================================================= */}
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-1">
          {[
            {
              id: "analytics" as const,
              label: "Academic Analytics & Progress",
              icon: LayoutDashboard,
            },
            {
              id: "requests" as const,
              label: `Inquiries & Support (Need Help?) ${inquiries.length > 0 ? `(${inquiries.length})` : ""}`,
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

        {/* ========================================================= */}
        {/* TAB PANES                                                 */}
        {/* ========================================================= */}

        {/* 1. DEDICATED STUDENT PROGRESS TRACKER & ANALYTICS */}
        {tab === "analytics" && (
          <StudentAnalyticsDashboard
            userId={user.id}
            studentName={displayName}
            educationLevel={profile?.education_level}
            stream={profile?.stream}
            userCreatedAt={user?.created_at}
            dailyGoalMinutes={profile?.daily_study_goal_minutes || 45}
            enrolledPackageIds={orders.map((o) => o.packageId).filter(Boolean) as string[]}
          />
        )}

        {/* 4. INQUIRIES & SUPPORT */}
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
