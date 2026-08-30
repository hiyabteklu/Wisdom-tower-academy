"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink, GraduationCap } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const ACADEMY_IMAGE = "/images/home/academy.jpg";
const HERO_BG = "/images/home/hero-bg.jpg";
const DIGITAL_URL =
  process.env.NEXT_PUBLIC_DIGITAL_URL?.replace(/\/$/, "") ||
  "https://wisdom-tower-digital.vercel.app";

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

export default function LandingPage() {
  const reduced = usePrefersReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.4 });
  const [loaded, setLoaded] = useState(false);
  const pathSection = useInView({ threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  const crossSection = useInView({ threshold: 0.2, rootMargin: "0px 0px -40px 0px" });

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
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.06] via-transparent to-transparent z-[1]" />
        <div className="hero-grain z-[1]" aria-hidden />
        <div
          className="absolute top-16 left-[12%] w-80 h-80 bg-amber-500/12 rounded-full blur-3xl pointer-events-none z-[1]"
          style={blob1}
        />
        <div
          className="absolute bottom-8 right-[10%] w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none z-[1]"
          style={blob2}
        />

        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative z-10 ${
            loaded ? "hero-loaded" : "hero-loading"
          }`}
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-amber-300/90 mb-5">
            Wisdom Tower Academy
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5">
            <span className="text-white">Learn. Practice.</span>{" "}
            <span className="text-amber-300">Succeed.</span>
          </h1>
          <p className="text-lg md:text-xl text-wisdom-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways — packages, quizzes, and My
            Learning in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 text-wisdom-dark font-bold text-base
                hover:bg-amber-400 hover:scale-105 active:scale-100 transition-all shadow-lg shadow-amber-500/25"
            >
              Explore pathways
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/25 text-white font-semibold
                bg-white/[0.04] hover:border-amber-400/40 hover:bg-white/8 transition-all"
            >
              View packages
            </Link>
          </div>
        </div>
      </section>

      {/* Main Academy message — single 16:9 banner */}
      <section className="pb-12 md:pb-16 relative" ref={pathSection.ref}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/academy"
            className={`group block overflow-hidden rounded-3xl border border-white/14 bg-wisdom-card card-elevated reveal-item ${
              pathSection.inView ? "is-visible" : ""
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ACADEMY_IMAGE}
                alt="Wisdom Tower Academy pathways"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070c16]/90 via-[#070c16]/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-left">
                <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-semibold mb-2">
                  <GraduationCap className="w-4 h-4" />
                  Education pathways
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                  Wisdom Tower Academy
                </h2>
                <p className="text-wisdom-muted text-sm md:text-base max-w-xl mb-4">
                  Structured paths for high school, freshman, and national exams — start where you
                  are.
                </p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold">
                  Open Academy
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Secondary: Digital only as accessibility link — not a competing banner */}
      <section className="pb-20 md:pb-28 relative" ref={crossSection.ref}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`rounded-2xl border border-white/10 bg-wisdom-card/70 backdrop-blur-sm px-6 py-8 md:px-10 md:py-10 text-center reveal-item ${
              crossSection.inView ? "is-visible" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-wisdom-cyan/90 mb-3">
              Also from Wisdom Tower
            </p>
            <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-3">
              Want digital services instead?
            </h2>
            <p className="text-wisdom-muted text-sm md:text-base mb-6 leading-relaxed max-w-lg mx-auto">
              Design, writing, web, marketing, data & business solutions live on our Digital site —
              separate account, same brand.
            </p>
            <a
              href={DIGITAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[3rem] px-8 py-3 rounded-xl
                border-2 border-wisdom-cyan/60 bg-wisdom-cyan/10 text-wisdom-cyan font-bold text-base
                hover:bg-wisdom-cyan hover:text-wisdom-dark hover:border-wisdom-cyan transition-all"
            >
              Open Wisdom Digital
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
