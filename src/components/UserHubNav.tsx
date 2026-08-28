"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  Building2,
  User,
  GraduationCap,
  Monitor,
} from "lucide-react";

const hubs = [
  {
    id: "learning",
    href: "/learning",
    label: "My Learning",
    short: "Academy",
    icon: GraduationCap,
    match: (p: string) => p.startsWith("/learning") || p.startsWith("/packages"),
  },
  {
    id: "digital",
    href: "/dashboard",
    label: "My Dashboard",
    short: "Digital",
    icon: Monitor,
    match: (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/business") ||
      p === "/cart" && false,
  },
] as const;

const quick = [
  { href: "/cart", label: "Academy cart", icon: ShoppingBag },
  { href: "/business/cart", label: "Business cart", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: User },
  { href: "/business/register", label: "Register business", icon: Building2 },
];

export default function UserHubNav() {
  const pathname = usePathname() || "/";

  const onDigital =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/business") ||
    pathname.startsWith("/account");
  const onLearning = pathname.startsWith("/learning") || pathname.startsWith("/packages");

  return (
    <div className="mb-8 space-y-4">
      <div
        className="flex p-1.5 rounded-2xl border border-white/12 bg-wisdom-dark/60 backdrop-blur-sm"
        role="tablist"
        aria-label="Switch between Academy learning and Digital dashboard"
      >
        <Link
          href="/learning"
          role="tab"
          aria-selected={onLearning}
          className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[3rem] px-4 rounded-xl text-sm font-bold transition ${
            onLearning
              ? "bg-amber-500 text-wisdom-dark shadow-lg shadow-amber-500/25"
              : "text-wisdom-muted hover:text-white hover:bg-white/5"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span className="hidden sm:inline">My Learning</span>
          <span className="sm:hidden">Learning</span>
        </Link>
        <Link
          href="/dashboard"
          role="tab"
          aria-selected={onDigital && !pathname.startsWith("/account")}
          className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[3rem] px-4 rounded-xl text-sm font-bold transition ${
            pathname.startsWith("/dashboard") || pathname.startsWith("/business")
              ? "bg-wisdom-cyan text-wisdom-dark shadow-lg shadow-cyan-500/25"
              : "text-wisdom-muted hover:text-white hover:bg-white/5"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="hidden sm:inline">My Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </Link>
      </div>

      <nav
        className="flex flex-wrap gap-2"
        aria-label="Quick links"
      >
        {quick.map((q) => {
          const active = pathname === q.href || pathname.startsWith(q.href + "/");
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className={`inline-flex items-center gap-2 min-h-[2.75rem] px-3.5 rounded-xl text-sm font-semibold border transition ${
                active
                  ? "border-wisdom-cyan/40 bg-wisdom-cyan/10 text-wisdom-cyan"
                  : "border-white/10 bg-white/[0.03] text-wisdom-muted hover:text-white hover:border-white/20"
              }`}
            >
              <Icon className="w-4 h-4" />
              {q.label}
            </Link>
          );
        })}
        <Link
          href="/learning"
          className="inline-flex items-center gap-2 min-h-[2.75rem] px-3.5 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.03] text-wisdom-muted hover:text-white hover:border-white/20 sm:hidden"
        >
          <BookOpen className="w-4 h-4" />
          Learning
        </Link>
      </nav>
    </div>
  );
}
