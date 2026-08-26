"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  Shield,
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  Trophy,
  GraduationCap,
  Monitor,
  Building2,
  Library,
  Trees,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/academy", label: "Academy" },
  { href: "/digital", label: "Digital" },
  { href: "/services", label: "All Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Leaderboard lives inside each branch — not in global menu */
const academyMenuLinks = [
  { href: "/academy/faq", label: "FAQ", icon: HelpCircle },
  { href: "/academy/success-stories", label: "Success Stories", icon: Trophy },
  { href: "/academy/study-techniques", label: "Study Techniques", icon: BookOpen },
  { href: "/academy/campus-life", label: "Campus Life", icon: Trees },
  { href: "/academy/universities", label: "Universities", icon: Building2 },
  { href: "/academy/departments", label: "Departments", icon: Library },
  { href: "/academy/scholarships", label: "Scholarships", icon: GraduationCap },
];

function getPlatform(user: SupabaseUser | null): "academy" | "digital" | null {
  const p = user?.user_metadata?.platform;
  if (p === "academy" || p === "digital") return p;
  return null;
}

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [academyMenuOpen, setAcademyMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "in" | "out"; msg: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") {
        setToast({ type: "in", msg: "Signed in successfully" });
      }
      if (event === "SIGNED_OUT") {
        setToast({ type: "out", msg: "Signed out" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setIsOpen(false);
    setAcademyMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    setAcademyMenuOpen(false);
  };

  const onAcademyRoute = pathname.startsWith("/academy");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-wisdom-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-wisdom-cyan flex items-center justify-center text-wisdom-dark font-bold text-sm shadow-glow group-hover:scale-105 transition-transform">
              WT
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
              Wisdom Tower
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {mainNavLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-wisdom-cyan bg-wisdom-cyan/10"
                      : "text-wisdom-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 rounded-lg bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {isAdminEmail(user.email) && (
                  <Link
                    href="/admin"
                    className="p-2 rounded-lg text-wisdom-muted hover:text-amber-300 hover:bg-white/5 transition-colors"
                    title="Admin"
                  >
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  href="/account"
                  className="p-2 rounded-lg text-wisdom-muted hover:text-wisdom-cyan hover:bg-white/5 transition-colors"
                  title="Account"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-wisdom-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-wisdom-muted hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold hover:bg-wisdom-cyan-dark transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/5"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 animate-fade-up">
            <nav className="flex flex-col gap-1">
              {mainNavLinks.map((link) => {
                const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active ? "text-wisdom-cyan bg-wisdom-cyan/10" : "text-wisdom-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/account" className="px-3 py-2.5 rounded-lg text-sm text-wisdom-muted">
                    Account
                  </Link>
                  {isAdminEmail(user.email) && (
                    <Link href="/admin" className="px-3 py-2.5 rounded-lg text-sm text-amber-300">
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2.5 rounded-lg text-sm text-red-400 text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-2.5 rounded-lg text-sm text-wisdom-muted">
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-2.5 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-semibold text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-lg border animate-scale-in ${
            toast.type === "in"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
              : "bg-white/10 border-white/20 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </header>
  );
}
