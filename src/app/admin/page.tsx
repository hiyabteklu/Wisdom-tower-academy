"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";
import PaymentsPanel from "@/components/admin/PaymentsPanel";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import UsersPanel from "@/components/admin/UsersPanel";
import InquiriesPanel from "@/components/admin/InquiriesPanel";
import CatalogPanel from "@/components/admin/CatalogPanel";
import ContentPanel from "@/components/admin/ContentPanel";
import FreeResourcesPanel from "@/components/admin/FreeResourcesPanel";
import LocksPanel from "@/components/admin/LocksPanel";
import AccessGrantsPanel from "@/components/admin/AccessGrantsPanel";
import {
  LogOut,
  CreditCard,
  Inbox,
  Users,
  LayoutDashboard,
  ExternalLink,
  GraduationCap,
  Package,
  BookOpen,
  Shield,
  KeyRound,
  ArrowLeft,
  Library,
} from "lucide-react";

type AcademyTab =
  | "overview"
  | "content"
  | "free-resources"
  | "locks"
  | "grants"
  | "catalog"
  | "payments"
  | "users"
  | "inquiries";

const VALID_TABS: AcademyTab[] = [
  "grants",
  "content",
  "free-resources",
  "locks",
  "catalog",
  "overview",
  "payments",
  "users",
  "inquiries",
];

function parseTab(raw: string | null): AcademyTab {
  if (raw && (VALID_TABS as string[]).includes(raw)) return raw as AcademyTab;
  return "grants";
}

function AdminDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [academyTab, setAcademyTab] = useState<AcademyTab>("grants");

  // Sync tab from URL on load / browser back-forward
  useEffect(() => {
    setAcademyTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  const goTab = useCallback(
    (id: AcademyTab) => {
      setAcademyTab(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`/admin?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const academyTabs: { id: AcademyTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "grants", label: "Access", icon: KeyRound },
    { id: "content", label: "Content", icon: BookOpen },
    { id: "free-resources", label: "Free resources", icon: Library },
    { id: "locks", label: "Locks", icon: Shield },
    { id: "catalog", label: "Catalog", icon: Package },
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "users", label: "Users", icon: Users },
    { id: "inquiries", label: "Inquiries", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/account"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/12 bg-white/5 text-wisdom-muted hover:text-white hover:bg-white/10 shrink-0"
              title="Back to account"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 text-amber-300 border border-amber-400/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                Wisdom Tower Academy
              </p>
              <h1 className="text-xl sm:text-2xl font-bold truncate">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3 sm:px-4 py-2 rounded-xl border border-white/12 bg-white/5 text-sm font-medium hover:bg-white/10"
            >
              Supabase
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <Link
              href="/account"
              className="inline-flex items-center min-h-[40px] px-3 sm:px-4 py-2 rounded-xl border border-white/12 bg-white/5 text-sm font-medium hover:bg-white/10"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 min-h-[40px] px-3 sm:px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs — horizontal scroll on mobile; stays inside admin */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {academyTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => goTab(id)}
                className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-sm font-semibold border whitespace-nowrap transition-colors ${
                  academyTab === id
                    ? "border-amber-400/50 bg-amber-500/15 text-amber-200 shadow-sm shadow-amber-500/10"
                    : "border-white/10 text-wisdom-muted hover:text-white hover:border-white/20"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel area */}
        <div className="rounded-2xl border border-white/8 bg-wisdom-card/40 p-4 sm:p-6 min-h-[50vh]">
          {academyTab === "grants" && user.email && (
            <AccessGrantsPanel adminEmail={user.email} />
          )}
          {academyTab === "content" && <ContentPanel />}
          {academyTab === "free-resources" && <FreeResourcesPanel />}
          {academyTab === "locks" && <LocksPanel />}
          {academyTab === "overview" && <AnalyticsPanel />}
          {academyTab === "catalog" && <CatalogPanel />}
          {academyTab === "payments" && user.email && (
            <PaymentsPanel adminEmail={user.email} />
          )}
          {academyTab === "users" && <UsersPanel />}
          {academyTab === "inquiries" && <InquiriesPanel />}
        </div>
      </div>
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminDashboardInner />
    </Suspense>
  );
}
