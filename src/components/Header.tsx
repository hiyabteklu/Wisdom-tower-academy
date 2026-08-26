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
  Sparkles,
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
  { href: "/academy/success-stories", label: "Success Stories", icon: Sparkles },
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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const isAdmin = isAdminEmail(user?.email);
  const platform = getPlatform(user);
  const onAcademyRoute = pathname.startsWith("/academy");
  const showAcademyChrome =
    Boolean(user) && (platform === "academy" || (onAcademyRoute && platform !== "digital"));

  return (
    <>
      {toast && (
        <div
          className={`fixed top-20 left-1/2 z-[200] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl border ${
            toast.type === "in"
              ? "bg-green-500/15 text-green-400 border-green-500/40"
              : "bg-red-500/15 text-red-400 border-red-500/40"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 bg-wisdom-dark/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 min-w-0">
              {showAcademyChrome && (
                <button
                  type="button"
                  aria-label="Academy menu"
                  className="p-2 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setAcademyMenuOpen((v) => !v)}
                >
                  {academyMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}

              <Link href={showAcademyChrome ? "/academy" : "/"} className="flex items-center gap-2 group min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    showAcademyChrome
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-wisdom-dark"
                      : "bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark text-wisdom-dark"
                  }`}
                >
                  {showAcademyChrome ? "WA" : "WT"}
                </div>
                <span className="font-semibold text-lg tracking-tight group-hover:text-wisdom-cyan transition-colors truncate">
                  {showAcademyChrome ? "Wisdom Academy" : "Wisdom Tower"}
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-5">
              {showAcademyChrome ? (
                <>
                  <Link href="/academy" className="text-sm text-wisdom-muted hover:text-amber-400 transition-colors">
                    Programs
                  </Link>
                  {academyMenuLinks.slice(0, 3).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-wisdom-muted hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              ) : (
                mainNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                ))
              )}

              {!loading &&
                (user ? (
                  <div className="flex items-center gap-2 ml-2">
                    {platform && (
                      <span
                        className={`hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          platform === "academy"
                            ? "border-amber-400/40 text-amber-400 bg-amber-500/10"
                            : "border-cyan-400/40 text-cyan-400 bg-cyan-500/10"
                        }`}
                      >
                        {platform === "academy" ? (
                          <GraduationCap className="w-3 h-3" />
                        ) : (
                          <Monitor className="w-3 h-3" />
                        )}
                        {platform}
                      </span>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-wisdom-cyan hover:bg-wisdom-cyan/10 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-wisdom-cyan to-cyan-700 flex items-center justify-center text-sm font-bold text-wisdom-dark border border-white/10">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm text-wisdom-muted max-w-[100px] truncate hidden lg:inline">
                        {displayName}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden lg:inline">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 ml-2">
                    <Link href="/login" className="text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium hover:bg-wisdom-cyan-dark transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                ))}
            </nav>

            <button
              className="md:hidden p-2 text-wisdom-muted hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {showAcademyChrome && academyMenuOpen && (
          <div className="border-t border-white/5 bg-wisdom-navy/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {academyMenuLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setAcademyMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 hover:border-amber-400/40 hover:bg-amber-500/5 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-amber-400" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="md:hidden bg-wisdom-navy border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              {showAcademyChrome ? (
                <>
                  <Link href="/academy" className="block text-wisdom-muted hover:text-amber-400" onClick={() => setIsOpen(false)}>
                    Programs
                  </Link>
                  {academyMenuLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-wisdom-muted hover:text-amber-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/" className="block text-wisdom-muted hover:text-wisdom-cyan" onClick={() => setIsOpen(false)}>
                    Main site
                  </Link>
                </>
              ) : (
                mainNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))
              )}

              <div className="pt-3 border-t border-white/5 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-wisdom-cyan to-cyan-700 flex items-center justify-center font-bold text-wisdom-dark">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-wisdom-muted">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/account" className="flex items-center gap-2 text-wisdom-muted hover:text-wisdom-cyan" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" />
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 text-wisdom-cyan" onClick={() => setIsOpen(false)}>
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-400">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block text-wisdom-muted hover:text-wisdom-cyan" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
