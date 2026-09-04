"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock, ExternalLink, Gift, Lock } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import InfinityCard from "@/components/home/InfinityCard";

const stats = [
  { value: 30, suffix: "K+", label: "Users", image: "/images/home/stat-users.jpg" },
  { value: 10, suffix: "+", label: "Partners", image: "/images/home/stat-partners.jpg" },
  { value: 70, suffix: "+", label: "Services", image: "/images/home/stat-services.jpg" },
];

const ACADEMY_IMAGE = "/images/home/academy.jpg";
const HERO_BG = "/images/home/hero-bg.jpg";
const FRESHMAN_IMAGE = "/images/packages/freshman_00241b.jpeg";
const ECE_SEM1_IMAGE = "/images/special-packages/ece-sem-1.jpg";
const DIGITAL_URL =
  process.env.NEXT_PUBLIC_DIGITAL_URL?.replace(/\/$/, "") ||
  "https://wisdomtower.tech";

const previewCards = [
  {
    href: "/academy/special-packages/electrical-computer-engineering/sem-1",
    image: ECE_SEM1_IMAGE,
    badge: "Special package",
    title: "ECE · Semester 1",
    blurb: "Year 3 Electrical & Computer Engineering — free for registered students.",
    cta: "Open Semester 1",
    accent: "text-violet-300",
    borderHover: "hover:border-violet-400/45",
    badgeClass: "border-violet-400/35 bg-violet-500/15 text-violet-200",
    ctaClass: "bg-violet-500 text-white shadow-violet-500/30 group-hover:shadow-violet-400/40",
    locked: false,
  },
  {
    href: "/academy/freshman",
    image: FRESHMAN_IMAGE,
    badge: "Pathway",
    title: "Freshman courses",
    blurb: "First-year subjects and learning hubs — opens tomorrow.",
    cta: "Opening tomorrow",
    accent: "text-purple-300",
    borderHover: "hover:border-purple-400/30",
    badgeClass: "border-amber-400/40 bg-amber-500/15 text-amber-200",
    ctaClass: "bg-white/10 text-amber-100 border border-amber-400/30",
    locked: true,
  },
] as const;

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
            className={`relative overflow-hidden rounded-2xl border border-white/12 bg-wisdom-card min-h-[12.5rem] md:min-h-[14rem] transition-all duration-500 ${
              active ? "opacity-100 scale-100" : "opacity-70 scale-[0.98]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stat.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wisdom-dark via-wisdom-dark/70 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
              <p className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums">
                <CountUp target={stat.value} suffix={stat.suffix} active={visible} />
              </p>
              <p className="text-sm font-semibold text-wisdom-muted mt-1">{stat.label}</p>
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
  const academySection = useInView();
  const previewSection = useInView();
  const statsSection = useInView();
  const crossSection = useInView();
  const ctaSection = useInView();

  return (
    <div className="relative">
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24" ref={heroSection.ref}>
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_BG} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-wisdom-dark/80 via-wisdom-dark/90 to-wisdom-dark" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`max-w-3xl reveal-item ${
              heroSection.inView ? "is-visible" : ""
            }`}
          >
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-cyan-300/90 mb-4">
              Wisdom Tower Academy
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.1]">
              <span className="hero-word text-white">Wisdom</span>{" "}
              <span className="hero-word hero-word-accent animate-hero-gradient">Tower</span>{" "}
              <span className="hero-word text-white">Academy</span>
            </h1>
            <p className="text-lg sm:text-xl text-wisdom-muted leading-relaxed max-w-xl mb-8">
              Empowering minds through education — Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-wisdom-dark font-bold hover:bg-cyan-300 transition-colors"
              >
                Enter Academy
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:border-white/40 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16 relative" ref={academySection.ref}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/academy"
            className={`card-3d card-elevated group relative block overflow-hidden rounded-2xl sm:rounded-3xl border border-white/14 bg-wisdom-card hover:border-cyan-400/40 transition-all duration-300 reveal-item ${
              academySection.inView ? "is-visible" : ""
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ACADEMY_IMAGE}
                alt="Wisdom Tower Academy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-wisdom-dark/85 via-wisdom-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                  Wisdom Tower Academy
                </h2>
                <p className="text-sm sm:text-base text-white/80 max-w-lg mb-4">
                  Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-wisdom-dark text-sm font-bold">
                  Explore Academy
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Limited time preview — ECE Sem 1 + Freshman */}
      <section className="pb-16 md:pb-20 relative" ref={previewSection.ref}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[18rem] rounded-full bg-amber-500/10 blur-3xl preview-glow" />
          <div className="absolute top-1/3 right-[15%] w-40 h-40 rounded-full bg-violet-500/15 blur-2xl preview-glow-delayed" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center mb-8 md:mb-10 reveal-item ${
              previewSection.inView ? "is-visible" : ""
            }`}
          >
            <div className="inline-flex items-center justify-center gap-2 mb-3">
              <span className="preview-badge-pulse inline-flex h-2 w-2 rounded-full bg-amber-400" />
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.28em] text-amber-300/95">
                Limited time
              </p>
              <span
                className="preview-badge-pulse inline-flex h-2 w-2 rounded-full bg-amber-400"
                style={{ animationDelay: "0.6s" }}
              />
            </div>
            <h2 className="preview-title font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              <span className="preview-title-gradient">Limited time preview</span>
            </h2>
            <p className="mt-3 text-sm md:text-base text-wisdom-muted max-w-lg mx-auto leading-relaxed">
              ECE Semester 1 is open for registered students. Freshman courses open tomorrow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 perspective-scene">
            {previewCards.map((card, idx) => {
              const inner = (
                <>
                  <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={card.title}
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
                        card.locked ? "scale-100 saturate-[0.85]" : "group-hover:scale-[1.04]"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wisdom-dark/80 via-transparent to-transparent" />
                    {card.locked && (
                      <div className="absolute inset-0 bg-wisdom-dark/45 backdrop-blur-[1px]" />
                    )}
                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${card.badgeClass}`}
                    >
                      {card.locked ? <Clock className="w-3 h-3" /> : <Gift className="w-3 h-3" />}
                      {card.locked ? "Opening tomorrow" : card.badge}
                    </span>
                    {card.locked && (
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="p-5 sm:p-6 border-t border-white/8">
                    <h3
                      className={`font-display text-xl sm:text-2xl font-bold mb-1.5 text-white ${card.accent}`}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm text-wisdom-muted mb-4 leading-relaxed">{card.blurb}</p>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 ${card.ctaClass} ${
                        card.locked ? "" : "group-hover:scale-[1.03]"
                      }`}
                    >
                      {card.cta}
                      {!card.locked && (
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      )}
                    </span>
                  </div>
                </>
              );

              const shellClass = `card-3d card-elevated group relative block overflow-hidden rounded-2xl sm:rounded-3xl border border-white/14 bg-wisdom-card ${card.borderHover} transition-all duration-300 reveal-item ${
                previewSection.inView ? "is-visible" : ""
              } ${card.locked ? "cursor-not-allowed" : ""}`;

              const style = {
                transitionDelay: previewSection.inView ? `${120 + idx * 100}ms` : undefined,
              };

              if (card.locked) {
                return (
                  <div key={card.href} className={shellClass} style={style} aria-disabled="true">
                    {inner}
                  </div>
                );
              }

              return (
                <Link key={card.href} href={card.href} className={shellClass} style={style}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 relative" ref={statsSection.ref}>
        <div className="depth-well depth-well-soft" aria-hidden />
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
              Design, writing, web, marketing, data & business solutions on our Digital site.
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
          <div
            className={`reveal-item ${
              ctaSection.inView ? "is-visible" : ""
            }`}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
              Ready when you are
            </h2>
            <p className="text-wisdom-muted mb-6 max-w-md mx-auto">
              Create a free account and start with the pathways that are open today.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-400 text-wisdom-dark font-bold hover:bg-cyan-300 transition-colors"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
