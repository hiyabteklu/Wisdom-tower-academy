"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile, getFullProfile, type UserProfileRecord } from "@/lib/profile";
import { computeStudentId, persistStudentIdIfNeeded, type StudentIdData } from "@/lib/student-id";
import StudentAvatar from "@/components/StudentAvatar";
import StudentIdCard from "@/components/StudentIdCard";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import BrandLoader from "@/components/BrandLoader";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  GraduationCap,
  HardDrive,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  QrCode,
  RotateCw,
  Scale,
  Settings2,
  Shield,
  Smartphone,
  Target,
  UserCheck,
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
  const [tab, setTab] = useState<"analytics" | "id-card" | "packages" | "requests">("analytics");
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
    if (!user?.email) return;
    setDataLoading(true);
    try {
      const { data: inqData } = await supabase
        .from("inquiries")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });
      setInquiries((inqData as Inquiry[]) || []);

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
        {/* TOP HERO: DIGITAL STUDENT ID & STUDENT ACCOUNT CENTER      */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Physical Realistic ID Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <StudentIdCard
              idData={idData}
              studentName={displayName}
              avatarPreset={profile?.avatar_preset}
              avatarUrl={profile?.avatar_url}
              educationLevel={profile?.education_level}
              stream={profile?.stream}
              schoolName={profile?.school_name}
              region={profile?.town_region}
            />
          </div>

          {/* Right Column: Student Account Center Mini Register */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-gradient-to-br from-wisdom-card via-wisdom-navy/95 to-wisdom-dark p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40">
                      <UserCheck className="w-3 h-3 text-sky-400" />
                      Verified Student Account
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      ID: {idData.idNumber}
                    </span>
                  </div>
                  <h1 className="font-display text-xl sm:text-2xl font-black text-white mt-1.5">
                    {displayName}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/settings"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-cyan-300" />
                    Edit Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/50 bg-rose-500/15 text-rose-200 hover:bg-rose-500/30 hover:border-rose-400 hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
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

              {/* Student Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 text-xs">
                <div className="p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-0.5">
                    Student Reference No.
                  </p>
                  <p className="font-mono font-bold text-white flex items-center gap-1.5 truncate">
                    {idData.folioNumber}
                    <button
                      type="button"
                      onClick={handleCopyFolio}
                      className="text-wisdom-muted hover:text-cyan-300 transition-colors"
                      title="Copy Folio"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </p>
                  {copiedFolio && (
                    <span className="text-[9px] text-emerald-400">Copied!</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-0.5">
                    Issue Date
                  </p>
                  <p className="font-semibold text-slate-200 truncate">
                    {idData.issueDateFull}
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-0.5">
                    Expiration Date
                  </p>
                  <p className="font-bold text-amber-300 truncate">
                    {idData.expiryDateFull}
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-0.5">
                    Academic Scope
                  </p>
                  <p className="font-semibold text-cyan-300 truncate">
                    {profile?.education_level || "Freshman Core"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-0.5">
                    Institution
                  </p>
                  <p className="font-semibold text-white truncate">
                    {profile?.school_name || "Wisdom Tower Academy"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-wisdom-muted mb-0.5">
                    Academic Clearance
                  </p>
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    100% Cleared
                  </p>
                </div>
              </div>

              {profile?.bio && (
                <p className="mt-3.5 text-xs italic text-slate-300/85 px-1">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}
            </div>

            {/* Quick Launchpad Strip */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-wisdom-muted">
                Target Milestone:{" "}
                <strong className="text-white">
                  {profile?.target_exam || "Set in Settings"}
                </strong>
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href="/learning"
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Enter Learning Hub
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TAB NAVIGATION STRIP                                      */}
        {/* ========================================================= */}
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto pb-1">
          {[
            {
              id: "analytics" as const,
              label: "Your Academic Analytics & Progress",
              icon: LayoutDashboard,
            },
            {
              id: "id-card" as const,
              label: "Digital Student ID Card",
              icon: GraduationCap,
            },
            {
              id: "packages" as const,
              label: `Your Unlocked Packages (${orders.length})`,
              icon: Package,
            },
            {
              id: "requests" as const,
              label: `Your Inquiries & Support (${inquiries.length})`,
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

        {/* 2. DIGITAL STUDENT ID & REGISTRY EXPANDED VIEW */}
        {tab === "id-card" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-white/10 bg-wisdom-card space-y-4">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-300" />
                Institutional Credential Registry & Verification
              </h2>
              <p className="text-xs sm:text-sm text-wisdom-muted leading-relaxed">
                Your Wisdom Tower Academy digital student ID is an official credential verifying active enrollment
                in our academic ecosystem. The credential carries an incremental registration serial number,
                tamper-evident digital signatures, and 1-year renewable validity.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] space-y-1">
                  <p className="font-bold text-white">Annual Credential Validity</p>
                  <p className="text-wisdom-muted">
                    Issued on {idData.issueDateFull}. Strictly expires after exactly 1 academic year on{" "}
                    <span className="text-amber-300 font-bold">{idData.expiryDateFull}</span>.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] space-y-1">
                  <p className="font-bold text-white">Incremental Identifier</p>
                  <p className="text-wisdom-muted">
                    Assigned sequence number <span className="font-mono text-cyan-300">{idData.idNumber}</span> within the Ethiopian national scholar directory.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] space-y-1">
                  <p className="font-bold text-white">Verification Endpoint</p>
                  <p className="text-wisdom-muted">
                    Verifiable across domestic academic competitions and partner university programs.
                  </p>
                </div>
              </div>
            </div>

            {/* Centered Large Card Presentation */}
            <div className="py-6 flex justify-center">
              <StudentIdCard
                idData={idData}
                studentName={displayName}
                avatarPreset={profile?.avatar_preset}
                avatarUrl={profile?.avatar_url}
                educationLevel={profile?.education_level}
                stream={profile?.stream}
                schoolName={profile?.school_name}
                region={profile?.town_region}
              />
            </div>
          </div>
        )}

        {/* 3. UNLOCKED PACKAGES */}
        {tab === "packages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs sm:text-sm text-wisdom-muted">
                Your enrolled academic packages, unlocked syllabus tracks, and verified payment orders.
              </p>
              <Link href="/packages" className="btn-secondary text-xs px-3.5 py-1.5 border-white/15">
                Browse catalog →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <Package className="w-12 h-12 text-wisdom-muted mx-auto mb-3 opacity-40" />
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  No paid packages unlocked yet
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
