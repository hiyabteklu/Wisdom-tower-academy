"use client";

import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import DatabaseHubPanel from "@/components/admin/DatabaseHubPanel";
import NotificationsPanel from "@/components/admin/NotificationsPanel";
import CompetitionsAdminPanel from "@/components/admin/CompetitionsAdminPanel";
import { AdminChip } from "@/components/admin/ui";
import BrandLoader from "@/components/BrandLoader";
import {
  CreditCard,
  Inbox,
  Users,
  LayoutDashboard,
  ExternalLink,
  Package,
  BookOpen,
  Shield,
  KeyRound,
  ChevronLeft,
  Library,
  Database,
  Search,
  Eye,
  Bell,
  Trophy,
  X,
} from "lucide-react";

/*
 * Admin Console, phone-first shell (slice A1 of docs/ADMIN_MOBILE_PLAN.md, section bar by slice U2 of docs/ADMIN_UI_V2_PLAN.md).
 * - Home = grid of module tiles with real counts only. No horizontal tab ribbon.
 * - Section view = one slim solid sticky bar (back chevron, gold icon chip, title, real-count subtitle) and the panel directly on the page.
 * - No own header, no backdrop blur, no pulse animation, no hard-coded status line.
 * - Deep links `/admin?tab=<id>` (and every alias below) open a section directly.
 * - Sections are opened with history.pushState so the phone Back button returns to the grid.
 * - 16 px of space under the app top bar at scroll 0 (the layout adds a 14 px fade there), 24 px at the bottom.
 * Admin gate, badge queries and the panels themselves are unchanged.
 */

type AcademyTab =
  | "overview"
  | "notifications"
  | "competitions"
  | "users"
  | "payments"
  | "grants"
  | "content"
  | "locks"
  | "catalog"
  | "free-resources"
  | "inquiries"
  | "database";

const VALID_TABS: AcademyTab[] = [
  "overview",
  "notifications",
  "competitions",
  "users",
  "payments",
  "grants",
  "content",
  "locks",
  "catalog",
  "free-resources",
  "inquiries",
  "database",
];

const TAB_ALIASES: Record<string, AcademyTab> = {
  overview: "overview",
  notifications: "notifications",
  notification: "notifications",
  competitions: "competitions",
  competition: "competitions",
  contests: "competitions",
  contest: "competitions",
  users: "users",
  user: "users",
  payments: "payments",
  payment: "payments",
  grants: "grants",
  grant: "grants",
  content: "content",
  contents: "content",
  locks: "locks",
  lock: "locks",
  catalog: "catalog",
  pricing: "catalog",
  "free-resources": "free-resources",
  "free-resource": "free-resources",
  free: "free-resources",
  inquiries: "inquiries",
  inquiry: "inquiries",
  database: "database",
  db: "database",
};

function parseTab(raw: string | null | undefined): AcademyTab | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized in TAB_ALIASES) return TAB_ALIASES[normalized];
  if ((VALID_TABS as string[]).includes(normalized)) return normalized as AcademyTab;
  return null;
}

function readTabFromLocation(): AcademyTab | null {
  if (typeof window === "undefined") return null;
  try {
    return parseTab(new URLSearchParams(window.location.search).get("tab"));
  } catch {
    return null;
  }
}

type TabDef = {
  id: AcademyTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
  // Built only from real counts, never invented text
  subtitle?: string;
};

function AdminDashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // null = home grid; otherwise the open section
  const [activeTab, setActiveTab] = useState<AcademyTab | null>(() =>
    parseTab(searchParams.get("tab"))
  );
  const [showSearch, setShowSearch] = useState(false);
  const [tabSearch, setTabSearch] = useState("");
  // true only when THIS page pushed a history entry, so the chevron can use history.back()
  const pushedRef = useRef(false);

  // Real counts only; null = not loaded (shown as a dash, never a made-up number)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number | null>(null);
  const [newInquiriesCount, setNewInquiriesCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);

  // Keep the open section in step with the URL (deep links, browser/phone Back)
  useEffect(() => {
    setActiveTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    const onPop = () => {
      const t = readTabFromLocation();
      setActiveTab(t);
      // Only the return to the grid consumes our pushed entry. A closing bottom sheet
      // pops its own entry and leaves the section (and this flag) as they were.
      if (t === null) pushedRef.current = false;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openTab = useCallback((id: AcademyTab) => {
    try {
      window.history.pushState(null, "", `/admin?tab=${id}`);
      pushedRef.current = true;
    } catch {}
    setActiveTab(id);
    setShowSearch(false);
    setTabSearch("");
    window.scrollTo(0, 0);
  }, []);

  const goHome = useCallback(() => {
    if (pushedRef.current) {
      // popstate listener returns to the grid
      pushedRef.current = false;
      window.history.back();
    } else {
      try {
        window.history.replaceState(null, "", "/admin");
      } catch {}
      setActiveTab(null);
    }
    window.scrollTo(0, 0);
  }, []);

  // Load user session and quick badge counts (unchanged logic)
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

      try {
        const [ordersRes, inqRes, usersRes] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
          supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);
        if (ordersRes.count != null) setPendingPaymentsCount(ordersRes.count);
        if (inqRes.count != null) setNewInquiriesCount(inqRes.count);
        if (usersRes.count != null) setUsersCount(usersRes.count);
      } catch (e) {
        console.warn("[admin badge counts]", e);
      }
    });
  }, [router]);

  const academyTabs: TabDef[] = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      {
        id: "notifications",
        label: "Push Broadcasts",
        icon: Bell,
      },
      { id: "competitions", label: "Competitions", icon: Trophy },
      {
        id: "users",
        label: "Scholars & Users",
        icon: Users,
        badge: usersCount != null && usersCount > 0 ? usersCount : undefined,
        subtitle: usersCount != null ? `${usersCount} ${usersCount === 1 ? "scholar" : "scholars"}` : undefined,
      },
      {
        id: "payments",
        label: "Payments",
        icon: CreditCard,
        badge: pendingPaymentsCount != null && pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
        badgeColor: "bg-amber-500/25 text-amber-200 border-amber-400/40",
        subtitle: pendingPaymentsCount != null ? `${pendingPaymentsCount} pending` : undefined,
      },
      { id: "grants", label: "Access Grants", icon: KeyRound },
      { id: "content", label: "Course Content", icon: BookOpen },
      { id: "locks", label: "Content Locks", icon: Shield },
      { id: "catalog", label: "Pricing & Catalog", icon: Package },
      { id: "free-resources", label: "Free Resources", icon: Library },
      {
        id: "inquiries",
        label: "Inquiries",
        icon: Inbox,
        badge: newInquiriesCount != null && newInquiriesCount > 0 ? newInquiriesCount : undefined,
        badgeColor: "bg-cyan-500/25 text-cyan-200 border-cyan-400/40",
        subtitle: newInquiriesCount != null ? `${newInquiriesCount} new` : undefined,
      },
      { id: "database", label: "Database & SQL Hub", icon: Database },
    ],
    [pendingPaymentsCount, newInquiriesCount, usersCount]
  );

  const filteredTabs = useMemo(() => {
    const q = tabSearch.trim().toLowerCase();
    if (!q) return academyTabs;
    return academyTabs.filter((t) => t.label.toLowerCase().includes(q) || t.id.includes(q));
  }, [academyTabs, tabSearch]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3" data-wta-spinner="true">
        <BrandLoader size="md" label="Authenticating executive privileges..." />
      </div>
    );
  }

  const activeDef = activeTab ? academyTabs.find((t) => t.id === activeTab) : undefined;
  const stats: { id: AcademyTab; label: string; value: number | null }[] = [
    { id: "users", label: "Scholars", value: usersCount },
    { id: "payments", label: "Pending payments", value: pendingPaymentsCount },
    { id: "inquiries", label: "New inquiries", value: newInquiriesCount },
  ];

  // ---------- Section view ----------
  if (activeTab) {
    const ActiveIcon = activeDef?.icon;
    return (
      <div className="min-h-screen bg-wisdom-dark text-white">
        {/* pt-4 keeps the bar content below the 14 px fade the admin layout draws under the app top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-wisdom-dark px-3 pb-3 pt-4">
          <button
            type="button"
            onClick={goHome}
            aria-label="Back to all modules"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-wisdom-card text-white active:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {ActiveIcon && <AdminChip icon={ActiveIcon} />}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight">{activeDef?.label ?? "Admin"}</h1>
            {activeDef?.subtitle && (
              <p className="mt-0.5 truncate text-xs text-wisdom-muted">{activeDef.subtitle}</p>
            )}
          </div>
        </div>

        <main className="min-w-0 px-3 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            {activeTab === "overview" && <AnalyticsPanel />}
            {activeTab === "notifications" && <NotificationsPanel />}
            {activeTab === "competitions" && <CompetitionsAdminPanel />}
            {activeTab === "users" && <UsersPanel adminEmail={user.email || undefined} />}
            {activeTab === "payments" && user.email && <PaymentsPanel adminEmail={user.email} />}
            {activeTab === "grants" && user.email && <AccessGrantsPanel adminEmail={user.email} />}
            {activeTab === "content" && <ContentPanel />}
            {activeTab === "locks" && <LocksPanel />}
            {activeTab === "catalog" && <CatalogPanel />}
            {activeTab === "free-resources" && <FreeResourcesPanel />}
            {activeTab === "inquiries" && <InquiriesPanel />}
            {activeTab === "database" && <DatabaseHubPanel />}
          </div>
        </main>
      </div>
    );
  }

  // ---------- Home grid ----------
  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      <main className="min-w-0 px-3 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Real counts */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => openTab(s.id)}
              className="min-h-[64px] min-w-0 rounded-2xl border border-white/10 bg-wisdom-card px-2 py-2 text-center active:bg-white/10"
            >
              <div className="text-xl font-extrabold tabular-nums text-white">
                {s.value == null ? "–" : s.value}
              </div>
              <div className="text-xs leading-tight text-wisdom-muted">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filter toggle */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <h1 className="text-base font-bold">Admin modules</h1>
          <button
            type="button"
            onClick={() => {
              setShowSearch((v) => !v);
              setTabSearch("");
            }}
            aria-label={showSearch ? "Close filter" : "Filter modules"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-wisdom-card text-wisdom-muted active:bg-white/10"
          >
            {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {showSearch && (
          <input
            type="text"
            value={tabSearch}
            onChange={(e) => setTabSearch(e.target.value)}
            placeholder="Filter admin sections..."
            autoFocus
            className="mt-2 w-full rounded-full border border-white/10 bg-wisdom-card px-4 py-3 text-sm text-white placeholder-wisdom-muted focus:border-amber-400 focus:outline-none"
          />
        )}

        {/* Module tiles */}
        <div className="mt-3 grid grid-cols-2 gap-2 min-[340px]:grid-cols-3">
          {filteredTabs.map(({ id, label, icon: Icon, badge, badgeColor }) => (
            <button
              key={id}
              type="button"
              onClick={() => openTab(id)}
              className="relative flex min-h-[96px] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-wisdom-card px-2 py-3 text-center active:bg-white/10"
            >
              {badge !== undefined && (
                <span
                  className={`absolute right-1.5 top-1.5 rounded-full border px-1.5 py-0.5 text-[11px] font-extrabold leading-none tabular-nums ${
                    badgeColor || "border-white/15 bg-white/10 text-white/90"
                  }`}
                >
                  {badge}
                </span>
              )}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
                <Icon className="h-5 w-5" />
              </span>
              <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-white">{label}</span>
            </button>
          ))}
        </div>
        {filteredTabs.length === 0 && (
          <p className="mt-4 text-center text-sm text-wisdom-muted">No section matches your filter.</p>
        )}

        {/* Quiet links (from the old header) */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/academy"
            target="_blank"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/10 bg-wisdom-card px-3 text-sm font-semibold text-wisdom-muted active:bg-white/10"
          >
            <Eye className="h-4 w-4" />
            Live Academy
          </Link>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/10 bg-wisdom-card px-3 text-sm font-semibold text-wisdom-muted active:bg-white/10"
          >
            <Database className="h-4 w-4 text-cyan-400" />
            Supabase
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </main>
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3" data-wta-spinner="true">
      <BrandLoader size="md" label="Loading admin environment..." />
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
