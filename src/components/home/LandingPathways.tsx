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
};

const programs: ProgramCard[] = [
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
  },
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
  },
];

const freeResources = [
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "How top students prepared and what they learned along the way",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/12 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Practical ways to learn faster and remember more",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/12 hover:border-cyan-400/40",
    iconBg: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Friends, focus, lectures, and life between classes",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/12 hover:border-sky-400/40",
    iconBg: "border-sky-400/30 bg-sky-500/15 text-sky-300",
  },
  {
    href: "/academy/universities",
    name: "Universities",
    blurb: "Schools, programs, and what each is known for",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/12 hover:border-violet-400/40",
    iconBg: "border-violet-400/30 bg-violet-500/15 text-violet-300",
  },
  {
    href: "/academy/departments",
    name: "Departments",
    blurb: "Clear picture of each field before you choose",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/12 hover:border-orange-400/40",
    iconBg: "border-orange-400/30 bg-orange-500/15 text-orange-300",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarships",
    blurb: "Funding options and how to apply with confidence",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/12 hover:border-rose-400/40",
    iconBg: "border-rose-400/30 bg-rose-500/15 text-rose-300",
  },
];

function ProgramLink({ program }: { program: ProgramCard }) {
  return (
    <Link
      href={program.href}
      className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card ${program.border} transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={program.image}
          alt={program.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
      </div>
      <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8 flex items-center justify-between gap-2">
        <h3
          className={`flex items-center gap-1.5 font-display text-base sm:text-lg font-bold ${program.accent}`}
        >
          <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-sky-400" aria-hidden />
          {program.name}
        </h3>
        <span
          className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold ${program.accent} opacity-90`}
        >
          Open
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function LandingPathways() {
  const pathwaysSection = useInView();
  const branchPrograms = programs.filter((p) => p.id !== "freshman");
  const freshman = programs.find((p) => p.id === "freshman");

  return (
    <>
      <section className="pb-16 md:pb-20 relative" ref={pathwaysSection.ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center mb-12 md:mb-14 reveal-item ${
              pathwaysSection.inView ? "is-visible" : ""
            }`}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Choose your pathway
            </h2>
          </div>

          {/* Special packages */}
          <section className="mb-14 md:mb-16">
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                Special packages
              </h3>
            </div>

            <Link
              href="/academy/special-packages"
              className="group block max-w-xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-violet-400/30 bg-wisdom-card hover:border-violet-300/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_-16px_rgba(167,139,250,0.35)]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                <SafeCoverImage src={SPECIAL_PACKAGES_HUB_IMAGE} alt="Special packages" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>
              <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8 flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-white group-hover:text-violet-200 transition-colors">
                  <BadgeCheck className="w-4 h-4 shrink-0 text-sky-400" aria-hidden />
                  Special packages
                </h4>
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-violet-300">
                  Open
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </section>

          {/* Freshman */}
          {freshman && (
            <section className="mb-14 md:mb-16">
              <div className="text-center mb-6">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">Freshman</h3>
              </div>
              <div className="max-w-xl mx-auto">
                <ProgramLink program={freshman} />
              </div>
            </section>
          )}

          {/* Academic branches */}
          <section className="mb-16 md:mb-20">
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                Academic branches
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {branchPrograms.map((program) => (
                <ProgramLink key={program.id} program={program} />
              ))}
            </div>
          </section>

          {/* Free resources */}
          <section className="mb-8">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                Free resources
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative rounded-2xl border bg-wisdom-card/95 p-5 sm:p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white/[0.04] ${item.border}`}
                  >
                    <div
                      className={`mb-4 inline-flex p-3 rounded-xl border ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4
                      className={`font-display text-lg sm:text-xl mb-2 font-semibold transition-colors ${item.accent}`}
                    >
                      {item.name}
                    </h4>
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

          <section className="mt-20 md:mt-24" id="partnership">
            <div className="max-w-3xl mx-auto">
              <PartnershipPath />
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
