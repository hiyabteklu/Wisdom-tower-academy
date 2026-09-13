"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  GraduationCap,
  LogIn,
  Trophy,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
  BadgeCheck,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useInView } from "@/hooks/useInView";
import InfinityCard from "@/components/home/InfinityCard";
import PartnershipPath from "@/components/PartnershipPath";
import SafeCoverImage from "@/components/SafeCoverImage";
import { DIGITAL_URL } from "@/lib/digital-url";
import { supabase, recoverSession } from "@/lib/supabase";
import { packageImages } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

const stats = [
  { value: 30, suffix: "K+", label: "Users", image: "/images/home/stat-users.jpg" },
  { value: 10, suffix: "+", label: "Partners", image: "/images/home/stat-partners.jpg" },
  { value: 70, suffix: "+", label: "Services", image: "/images/home/stat-services.jpg" },
];

const ACADEMY_IMAGE = "/images/home/academy.jpg";
const HERO_BG = "/images/home/hero-bg.jpg";

type ProgramCard = {
  id: string;
  href: string;
  name: string;
  image: string;
  accent: string;
  border: string;
  cta: string;
};

const programs: ProgramCard[] = [
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    cta: "Open",
  },
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    cta: "Open",
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    cta: "Open",
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    cta: "Open",
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    cta: "Open",
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    cta: "Open",
  },
];

const freeResources = [
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "Ethiopian top scorers — scores, journeys, and what stood out",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/12 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,191,36,0.35)]",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Methods to learn faster and retain under pressure",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/12 hover:border-cyan-400/40",
    iconBg: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(34,211,238,0.3)]",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Friends, focus, burnout, lectures, facilities and group work",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/12 hover:border-sky-400/40",
    iconBg: "border-sky-400/30 bg-sky-500/15 text-sky-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(56,189,248,0.3)]",
  },
  {
    href: "/academy/universities",
    name: "Universities Info",
    blurb: "Explore institutions, programs, and pathways",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/12 hover:border-violet-400/40",
    iconBg: "border-violet-400/30 bg-violet-500/15 text-violet-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(167,139,250,0.3)]",
  },
  {
    href: "/academy/departments",
    name: "Department Info",
    blurb: "What each field of study actually involves",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/12 hover:border-orange-400/40",
    iconBg: "border-orange-400/30 bg-orange-500/15 text-orange-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,146,60,0.3)]",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarship Info",
    blurb: "Funding options and how to prepare applications",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/12 hover:border-rose-400/40",
    iconBg: "border-rose-400/30 bg-rose-500/15 text-rose-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(244,63,94,0.3)]",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function CountUp({
  target,
  suffix,
  active,
  duration = 1600,
}: {
  target: number;
  suffix: string;
  active: boolean;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [active, target, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

function StatsSlider({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !visible) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % stats.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduced, visible]);

  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
      {stats.map((stat, i) => {
        const active = reduced ? visible : visible && i === index;
        return (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl border border-white/12 bg-wisdom-navy min-h-[12.5rem] md:min-h-[14rem] transition-all duration-500 ${
              active ? "opacity-100 scale-100" : "opacity-90 scale-[0.99]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stat.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
              <p className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums drop-shadow-md">
                <CountUp target={stat.value} suffix={stat.suffix} active={visible} />
              </p>
              <p className="text-sm font-semibold text-white/90 mt-1 drop-shadow-sm">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const reduced = usePrefersReducedMotion();
  const heroSection = useInView();
  const welcomeSection = useInView();
  const pathwaysSection = useInView();
  const statsSection = useInView();
  const crossSection = useInView();
  const ctaSection = useInView();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const apply = (u: SupabaseUser | null) => {
      if (!cancelled) {
        setUser(u);
        setAuthReady(true);
      }
    };

    (async () => {
      const session = await recoverSession();
      apply(session?.user ?? null);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";

  const isSignedIn = Boolean(user);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24" ref={heroSection.ref}>
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_BG} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-wisdom-dark/80 via-wisdom-dark/90 to-wisdom-dark" />
          <div className="landing-orb landing-orb-a" />
          <div className="landing-orb landing-orb-b" />
          <div className="landing-orb landing-orb-c" />
          <div className="landing-shine-sweep" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl reveal-item ${heroSection.inView ? "is-visible" : ""}`}>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-300/95 mb-4">
              Wisdom Tower Academy
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.1]">
              <span className="hero-word text-white">Wisdom</span>{" "}
              <span className="hero-word hero-word-accent animate-hero-gradient">Tower</span>{" "}
              <span className="hero-word text-white">Academy</span>
            </h1>
            <p className="text-lg sm:text-xl text-wisdom-muted leading-relaxed max-w-xl mb-8">
              Structured pathways for secondary and university learners.
            </p>

            <div className="flex flex-wrap gap-3 items-center min-h-[3.25rem]">
              <Link
                href="/academy"
                className="landing-cta-primary group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 text-wisdom-dark font-bold shadow-lg shadow-cyan-500/30 hover:bg-cyan-300 hover:shadow-cyan-400/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Enter Academy
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {authReady && isSignedIn ? (
                <Link
                  href="/learning"
                  className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white overflow-hidden
                    border-2 border-cyan-400/50 bg-cyan-500/10
                    shadow-[0_0_20px_-6px_rgba(34,211,238,0.35)]
                    hover:bg-cyan-400 hover:text-wisdom-dark hover:border-cyan-300
                    hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.5)]
                    transition-all duration-300 hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">My Learning</span>
                </Link>
              ) : authReady ? (
                <Link
                  href="/login"
                  className="landing-cta-signin group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white overflow-hidden
                    border-2 border-amber-400/70 bg-amber-500/15
                    shadow-[0_0_24px_-4px_rgba(251,191,36,0.45)]
                    hover:bg-amber-500 hover:text-wisdom-dark hover:border-amber-300
                    hover:shadow-[0_0_36px_-2px_rgba(251,191,36,0.65)]
                    transition-all duration-300 hover:-translate-y-0.5"
                >
                  <span className="landing-cta-signin-shine" aria-hidden />
                  <LogIn className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Sign in</span>
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-transparent opacity-0 pointer-events-none select-none"
                  aria-hidden
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </span>
              )}
            </div>

            <p className="mt-4 text-xs text-wisdom-muted/80 min-h-[1.25rem]">
              {authReady && isSignedIn ? (
                <>
                  Welcome back, <span className="text-cyan-300 font-semibold">{displayName}</span>
                  {" · "}
                  <Link
                    href="/learning"
                    className="text-cyan-300/90 underline-offset-2 hover:underline font-medium"
                  >
                    Continue where you left off
                  </Link>
                </>
              ) : authReady ? (
                <>
                  New here?{" "}
                  <Link
                    href="/signup"
                    className="text-cyan-300 underline-offset-2 hover:underline font-semibold"
                  >
                    Create a free account
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      {/* Welcome image only — not a link */}
      <section className="pb-12 md:pb-16 relative" ref={welcomeSection.ref}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/14 bg-wisdom-navy reveal-item ${
              welcomeSection.inView ? "is-visible" : ""
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ACADEMY_IMAGE}
                alt="Welcome to Wisdom Tower Academy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/90 mb-1">
                  Welcome
                </p>
                <span className="font-display text-base sm:text-lg font-semibold text-white/95 drop-shadow-md">
                  Wisdom Tower Academy
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pathways + free resources + partnership (content that lived under Academy / below video) */}
      <section className="pb-16 md:pb-20 relative" ref={pathwaysSection.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center mb-10 md:mb-12 reveal-item ${
              pathwaysSection.inView ? "is-visible" : ""
            }`}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Choose your pathway
            </h2>
            <p className="mt-4 text-wisdom-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Six structured branches, each with its own path when you open it.
            </p>
          </div>

          <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={program.href}
                className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card ${program.border}`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={program.image}
                    alt={program.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8">
                  <h3
                    className={`flex items-center gap-1.5 font-display text-base sm:text-lg font-bold ${program.accent}`}
                  >
                    <BadgeCheck
                      className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-sky-400"
                      aria-label="Verified"
                    />
                    {program.name}
                  </h3>
                  <div
                    className={`mt-2.5 flex items-center gap-1 text-xs sm:text-sm font-semibold ${program.accent}`}
                  >
                    {program.cta}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-20 md:mt-24" id="special-packages">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300/90 mb-3">
                Beyond the six branches
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Special packages
              </h2>
              <p className="text-wisdom-muted max-w-lg mx-auto text-sm leading-relaxed">
                Department tracks by year and semester. Buy each semester separately.
              </p>
            </div>

            <Link
              href="/academy/special-packages"
              className="group block max-w-xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-violet-400/30 bg-wisdom-card hover:border-violet-300/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_-16px_rgba(167,139,250,0.35)]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                <SafeCoverImage src={SPECIAL_PACKAGES_HUB_IMAGE} alt="" />
              </div>
              <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8 text-left">
                <h3 className="flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-white group-hover:text-violet-200 transition-colors">
                  <BadgeCheck className="w-4 h-4 shrink-0 text-sky-400" aria-hidden />
                  Browse special packages
                </h3>
                <span className="mt-2.5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-violet-400/90">
                  Open
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </section>

          <section className="mt-24 md:mt-28">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-3">
                Open library · no enrollment required
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Free resources
              </h2>
              <p className="text-wisdom-muted max-w-lg mx-auto text-base leading-relaxed">
                Guidance beyond the six academic branches: stories, techniques, campus life,
                universities, departments, and scholarships.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {freeResources.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative rounded-2xl border bg-wisdom-card/95 p-6 transition-all duration-400 ease-out hover:-translate-y-1.5 hover:bg-white/[0.04] ${item.border} ${item.glow}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div
                      className={`mb-4 inline-flex p-3 rounded-xl border ${item.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3
                      className={`font-display text-xl mb-2 font-semibold transition-colors ${item.accent}`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm text-wisdom-muted leading-relaxed">{item.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-wisdom-muted group-hover:text-white/90 transition-colors">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-24 md:mt-28" id="partnership">
            <div className="max-w-3xl mx-auto">
              <PartnershipPath />
            </div>
          </section>
        </div>
      </section>

      {/* Stats + infinity */}
      <section className="pb-20 md:pb-28 relative" ref={statsSection.ref}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            <StatsSlider visible={statsSection.inView} reduced={reduced} />
            <div className="lg:col-span-1 flex">
              <div className="w-full min-h-[12.5rem] md:min-h-[14rem] flex">
                <InfinityCard visible={statsSection.inView} delay={270} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 relative" ref={crossSection.ref}>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div
            className={`rounded-2xl border border-white/10 bg-wisdom-card/70 backdrop-blur-sm px-6 py-8 md:px-10 text-center reveal-item ${
              crossSection.inView ? "is-visible" : ""
            }`}
          >
            <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-3">
              Want digital services instead?
            </h2>
            <p className="text-wisdom-muted text-sm md:text-base mb-6 leading-relaxed">
              Design, writing, web, marketing, data and business solutions on our Digital site.
            </p>
            <a
              href={DIGITAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[3rem] px-8 py-3 rounded-xl
                border-2 border-wisdom-cyan/60 bg-wisdom-cyan/10 text-wisdom-cyan font-bold
                hover:bg-wisdom-cyan hover:text-wisdom-dark transition-all"
            >
              Open Wisdom Digital
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="pb-28 relative" ref={ctaSection.ref}>
        <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
          <div className={`reveal-item ${ctaSection.inView ? "is-visible" : ""}`}>
            {authReady && isSignedIn ? (
              <>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                  Pick up where you left off
                </h2>
                <p className="text-wisdom-muted mb-6 max-w-md mx-auto">
                  Your pathways are ready. Jump back into Academy or My Learning.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/academy"
                    className="landing-cta-primary group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-400 text-wisdom-dark font-bold shadow-lg shadow-cyan-500/30 hover:bg-cyan-300 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Enter Academy
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/learning"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-cyan-400/40 text-cyan-200 font-semibold hover:border-cyan-300 hover:bg-cyan-500/10 transition-all"
                  >
                    <GraduationCap className="w-4 h-4" />
                    My Learning
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                  Ready when you are
                </h2>
                <p className="text-wisdom-muted mb-6 max-w-md mx-auto">
                  Create a free account and start with the pathway that fits you.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/signup"
                    className="landing-cta-primary group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-400 text-wisdom-dark font-bold shadow-lg shadow-cyan-500/30 hover:bg-cyan-300 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:border-amber-400/50 hover:bg-amber-500/10 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
