"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  User,
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

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [academyMenuOpen, setAcademyMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "in" | "out"; msg: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => setIsOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    setAcademyMenuOpen(false);
    setProfileOpen(false);
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

  const Avatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const dim = size === "lg" ? "w-11 h-11 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
    return (
      <div
        className={`${dim} rounded-full overflow-hidden bg-gradient-to-br from-wisdom-cyan to-cyan-700 flex items-center justify-center font-bold text-wisdom-dark border border-white/15 shrink-0 ring-2 ring-transparent`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>
    );
  };

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

      <header className="fixed top-0 left-0 right-0 z-50 bg-wisdom-dark/95 backdrop-blur-md border-b border-white/5">
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
                  <Link
                    href="/academy"
                    className="nav-link text-sm text-wisdom-muted hover:text-amber-400 transition-colors"
                    data-active={isActivePath(pathname, "/academy") && pathname === "/academy" ? "true" : undefined}
                  >
                    Programs
                  </Link>
                  {academyMenuLinks.slice(0, 3).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="nav-link text-sm text-wisdom-muted hover:text-amber-400 transition-colors"
                      data-active={isActivePath(pathname, link.href) ? "true" : undefined}
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
                    className="nav-link text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                    data-active={isActivePath(pathname, link.href) ? "true" : undefined}
                  >
                    {link.label}
                  </Link>
                ))
              )}

              {!loading &&
                (user ? (
                  <div className="relative ml-1" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      aria-expanded={profileOpen}
                      aria-haspopup="menu"
                      className={`flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 border transition-all duration-200 ${
                        profileOpen
                          ? "border-wisdom-cyan/50 bg-wisdom-cyan/10 ring-2 ring-wisdom-cyan/20"
                          : "border-white/10 hover:border-white/25 hover:bg-white/5"
                      }`}
                    >
                      <Avatar size="sm" />
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-wisdom-muted transition-transform duration-200 ${
                          profileOpen ? "rotate-180 text-wisdom-cyan" : ""
                        }`}
                      />
                    </button>

                    {profileOpen && (
                      <div
                        className="mobile-menu-panel absolute right-0 top-full mt-2.5 w-[17.5rem] rounded-2xl border border-white/12 bg-[#0a0f1a] shadow-2xl shadow-black/70 overflow-hidden z-[70]"
                        role="menu"
                      >
                        <div className="px-4 py-3.5 border-b border-white/10 bg-gradient-to-br from-wisdom-cyan/10 via-transparent to-transparent">
                          <div className="flex items-center gap-3">
                            <Avatar size="lg" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                              <p className="text-[11px] text-wisdom-muted truncate">{user.email}</p>
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {isAdmin && (
                                  <span className="inline-flex items-center gap-0.5 rounded-md border border-wisdom-cyan/35 bg-wisdom-cyan/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wisdom-cyan">
                                    <Shield className="w-2.5 h-2.5" />
                                    Admin
                                  </span>
                                )}
                                {platform && (
                                  <span
                                    className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      platform === "academy"
                                        ? "border-amber-400/35 text-amber-400 bg-amber-500/10"
                                        : "border-cyan-400/35 text-cyan-400 bg-cyan-500/10"
                                    }`}
                                  >
                                    {platform === "academy" ? (
                                      <GraduationCap className="w-2.5 h-2.5" />
                                    ) : (
                                      <Monitor className="w-2.5 h-2.5" />
                                    )}
                                    {platform}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="py-1.5">
                          <Link
                            href="/account"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="w-4 h-4 text-wisdom-muted" />
                            My Account
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              role="menuitem"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-wisdom-cyan hover:bg-wisdom-cyan/10 transition-colors"
                              onClick={() => setProfileOpen(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                          <Link
                            href={platform === "academy" ? "/academy" : "/digital"}
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-wisdom-muted" />
                            {platform === "academy" ? "Academy Hub" : "Digital Services"}
                          </Link>
                        </div>

                        <div className="border-t border-white/10 py-1.5 bg-[#050810]">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 ml-2">
                    <Link href="/login" className="text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium hover:bg-wisdom-cyan-dark hover:scale-105 active:scale-100 transition-all duration-300"
                    >
                      Get Started
                    </Link>
                  </div>
                ))}
            </nav>

            {/* Mobile menu */}
            <div className="md:hidden relative" ref={menuRef}>
              <button
                type="button"
                className="p-2 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/5"
                onClick={() => setIsOpen((v) => !v)}
                aria-label="Menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {isOpen && (
                <div
                  className="mobile-menu-panel absolute right-0 top-full mt-2 w-[min(18.5rem,calc(100vw-1.5rem))] rounded-2xl border border-white/15 bg-[#0a0f1a] shadow-2xl shadow-black/60 overflow-hidden z-[60]"
                  role="menu"
                  style={{ backgroundColor: "#0a0f1a" }}
                >
                  <nav className="py-2 max-h-[min(70vh,28rem)] overflow-y-auto bg-[#0a0f1a]">
                    {showAcademyChrome ? (
                      <>
                        <Link
                          href="/academy"
                          className="block px-4 py-2.5 text-sm text-white/90 hover:text-amber-400 hover:bg-white/5"
                          onClick={() => setIsOpen(false)}
                        >
                          Programs
                        </Link>
                        {academyMenuLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block px-4 py-2.5 text-sm text-white/90 hover:text-amber-400 hover:bg-white/5"
                            onClick={() => setIsOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))}
                        <Link
                          href="/"
                          className="block px-4 py-2.5 text-sm text-white/90 hover:text-wisdom-cyan hover:bg-white/5"
                          onClick={() => setIsOpen(false)}
                        >
                          Main site
                        </Link>
                      </>
                    ) : (
                      mainNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2.5 text-sm text-white/90 hover:text-wisdom-cyan hover:bg-white/5"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))
                    )}
                  </nav>

                  <div className="border-t border-white/10 px-4 py-3 space-y-1 bg-[#050810]">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 pb-2">
                          <Avatar size="md" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{displayName}</p>
                            <p className="text-[11px] text-wisdom-muted truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link
                          href="/account"
                          className="flex items-center gap-2 text-sm text-white/85 hover:text-wisdom-cyan py-1.5"
                          onClick={() => setIsOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          My Account
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 text-sm text-wisdom-cyan py-1.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <Shield className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2 text-sm text-red-400 py-1.5 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/login"
                          className="block text-center text-sm text-white/85 hover:text-wisdom-cyan py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="block w-full text-center px-4 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
                          onClick={() => setIsOpen(false)}
                        >
                          Get Started
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showAcademyChrome && academyMenuOpen && (
          <div className="border-t border-white/5 bg-wisdom-dark border-b border-white/5">
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
      </header>
    </>
  );
}
