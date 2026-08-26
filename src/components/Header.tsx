"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
  };

  return (
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

          <nav className="hidden md:flex items-center gap-8">
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-wisdom-muted">
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-wisdom-muted hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
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
                  <div className="text-sm text-wisdom-muted">
                    {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-wisdom-muted hover:text-white"
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
  );
}
