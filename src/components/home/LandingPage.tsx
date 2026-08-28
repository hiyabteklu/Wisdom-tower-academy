"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import InfinityCard from "@/components/home/InfinityCard";

const stats = [
  { value: 30, suffix: "K+", label: "Users" },
  { value: 10, suffix: "+", label: "Partners" },
  { value: 70, suffix: "+", label: "Services" },
];

/** public/images/home/ — 16:9 covers for the two path cards */
const PATH_IMAGES = {
  academy: "/images/home/academy.jpg",
  digital: "/images/home/digital.jpg",
} as const;

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

function TiltCard({
  children,
  href,
  className = "",
  delay = 0,
  visible,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  delay?: number;
  visible: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (reduced) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 14;
      const rotX = (0.5 - y) * 10;
      el.style.transform = `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-14px) translateZ(24px) scale(1.02)`;
    },
    [reduced]
  );

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
  }, []);

  return (
    <Link
      ref={cardRef}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`card-3d card-elevated card-tilt group relative overflow-hidden rounded-3xl border border-white/14 bg-wisdom-card reveal-item ${
        visible ? "is-visible" : ""
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </Link>
  );
}

export default function LandingPage() {
  const reduced = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.4 });
  const [loaded, setLoaded] = useState(false);

  const cardsSection = useInView({ threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  const statsSection = useInView({ threshold: 0.25, rootMargin: "0px 0px -40px 0px" });
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
        <div className="absolute inset-0 bg-gradient-to-b from-wisdom-cyan/[0.07] via-transparent to-transparent" />
        <div className="hero-grain" aria-hidden />

        <div
          className="absolute top-16 left-[12%] w-80 h-80 bg-wisdom-cyan/14 rounded-full blur-3xl pointer-events-none orb-float"
          style={blob1}
        />
        <div
          className="absolute bottom-8 right-[10%] w-72 h-72 bg-purple-500/14 rounded-full blur-3xl pointer-events-none orb-float-delayed"
          style={blob2}
        />
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-wisdom-cyan/10 rounded-full blur-2xl pointer-events-none orb-pulse" />

        <div className="hero-mesh" aria-hidden />

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative z-10 ${loaded ? "hero-loaded" : "hero-loading"}`}
        >
          <p className="hero-eyebrow text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-wisdom-cyan/90 mb-5 drop-shadow-sm">
            Education · Digital · Excellence
          </p>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 text-depth-title">
            <span className="hero-word inline-block text-white">Wisdom</span>{" "}
            <span className="hero-word hero-word-accent inline-block text-wisdom-cyan relative">
              Tower
              <span className="hero-shine" aria-hidden />
            </span>
          </h1>

          <p className="hero-sub text-lg md:text-xl text-wisdom-muted max-w-2xl mx-auto mb-3 leading-relaxed">
            Empowering minds through education and elevating ideas through digital excellence.
          </p>
          <p className="hero-sub-2 text-base text-wisdom-muted/80 max-w-xl mx-auto mb-8">
            Choose your path below and start building your future.
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
              href="/digital"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/25 text-white font-semibold
                bg-white/[0.04] backdrop-blur-sm
                hover:border-wisdom-cyan/50 hover:bg-white/8 hover:scale-105 active:scale-100 transition-all duration-300 shadow-lg shadow-black/30"
            >
              Digital Services
            </Link>
          </div>
        </div>
      </section>

      {/* Path cards — 16:9, no gradient overlay, solid 3D Explore CTAs */}
      <section className="pb-16 md:pb-24 relative" ref={cardsSection.ref}>
        <div className="depth-well" aria-hidden />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 perspective-scene relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            <TiltCard href="/academy" visible={cardsSection.inView} delay={0}>
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PATH_IMAGES.academy}
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
            </TiltCard>

            <TiltCard href="/digital" visible={cardsSection.inView} delay={120}>
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={PATH_IMAGES.digital}
                  alt="Wisdom Tower Digital"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-6 md:p-7 border-t border-white/8">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-wisdom-cyan transition-colors">
                  Wisdom Tower Digital
                </h2>
                <p className="text-sm md:text-base text-wisdom-muted mb-5 leading-relaxed">
                  Design, writing, web, marketing, data & business services.
                </p>
                <span
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-bold
                    shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/40 group-hover:scale-[1.03] transition-all duration-300"
                >
                  Explore Digital
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 relative" ref={statsSection.ref}>
        <div className="depth-well depth-well-soft" aria-hidden />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`stat-card stat-card-solid card-elevated group relative overflow-hidden rounded-2xl border border-white/14 bg-wisdom-card p-6 md:p-8 text-center reveal-item ${
                  statsSection.inView ? "is-visible" : ""
                }`}
                style={{ transitionDelay: statsSection.inView ? `${i * 90}ms` : undefined }}
              >
                <div className="relative">
                  <div className="stat-value font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 group-hover:text-wisdom-cyan transition-colors duration-300">
                    <CountUp
                      target={stat.value}
                      suffix={stat.suffix}
                      active={statsSection.inView}
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-wisdom-muted font-semibold uppercase tracking-[0.15em]">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}

            <InfinityCard visible={statsSection.inView} delay={270} />
          </div>
        </div>
      </section>

      <section className="pb-28 relative" ref={ctaSection.ref}>
        <div
          className={`max-w-3xl mx-auto px-4 text-center relative z-10 reveal-item ${ctaSection.inView ? "is-visible" : ""}`}
        >
          <div className="cta-panel rounded-3xl border border-white/12 bg-wisdom-card/80 backdrop-blur-md px-6 py-10 md:px-12 md:py-12 card-elevated">
            <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">Not sure where to start?</h2>
            <p className="text-wisdom-muted mb-9 text-lg">
              Tell us your goal and we'll guide you to the right path.
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
