"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/data/services";
import TalentPath from "@/components/TalentPath";
import WelcomeVideoCard from "@/components/WelcomeVideoCard";
import BusinessRegisterSection from "@/components/BusinessRegisterSection";
import {
  Palette,
  PenTool,
  GraduationCap,
  Database,
  Globe,
  Briefcase,
  BookOpen,
  ArrowRight,
  ClipboardList,
  Zap,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette className="w-5 h-5" />,
  "pen-tool": <PenTool className="w-5 h-5" />,
  "graduation-cap": <GraduationCap className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  "book-open": <BookOpen className="w-5 h-5" />,
};

const categoryCover = (id: string) => `/images/digital/${id}.jpg`;

function CategoryCoverCard({
  href,
  title,
  tagline,
  meta,
  icon,
  imageSrc,
  accent = "cyan",
  delay = 0,
}: {
  href: string;
  title: string;
  tagline: string;
  meta: string;
  icon: React.ReactNode;
  imageSrc: string;
  accent?: "cyan" | "violet";
  delay?: number;
}) {
  const [failed, setFailed] = useState(false);
  const border =
    accent === "violet"
      ? "border-wisdom-cyan/35 hover:border-wisdom-cyan/60"
      : "border-white/12 hover:border-wisdom-cyan/40";

  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-wisdom-card transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(34,224,255,0.28)] ${border} animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-wisdom-navy" />
        )}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/20 transition-colors duration-500" />
        <div className="absolute bottom-3 left-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-black/40 text-wisdom-cyan backdrop-blur-md shadow-lg transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-white group-hover:text-wisdom-cyan transition-colors duration-300">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm sm:text-base text-wisdom-muted leading-relaxed line-clamp-2">
          {tagline}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
          <span className="text-sm font-semibold text-wisdom-cyan">{meta}</span>
          <span className="inline-flex items-center gap-1 text-sm text-wisdom-muted group-hover:text-wisdom-cyan transition-colors duration-300">
            Explore
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DigitalPage() {
  const [heroIn, setHeroIn] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-wisdom-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero title */}
          <div className="text-center mb-12 md:mb-14">
            <p
              className={`section-eyebrow mb-5 justify-center transition-all duration-700 ${
                heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              Digital services
            </p>
            <h1
              className={`font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-balance transition-all duration-1000 ease-out ${
                heroIn ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.98]"
              }`}
              style={{ transitionDelay: "80ms" }}
            >
              <span className="text-white">Our </span>
              <span className="relative inline-block text-wisdom-cyan">
                Services
                <span
                  className={`absolute -bottom-1 left-0 h-[3px] rounded-full bg-wisdom-cyan/80 transition-all duration-1000 ease-out ${
                    heroIn ? "w-full" : "w-0"
                  }`}
                  style={{ transitionDelay: "500ms" }}
                  aria-hidden
                />
              </span>
            </h1>
            <p
              className={`mt-6 text-wisdom-muted max-w-2xl mx-auto text-lg md:text-xl leading-relaxed text-balance transition-all duration-700 ${
                heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "220ms" }}
            >
              One-off jobs or ongoing work — pick a lane, order what you need, or leave the
              day-to-day with us.
            </p>
          </div>

          <div
            className={`mb-16 md:mb-20 transition-all duration-700 ${
              heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "320ms" }}
          >
            <WelcomeVideoCard
              variant="digital"
              title="How we work with you"
              subtitle="A short intro to our service lines, custom work, and what to expect when you start a project."
            />
          </div>

          {/* Quick order categories */}
          <div className="mb-8 md:mb-10 text-center sm:text-left">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-wisdom-cyan mb-3">
              <Zap className="w-3.5 h-3.5" />
              Quick order
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white text-balance">
              Want something done quickly?
            </h2>
            <p className="mt-2 text-wisdom-muted text-base sm:text-lg max-w-2xl leading-relaxed">
              Explore a category, pick from the list, and order — same request form, clear next steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {categories.map((category, i) => (
              <CategoryCoverCard
                key={category.id}
                href={`/services/${category.id}`}
                title={category.name}
                tagline={category.tagline}
                meta={`${category.services.length} services`}
                icon={iconMap[category.icon]}
                imageSrc={categoryCover(category.id)}
                delay={i * 60}
              />
            ))}

            <CategoryCoverCard
              href="/services/custom"
              title="Custom order"
              tagline="Tell us who you are and what you need. We'll shape a package that isn't on the standard list."
              meta="Submit a request"
              icon={<ClipboardList className="w-5 h-5" />}
              imageSrc="/images/digital/custom-order.jpg"
              accent="violet"
              delay={categories.length * 60}
            />
          </div>

          <BusinessRegisterSection />

          <section className="mt-24 md:mt-32" id="work-with-us">
            <TalentPath />
          </section>
        </div>
      </div>
    </div>
  );
}
