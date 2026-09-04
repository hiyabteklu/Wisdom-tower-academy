"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import InfinityCard from "@/components/home/InfinityCard";

const stats = [
  { value: 30, suffix: "K+", label: "Users", image: "/images/home/stat-users.jpg" },
  { value: 10, suffix: "+", label: "Partners", image: "/images/home/stat-partners.jpg" },
  { value: 70, suffix: "+", label: "Services", image: "/images/home/stat-services.jpg" },
];

const ACADEMY_IMAGE = "/images/home/academy.jpg";
const HERO_BG = "/images/home/hero-bg.jpg";
const DIGITAL_URL =
  process.env.NEXT_PUBLIC_DIGITAL_URL?.replace(/\/$/, "") ||
  "https://wisdomtower.tech";

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
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setDisplay(target);
      return;
    }

    let start: number | null = null;
    let frame: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration, reduced]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

function StatsSlider({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  const [index, setIndex] = useState(0);
  const n = stats.length;

  useEffect(() => {
    if (reduced || !visible) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reduced, visible, n]);

  return (
    <div className="relative col-span-2 lg:col-span-3">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: `${n * 100}%`,
            transform: reduced ? undefined : `translateX(-${(index * 100) / n}%)`,
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="px-1.5 sm:px-2"
              style={{ width: `${100 / n}%` }}
            >
              <div
                className={`stat-card stat-card-image card-elevated group relative overflow-hidden rounded-2xl border border-white/14 bg-wisdom-card text-center reveal-item h-full ${
                  visible ? "is-visible" : ""
                }`}
                style={{ transitionDelay: visible ? `${i * 90}ms` : undefined }}
              >
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stat.image}
                    alt=""
                    className="h-full w-full object-cover object-center opacity-70 group-hover:opacity-80 transition-opacity duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                <div className="relative z-10 px-6 py-10 sm:py-12 md:py-14 min-h-[12.5rem] md:min-h-[14rem] flex flex-col items-center justify-center">
                  <div
                    className="stat-value font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 group-hover:text-wisdom-cyan transition-colors duration-300"
                    style={{
                      textShadow:
                        "0 1px 2px rgba(0,0,0,0.85), 0 2px 12px rgba(0,0,0,0.55), 0 0 24px rgba(0,0,0,0.35)",
                    }}
                  >
                    <CountUp target={stat.value} suffix={stat.suffix} active={visible} />
                  </div>
                  <div
                    className="text-xs sm:text-sm text-white/90 font-semibold uppercase tracking-[0.15em]"
                    style={{
                      textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.5)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!reduced && (
        <div className="flex justify-center gap-2 mt-4">
          {stats.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show stat ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-wisdom-cyan" : "w-1.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const reduced = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.4 });
  const [loaded, setLoaded] = useState(false);

  const pathSection = useInView({ threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  const statsSection = useInView({ threshold: 0.25, rootMargin: "0px 0px -40px 0px" });
  const crossSection = useInView({ threshold: 0.2, rootMargin: "0px 0px -40px 0px" });
  const ctaSection = useInView({ threshold: 0.3, rootMargin: "0px 0px -40px 0px" });

  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  const blob1 = {
    transform: reduced
      ? undefined
      : `translate(${(mouse.x - 0.5) * 28}px, ${(mouse.y - 0.5) * 20}px)`,
  };
  const blob2 = {
    transform: reduced
      ? undefined
      : `translate(${(mouse.x - 0.5) * -36}px, ${(mouse.y - 0.5) * -24}px)`,
  };

  return (
    <div className="landing-depth">
      <section ref={heroRef} className="relative overflow-hidden hero-scene">
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_BG}
            alt=""
            className="h-full w-full object-cover object-center opacity-[0.22] scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070c16]/70 via-[#070c16]/45 to-[#070c16]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070c16]/40 via-transparent to-[#070c16]/40" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-wisdom-cyan/[0.07] via-transparent to-transparent z-[1]" />
        <div className="hero-grain z-[1]" aria-hidden />

        <div
          className="absolute top-16 left-[12%] w-80 h-80 bg-wisdom-cyan/14 rounded-full blur-3xl pointer-events-none orb-float z-[1]"
          style={blob1}
        />
        <div
          className="absolute bottom-8 right-[10%] w-72 h-72 bg-purple-500/14 rounded-full blur-3xl pointer-events-none orb-float-delayed z-[1]"
          style={blob2}
        />
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-wisdom-cyan/10 rounded-full blur-2xl pointer-events-none orb-pulse z-[1]" />

        <div className="hero-mesh z-[1]" aria-hidden />

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative z-10 ${
            loaded ? "hero-loaded" : "hero-loading"
          }`}
        >
          <p className="hero-eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-wisdom-cyan/90 mb-5 drop-shadow-sm">
            Education · Excellence
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-depth-title">
            <span className="hero-word inline-block bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Wisdom
            </span>{" "}
            <span className="hero-word hero-word-accent inline-block relative bg-gradient-to-r from-cyan-300 via-amber-300 to-orange-400 bg-clip-text text-transparent animate-hero-gradient">
              Tower
            </span>{" "}
            <span className="hero-word inline-block bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Academy
            </span>
          </h1>

          <p className="hero-sub text-lg md:text-xl text-wisdom-muted max-w-2xl mx-auto mb-3 leading-relaxed">
            Empowering minds through education — Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam.
          </p>
          <p className="hero-sub-2 text-base text-wisdom-muted/80 max-w-xl mx-auto mb-8">
            Choose your pathway and start building your future.
          </p>

          <div className="hero-cta flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold
                hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-105 active:scale-100 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Explore Academy
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-semibold
                bg-white/[0.04] backdrop-blur-sm
                hover:border-wisdom-cyan/50 hover:bg-white/8 hover:scale-105 active:scale-100 transition-all duration-300 shadow-lg shadow-black/30"
            >
              View packages
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-20 relative" ref={pathSection.ref}>
        <div className="depth-well" aria-hidden />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 perspective-scene relative z-10">
          <Link
            href="/academy"
            className={`card-3d card-elevated group relative block overflow-hidden rounded-3xl border border-white/14 bg-wisdom-card reveal-item ${
              pathSection.inView ? "is-visible" : ""
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ACADEMY_IMAGE}
                alt="Wisdom Tower Academy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-6 md:p-7 border-t border-white/8">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-wisdom-cyan transition-colors">
                Wisdom Tower Academy
              </h2>
              <p className="text-sm md:text-base text-wisdom-muted mb-5 leading-relaxed">
                Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways.
              </p>
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold
                  shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/40 group-hover:scale-[1.03] transition-all duration-300"
              >
                Explore Academy
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
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
        <div
          className={`max-w-3xl mx-auto px-4 text-center relative z-10 reveal-item ${
            ctaSection.inView ? "is-visible" : ""
          }`}
        >
          <div className="cta-panel rounded-3xl border border-white/12 bg-wisdom-card/80 backdrop-blur-md px-6 py-10 md:px-12 md:py-12 card-elevated">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">Not sure where to start?</h2>
            <p className="text-wisdom-muted mb-9 text-lg">
              Tell us your goal and we'll guide you to the right pathway.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-wisdom-cyan text-wisdom-dark font-semibold text-lg
                hover:bg-wisdom-cyan-dark hover:shadow-glow hover:scale-105 active:scale-100 transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              Let's Build Together
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
