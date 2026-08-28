"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LogOut,
  Shield,
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
  Bell,
  Settings,
  CheckCheck,
  FileText,
  MessageSquare,
  Sparkles,
  ShoppingBag,
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

const academyMenuLinks = [
  { href: "/academy/faq", label: "FAQ", icon: HelpCircle },
  { href: "/academy/success-stories", label: "Success Stories", icon: Trophy },
  { href: "/academy/study-techniques", label: "Study Techniques", icon: BookOpen },
  { href: "/academy/campus-life", label: "Campus Life", icon: Trees },
  { href: "/academy/universities", label: "Universities", icon: Building2 },
  { href: "/academy/departments", label: "Departments", icon: Library },
  { href: "/academy/scholarships", label: "Scholarships", icon: GraduationCap },
];

type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  href: string;
  read: boolean;
  kind: "system" | "application" | "message" | "admin";
};

const DEMO_NOTIFS: Notif[] = [
  {
    id: "1",
    title: "Application received",
    body: "Your Digital Services interest form is in review.",
    time: "2h ago",
    href: "/account",
    read: false,
    kind: "application",
  },
  {
    id: "2",
    title: "New message",
    body: "Team replied on your portfolio feedback thread.",
    time: "Yesterday",
    href: "/account",
    read: false,
    kind: "message",
  },
  {
    id: "3",
    title: "Path update",
    body: "Assess stage is next — open Your path when ready.",
    time: "2d ago",
    href: "/digital",
    read: true,
    kind: "system",
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NotifIcon({ kind }: { kind: Notif["kind"] }) {
  if (kind === "application") return <FileText className="w-4 h-4 text-sky-400" />;
  if (kind === "message") return <MessageSquare className="w-4 h-4 text-emerald-400" />;
  if (kind === "admin") return <Shield className="w-4 h-4 text-wisdom-cyan" />;
  return <Sparkles className="w-4 h-4 text-amber-400" />;
}

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [academyMenuOpen, setAcademyMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(DEMO_NOTIFS);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "in" | "out"; msg: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

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
    setNotifOpen(false);
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
    if (!profileOpen && !notifOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (profileOpen && profileRef.current && !profileRef.current.contains(t)) {
        setProfileOpen(false);
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(t)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen, notifOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    setAcademyMenuOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const isAdmin = isAdminEmail(user?.email);
  const onAcademyRoute = pathname.startsWith("/academy");
  const showAcademyChrome = onAcademyRoute;

  const Avatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const dim = size === "lg" ? "w-11 h-11 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
    return (
      <div
        className={`${dim} rounded-full overflow-hidden bg-gradient-to-br from-wisdom-cyan to-cyan-700 flex items-center justify-center font-bold text-wisdom-dark border border-white/15 shrink-0`}
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

  const NotifPanel = () => (
    <div
      className="mobile-menu-panel fixed z-[70] top-[4.25rem] right-3 left-3
        sm:left-auto sm:right-3 sm:w-[22rem]
        md:absolute md:left-auto md:right-0 md:top-full md:mt-2.5 md:w-[22rem] md:max-w-none
        rounded-2xl border border-white/12 bg-[#0a0f1a] shadow-2xl shadow-black/70 overflow-hidden"
      role="menu"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Notifications</p>
          <p className="text-[11px] text-wisdom-muted">
            {unread ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1 shrink-0 text-[11px] font-semibold text-wisdom-cyan hover:text-cyan-300 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[min(22rem,55vh)] overflow-y-auto overscroll-contain">
        {notifs.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-wisdom-muted">No notifications yet</p>
          </div>
        ) : (
          notifs.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              role="menuitem"
              onClick={() => {
                markRead(n.id);
                setNotifOpen(false);
              }}
              className={`flex gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.04] ${
                n.read ? "opacity-70" : "bg-wisdom-cyan/[0.04]"
              }`}
            >
              <div className="mt-0.5 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <NotifIcon kind={n.kind} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm leading-snug ${n.read ? "text-white/80" : "text-white font-semibold"}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-wisdom-cyan shrink-0" />
                  )}
                </div>
                <p className="text-xs text-wisdom-muted mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-white/35 mt-1.5">{n.time}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-2.5 bg-[#050810]">
        <Link
          href="/account"
          onClick={() => setNotifOpen(false)}
          className="block text-center text-xs font-semibold text-wisdom-cyan hover:text-cyan-300 py-1"
        >
          View all activity
        </Link>
      </div>
    </div>
  );

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

              {!loading && (
                <div className="flex items-center gap-1.5 ml-1">
                  <HeaderLibraryLinks />

                  {user ? (
                    <>
                      <div className="relative" ref={notifRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifOpen((v) => !v);
                            setProfileOpen(false);
                          }}
                          aria-expanded={notifOpen}
                          aria-label={unread ? `${unread} unread notifications` : "Notifications"}
                          className={`relative p-2 rounded-full border transition-all duration-200 ${
                            notifOpen
                              ? "border-wisdom-cyan/40 bg-wisdom-cyan/10 text-wisdom-cyan"
                              : "border-transparent text-wisdom-muted hover:text-white hover:bg-white/5 hover:border-white/10"
                          }`}
                        >
                          <Bell className="w-[18px] h-[18px]" />
                          {unread > 0 && (
                            <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-wisdom-cyan text-[9px] font-bold text-wisdom-dark flex items-center justify-center leading-none ring-2 ring-wisdom-dark">
                              {unread > 9 ? "9+" : unread}
                            </span>
                          )}
                        </button>
                        {notifOpen && <NotifPanel />}
                      </div>

                      <div className="relative" ref={profileRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen((v) => !v);
                            setNotifOpen(false);
                          }}
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
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="py-1.5">
                              <Link
                                href="/learning"
                                role="menuitem"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                                onClick={() => setProfileOpen(false)}
                              >
                                <BookOpen className="w-4 h-4 text-wisdom-muted" />
                                My Learning
                              </Link>
                              <Link
                                href="/cart"
                                role="menuitem"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                                onClick={() => setProfileOpen(false)}
                              >
                                <ShoppingBag className="w-4 h-4 text-wisdom-muted" />
                                Cart
                              </Link>
                              <Link
                                href="/account"
                                role="menuitem"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                                onClick={() => setProfileOpen(false)}
                              >
                                <User className="w-4 h-4 text-wisdom-muted" />
                                My Account
                              </Link>
                              <Link
                                href="/settings"
                                role="menuitem"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                                onClick={() => setProfileOpen(false)}
                              >
                                <Settings className="w-4 h-4 text-wisdom-muted" />
                                Settings
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
                                href="/academy"
                                role="menuitem"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                                onClick={() => setProfileOpen(false)}
                              >
                                <GraduationCap className="w-4 h-4 text-wisdom-muted" />
                                Academy
                              </Link>
                              <Link
                                href="/digital"
                                role="menuitem"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-wisdom-cyan transition-colors"
                                onClick={() => setProfileOpen(false)}
                              >
                                <Monitor className="w-4 h-4 text-wisdom-muted" />
                                Digital Services
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
                    </>
                  ) : (
                    <div className="flex items-center gap-3 ml-1">
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
                  )}
                </div>
              )}
            </nav>

            <div className="md:hidden flex items-center gap-0.5">
              <HeaderLibraryLinks size="lg" onNavigate={() => setIsOpen(false)} />

              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen((v) => !v);
                      setIsOpen(false);
                    }}
                    aria-label={unread ? `${unread} unread notifications` : "Notifications"}
                    className={`relative p-2 rounded-lg transition-colors ${
                      notifOpen ? "text-wisdom-cyan bg-wisdom-cyan/10" : "text-wisdom-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Bell size={22} />
                    {unread > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-wisdom-cyan ring-2 ring-wisdom-dark" />
                    )}
                  </button>
                  {notifOpen && <NotifPanel />}
                </div>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="p-2 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/5"
                  onClick={() => {
                    setIsOpen((v) => !v);
                    setNotifOpen(false);
                  }}
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
                            href="/learning"
                            className="flex items-center gap-2 text-sm text-white/85 hover:text-wisdom-cyan py-1.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <BookOpen className="w-4 h-4" />
                            My Learning
                          </Link>
                          <Link
                            href="/cart"
                            className="flex items-center gap-2 text-sm text-white/85 hover:text-wisdom-cyan py-1.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Cart
                          </Link>
                          <Link
                            href="/account"
                            className="flex items-center gap-2 text-sm text-white/85 hover:text-wisdom-cyan py-1.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            My Account
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 text-sm text-white/85 hover:text-wisdom-cyan py-1.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
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
