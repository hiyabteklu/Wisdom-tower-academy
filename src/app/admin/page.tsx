"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";
import PaymentsPanel from "@/components/admin/PaymentsPanel";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import UsersPanel from "@/components/admin/UsersPanel";
import InquiriesPanel from "@/components/admin/InquiriesPanel";
import {
  Shield,
  LogOut,
  CreditCard,
  Inbox,
  Users,
  LayoutDashboard,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

type AcademyTab = "overview" | "payments" | "users" | "inquiries";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [academyTab, setAcademyTab] = useState<AcademyTab>("overview");

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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "users", label: "Users", icon: Users },
    { id: "inquiries", label: "Inquiries", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 text-amber-300 border border-amber-400/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                Wisdom Academy
              </p>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl border border-white/12 bg-white/5 text-sm font-medium hover:bg-white/10"
            >
              Supabase
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
            <Link
              href="/account"
              className="inline-flex items-center min-h-[40px] px-4 py-2 rounded-xl border border-white/12 bg-white/5 text-sm font-medium hover:bg-white/10"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {academyTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAcademyTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${
                academyTab === id
                  ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                  : "border-white/10 text-wisdom-muted hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {academyTab === "overview" && <AnalyticsPanel />}
        {academyTab === "payments" && user.email && <PaymentsPanel adminEmail={user.email} />}
        {academyTab === "users" && <UsersPanel />}
        {academyTab === "inquiries" && <InquiriesPanel />}
      </div>
    </div>
  );
}
