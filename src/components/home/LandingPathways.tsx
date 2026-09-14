"use client";

import { useState } from "react";
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
  FileText,
  X,
  CheckCircle2,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import PartnershipPath from "@/components/PartnershipPath";
import SafeCoverImage from "@/components/SafeCoverImage";
import { packageImages, getPackage } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

type ProgramCard = {
  id: string;
  href: string;
  name: string;
  image: string;
  accent: string;
  border: string;
  btn: string;
  description: string;
  includes: string[];
};

function fromPackage(
  packageId: string,
  overrides: Partial<ProgramCard> & Pick<ProgramCard, "id" | "href" | "name" | "image" | "accent" | "border" | "btn">
): ProgramCard {
  const pkg = getPackage(packageId);
  return {
    description: pkg?.description || "",
    includes: pkg?.includes || [],
    ...overrides,
  };
}

const programs: ProgramCard[] = [
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    btn: "bg-sky-500 hover:bg-sky-400 text-wisdom-dark",
    description:
      "Secondary packages built grade by grade. Notes for every subject, chapter question banks, flashcards, and practice exams with solutions. Buy a full grade or focus on individual subjects. AI tutor support inside notes and questions, plus verified scholarship listings.",
    includes: [
      "Full grade or individual subjects",
      "Notes for every subject",
      "Question bank per chapter",
      "Flashcards per chapter",
      "Practice exams with solutions",
      "AI tutor inside notes and questions",
      "Verified scholarship listings",
    ],
  },
  fromPackage("freshman", {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    btn: "bg-purple-500 hover:bg-purple-400 text-white",
  }),
  fromPackage("uat", {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-wisdom-dark",
  }),
  fromPackage("gat", {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    btn: "bg-rose-500 hover:bg-rose-400 text-white",
  }),
  fromPackage("coc", {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    btn: "bg-indigo-500 hover:bg-indigo-400 text-white",
  }),
  fromPackage("exit-exam", {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    btn: "bg-fuchsia-500 hover:bg-fuchsia-400 text-white",
  }),
];

const specialCard: ProgramCard = {
  id: "special",
  href: "/academy/special-packages",
  name: "Special packages",
  image: SPECIAL_PACKAGES_HUB_IMAGE,
  accent: "text-violet-300",
  border: "hover:border-violet-400/40",
  btn: "bg-violet-500 hover:bg-violet-400 text-white",
  description:
    "Senior engineering and select department tracks. Course material written for your department, not general content. Question banks, flashcards, and practice exams with solutions per chapter. More departments added over time. AI tutor support and scholarship access included.",
  includes: [
    "Department-specific course material",
    "Question bank per chapter",
    "Flashcards per chapter",
    "Practice exams with solutions",
    "More departments over time",
    "AI tutor inside notes and questions",
    "Verified scholarship listings",
  ],
};

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

function ProgramCardView({ program }: { program: ProgramCard }) {
  const [openDesc, setOpenDesc] = useState(false);

  return (
    <>
      <div
        className={`card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card ${program.border} transition-all duration-300 hover:-translate-y-1`}
      >
        <Link href={program.href} className="relative aspect-video w-full overflow-hidden bg-wisdom-navy block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={program.image}
            alt={program.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        </Link>
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8 space-y-3">
          <h3
            className={`flex items-center gap-1.5 font-display text-base sm:text-lg font-bold ${program.accent}`}
          >
            <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-sky-400" aria-hidden />
            {program.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpenDesc(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white/90 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </button>
            <Link
              href={program.href}
              className={`inline-flex flex-1 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-colors ${program.btn}`}
            >
              Open
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {openDesc && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => setOpenDesc(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/15 bg-wisdom-card p-6 sm:p-7 shadow-card-3d max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenDesc(false)}
              className="absolute right-3 top-3 p-2 rounded-lg text-wisdom-muted hover:text-white"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/90 mb-2">
              What you get
            </p>
            <h3 className={`font-display text-xl font-bold mb-3 ${program.accent}`}>{program.name}</h3>
            <p className="text-sm text-white/85 leading-relaxed mb-5">{program.description}</p>
            {program.includes.length > 0 && (
              <ul className="space-y-2 mb-6">
                {program.includes.map((line) => (
                  <li key={line} className="flex gap-2 text-sm text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={program.href}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${program.btn}`}
              onClick={() => setOpenDesc(false)}
            >
              Open {program.name}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
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

          <section className="mb-14 md:mb-16">
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                Special packages
              </h3>
            </div>
            <div className="max-w-xl mx-auto">
              <ProgramCardView program={specialCard} />
            </div>
          </section>

          {freshman && (
            <section className="mb-14 md:mb-16">
              <div className="text-center mb-6">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">Freshman</h3>
              </div>
              <div className="max-w-xl mx-auto">
                <ProgramCardView program={freshman} />
              </div>
            </section>
          )}

          <section className="mb-16 md:mb-20">
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                Academic branches
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {branchPrograms.map((program) => (
                <ProgramCardView key={program.id} program={program} />
              ))}
            </div>
          </section>

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
