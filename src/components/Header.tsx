"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User, Shield, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/academy", label: "Academy" },
  { href: "/digital", label: "Digital" },
  { href: "/services", label: "All Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "in" | "out"; msg: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const isAdmin = isAdminEmail(user?.email);

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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark flex items-center justify-center font-bold text-wisdom-dark text-sm">
                WT
              </div>
              <span className="font-semibold text-lg tracking-tight group-hover:text-wisdom-cyan transition-colors">
                Wisdom Tower
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {!loading && (
                user ? (
                  <div className="flex items-center gap-2 ml-2">
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
                    <Link
                      href="/login"
                      className="text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 rounded-lg bg-wisdom-cyan text-wisdom-dark text-sm font-medium hover:bg-wisdom-cyan-dark transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </nav>

            <button
              className="md:hidden p-2 text-wisdom-muted hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-wisdom-navy border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-wisdom-muted hover:text-wisdom-cyan transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

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
                    <Link
                      href="/account"
                      className="flex items-center gap-2 text-wisdom-muted hover:text-wisdom-cyan"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-wisdom-cyan"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-wisdom-muted hover:text-wisdom-cyan"
                      onClick={() => setIsOpen(false)}
                    >
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
