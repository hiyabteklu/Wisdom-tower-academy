"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LogOut,
  Shield,
  GraduationCap,
  ChevronDown,
  User,
  Settings,
  ShoppingBag,
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import HeaderLibraryLinks from "@/components/HeaderLibraryLinks";

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/academy", label: "Academy" },
  { href: "/digital", label: "Digital" },
  { href: "/services", label: "All Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
      setLoading(false);
    };
    void getUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [profileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    setProfileOpen(false);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const isAdmin = isAdminEmail(user?.email);
  const showAcademyChrome = pathname.startsWith("/academy");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-wisdom-dark/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={showAcademyChrome ? "/academy" : "/"}
            className="flex items-center gap-2 group min-w-0"
          >
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

          <nav className="hidden md:flex items-center gap-5" aria-label="Main">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                data-active={isActivePath(pathname, link.href) ? "true" : undefined}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              <div className="flex items-center gap-1.5 ml-1">
                <HeaderLibraryLinks />
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      aria-expanded={profileOpen}
                      aria-haspopup="menu"
                      className={`flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 border transition-all ${
                        profileOpen
                          ? "border-wisdom-cyan/50 bg-wisdom-cyan/10"
                          : "border-white/10 hover:border-white/25"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wisdom-cyan to-cyan-700 flex items-center justify-center text-xs font-bold text-wisdom-dark">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-wisdom-muted ${profileOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {profileOpen && (
                      <div
                        className="absolute right-0 top-full mt-2.5 w-[17.5rem] rounded-2xl border border-white/12 bg-[#0a0f1a] shadow-2xl overflow-hidden z-[70]"
                        role="menu"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                          <p className="text-[11px] text-wisdom-muted truncate">{user.email}</p>
                        </div>
                        <div className="py-1.5">
                          <Link
                            href="/learning"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <GraduationCap className="w-4 h-4 text-amber-400" />
                            My Learning
                            <span className="ml-auto text-[10px] font-bold uppercase text-amber-400/80">
                              Academy
                            </span>
                          </Link>
                          <Link
                            href="/dashboard"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-wisdom-cyan" />
                            My Dashboard
                            <span className="ml-auto text-[10px] font-bold uppercase text-wisdom-cyan/80">
                              Digital
                            </span>
                          </Link>
                          <Link
                            href="/cart"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <ShoppingBag className="w-4 h-4 text-wisdom-muted" />
                            Academy cart
                          </Link>
                          <Link
                            href="/business/cart"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <ShoppingBag className="w-4 h-4 text-wisdom-muted" />
                            Business cart
                          </Link>
                          <Link
                            href="/account"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="w-4 h-4 text-wisdom-muted" />
                            My Account
                          </Link>
                          <Link
                            href="/settings"
                            role="menuitem"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4 text-wisdom-muted" />
                            Settings
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              role="menuitem"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-wisdom-cyan hover:bg-wisdom-cyan/10"
                              onClick={() => setProfileOpen(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-white/10 py-1.5">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => void handleLogout()}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 ml-1">
                    <Link href="/login" className="text-sm text-wisdom-muted hover:text-wisdom-cyan">
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium hover:bg-wisdom-cyan-dark"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-1" ref={menuRef}>
            <HeaderLibraryLinks size="lg" onNavigate={() => setIsOpen(false)} />
            <button
              type="button"
              className="p-2 rounded-lg text-wisdom-muted hover:text-white"
              onClick={() => setIsOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {isOpen && (
              <div className="absolute right-4 top-16 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#0a0f1a] shadow-2xl z-[60] overflow-hidden">
                <nav className="py-2 max-h-[70vh] overflow-y-auto">
                  {mainNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/5"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-white/10 px-4 py-3 space-y-1">
                  {user ? (
                    <>
                      <Link
                        href="/learning"
                        className="flex items-center gap-2 text-sm py-1.5"
                        onClick={() => setIsOpen(false)}
                      >
                        <GraduationCap className="w-4 h-4 text-amber-400" /> My Learning
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm py-1.5"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-wisdom-cyan" /> My Dashboard
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 text-sm py-1.5"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-4 h-4" /> Account
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="flex items-center gap-2 text-sm text-red-400 py-1.5 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block text-center text-sm py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="block text-center px-4 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
