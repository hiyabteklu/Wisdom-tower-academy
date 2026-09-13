"use client";

import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
  BadgeCheck,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import PartnershipPath from "@/components/PartnershipPath";
import SafeCoverImage from "@/components/SafeCoverImage";
import { packageImages } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

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

export default function LandingPathways() {
  const pathwaysSection = useInView();

  return (
    <>
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
              Special packages first, then Freshman, then the academic branches.
            </p>
          </div>

          <section className="mb-16 md:mb-20" id="special-packages">
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

          <section className="mb-12 md:mb-16">
            <div className="text-center mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300/90 mb-2">
                First-year path
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Freshman</h2>
            </div>
            <div className="max-w-xl mx-auto">
              {programs
                .filter((p) => p.id === "freshman")
                .map((program) => (
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
          </section>

          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
              Academic branches
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
              Grades and exam pathways
            </h2>
          </div>
          <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {programs
              .filter((p) => p.id !== "freshman")
              .map((program) => (
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

          <section className="mt-24 md:mt-28">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-3">
                Open library · no enrollment required
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Free resources
              </h2>
              <p className="text-wisdom-muted max-w-lg mx-auto text-base leading-relaxed">
                Guidance beyond the academic branches: stories, techniques, campus life,
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
    </>
  );
}
