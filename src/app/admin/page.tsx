"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile } from "@/lib/profile";
import type { User } from "@supabase/supabase-js";
import PaymentsPanel from "@/components/admin/PaymentsPanel";
import {
  Shield,
  LogOut,
  CreditCard,
  Inbox,
  Users,
  LayoutDashboard,
} from "lucide-react";

type AdminTab = "payments" | "overview";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("payments");

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
        <div className="w-8 h-8 border-2 border-wisdom-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-wisdom-cyan/20 to-cyan-600/10 text-wisdom-cyan border border-wisdom-cyan/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-cyan">
                Control Center
              </p>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => setTab("payments")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${
              tab === "payments"
                ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                : "border-white/10 text-wisdom-muted hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Payments
          </button>
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${
              tab === "overview"
                ? "border-wisdom-cyan/50 bg-wisdom-cyan/15 text-wisdom-cyan"
                : "border-white/10 text-wisdom-muted hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            More
          </button>
        </div>

        {tab === "payments" && user.email && (
          <PaymentsPanel adminEmail={user.email} />
        )}

        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/admin/payments"
              className="rounded-2xl border border-white/10 bg-wisdom-card p-5 hover:border-amber-500/40 transition"
            >
              <CreditCard className="w-8 h-8 text-amber-400 mb-3" />
              <h2 className="font-semibold">Payments (full page)</h2>
              <p className="mt-1 text-sm text-wisdom-muted">Same list · Approve & unlock</p>
            </Link>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-wisdom-card p-5 hover:border-cyan-500/40 transition"
            >
              <Users className="w-8 h-8 text-purple-400 mb-3" />
              <h2 className="font-semibold">Supabase</h2>
              <p className="mt-1 text-sm text-wisdom-muted">Users, tables, orders</p>
            </a>
            <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5 sm:col-span-2">
              <Inbox className="w-8 h-8 text-wisdom-cyan mb-3" />
              <h2 className="font-semibold">Inquiries inbox</h2>
              <p className="mt-1 text-sm text-wisdom-muted">
                Contact form messages still work in the database. Full inbox UI can be restored later
                — priority is payment approval for now.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
