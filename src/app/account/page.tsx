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
  Check,
  Copy,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
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
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }
  if (s === "read" || s === "reviewing") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
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
        className="min-h-[70vh] flex flex-col items-center justify-center gap-4"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading student command center..." />
      </div>
    );
  }

  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="relative min-h-[90vh] py-8 sm:py-12 md:py-16 overflow-hidden">
      {/* Ambient background glows for soft depth and glass surfaces */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[42rem] h-[22rem] bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden
      />
      <div
        className="absolute top-96 left-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none -z-10"
        aria-hidden
      />
      <div
        className="absolute top-[32rem] right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* TOP HERO: DIGITAL STUDENT ID & SPACIOUS FLOATING TOOLBAR   */}
        {/* ========================================================= */}
        <section className="flex flex-col items-center gap-7 sm:gap-8">
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

          {/* Floating Glassmorphic Pill Control Bar */}
          <div className="w-full max-w-2xl mx-auto rounded-3xl sm:rounded-full border border-white/10 bg-[#0b1329]/75 backdrop-blur-2xl p-3 sm:p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] flex flex-wrap items-center justify-between gap-3">
            {/* Folio Pill with Circular Copy Button */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-[11px] text-slate-400 font-medium">Folio</span>
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                {idData.folioNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyFolio}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-transparent hover:border-cyan-400/30 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
                title="Copy Student Folio"
                aria-label="Copy Student Folio"
              >
                {copiedFolio ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/learning"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 shadow-[0_4px_18px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_24px_rgba(6,182,212,0.45)] transition-all duration-200 active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learning Hub</span>
              </Link>

              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-400/40 shadow-sm transition-all duration-200 active:scale-95"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Edit Profile</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/[0.08] hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-400/40 transition-all duration-200 active:scale-95 cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-purple-200 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 transition-all duration-200 active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SEGMENTED PILL TAB SWITCHER                                */}
        {/* ========================================================= */}
        <div className="flex justify-center">
          <div className="p-1.5 rounded-full bg-[#0a1122]/80 backdrop-blur-xl border border-white/10 inline-flex items-center gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            {[
              {
                id: "analytics" as const,
                label: "Academic Analytics & Progress",
                icon: LayoutDashboard,
              },
              {
                id: "requests" as const,
                label: "Inquiries & Support",
                count: inquiries.length,
                icon: Inbox,
              },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-cyan-300" : "text-slate-400"}`} />
                  <span>{t.label}</span>
                  {typeof t.count === "number" && t.count > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-cyan-400/25 text-cyan-100 border border-cyan-300/30"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB PANES                                                 */}
        {/* ========================================================= */}

        {/* 1. DEDICATED STUDENT PROGRESS TRACKER & ANALYTICS */}
        {tab === "analytics" && (
          <div className="transition-opacity duration-300 ease-out">
            <StudentAnalyticsDashboard
              userId={user.id}
              studentName={displayName}
              educationLevel={profile?.education_level}
              stream={profile?.stream}
              userCreatedAt={user?.created_at}
              dailyGoalMinutes={profile?.daily_study_goal_minutes || 45}
              enrolledPackageIds={orders.map((o) => o.packageId).filter(Boolean) as string[]}
            />
          </div>
        )}

        {/* 2. INQUIRIES & SUPPORT */}
        {tab === "requests" && (
          <div className="space-y-6 transition-opacity duration-300 ease-out max-w-4xl mx-auto">
            {/* Top Bar for Inquiries */}
            <div className="rounded-3xl border border-white/10 bg-[#0c1427]/70 backdrop-blur-xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-cyan-400" />
                  Your Support Inquiries
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Submitted requests, course inquiries, and academic counseling messages.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 shadow-[0_4px_18px_rgba(6,182,212,0.3)] transition-all duration-200 active:scale-95 self-start sm:self-center"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>New Inquiry</span>
              </Link>
            </div>

            {dataLoading ? (
              <div className="rounded-3xl border border-white/10 bg-[#0c1427]/50 backdrop-blur-xl p-12 text-center">
                <p className="text-sm text-slate-400">Loading your inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-[#0c1427]/40 backdrop-blur-xl p-12 sm:p-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                  <Inbox className="w-8 h-8 opacity-60 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-white mb-1">
                    No inquiries or service requests yet
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Have a question about a course, syllabus guide, or package verification? Our academic support desk is ready to help you.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 shadow-[0_4px_18px_rgba(6,182,212,0.3)] transition-all duration-200 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((q) => (
                  <div
                    key={q.id}
                    className="p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#0c1427]/70 backdrop-blur-xl hover:border-cyan-400/30 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.25)] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display font-bold text-white text-base">
                        {q.service || "General Academic Inquiry"}
                      </span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${statusStyle(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {q.message}
                    </p>
                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-[11px]">
                        {new Date(q.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Link
                        href="/contact"
                        className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1"
                      >
                        <span>Follow up</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
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
