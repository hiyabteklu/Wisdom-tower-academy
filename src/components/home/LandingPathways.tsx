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
  FileText,
  CheckCircle2,
  ChevronDown,
  Info,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import PartnershipPath from "@/components/PartnershipPath";
import { packageImages, getPackage, CORE_PACKAGE_INCLUDES } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

const OPEN_BTN =
  "inline-flex flex-1 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-900/25 hover:bg-sky-400 transition-colors";

type ProgramCard = {
  id: string;
  href: string;
  name: string;
  category: string;
  image: string;
  accent: string;
  border: string;
  description: string;
  includes: string[];
};

const freshmanPkg = getPackage("freshman");
const g912Pkg = getPackage("grade-9-12");
const uatPkg = getPackage("uat");
const gatPkg = getPackage("gat");
const cocPkg = getPackage("coc");
const exitPkg = getPackage("exit-exam");
const remedialPkg = getPackage("remedial");

const allPrograms: ProgramCard[] = [
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    category: "First-Year University",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    description:
      freshmanPkg?.description ||
      "Every first-year course in one place, natural and social streams included. Notes, chapter questions, flashcards, and solved practice exams for 20+ courses, plus tools that keep you on track.",
    includes: freshmanPkg?.includes || [
      "All 20+ freshman courses (natural and social streams)",
      "Ethiopian university GPA calculator & field leaderboard",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    category: "Secondary Curriculum",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    description:
      g912Pkg?.description ||
      "Complete Grade 9 to 12 secondary curriculum. Master textbook chapters, drill with targeted questions, practice with timed exams, and prepare thoroughly for national matriculation.",
    includes: g912Pkg?.includes || [
      "Complete Grade 9, 10, 11, and 12 Ethiopian national curriculum",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "special",
    href: "/academy/special-packages",
    name: "Special Packages (ECE 1 & 2)",
    category: "Department Tracks",
    image: SPECIAL_PACKAGES_HUB_IMAGE,
    accent: "text-violet-300",
    border: "hover:border-violet-400/40",
    description:
      "Senior Electrical and Computer Engineering, Semester 1 & Semester 2. Course material written for your department, not generic engineering notes. Each course carries its own question bank, flashcards, and practice exams with solutions.",
    includes: [
      "All 7 Year 3 Semester 1 engineering courses",
      "All 7 Year 3 Semester 2 engineering courses",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    category: "Undergraduate Entrance",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    description:
      uatPkg?.description ||
      "University Admission Test prep that respects how the exam is actually written. Focused notes, chapter question banks, flashcards for rapid recall, and practice exams with solutions.",
    includes: uatPkg?.includes || [
      "Comprehensive UAT quantitative & verbal entrance tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    category: "Graduate Admission",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    description:
      gatPkg?.description ||
      "Graduate Admission Test resources organized the way the exam expects you to think. Notes on core GAT material, chapter questions, flashcards, and practice exams with solutions.",
    includes: gatPkg?.includes || [
      "Postgraduate GAT analytical & quantitative problem tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    category: "Competency Certification",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    description:
      cocPkg?.description ||
      "Certificate of Competency prep with clear notes, chapter practice, flashcards, and solved exams. Material aimed at the skills and judgment the assessment rewards.",
    includes: cocPkg?.includes || [
      "Occupational standard competencies & evaluation prep",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    category: "University Exit Certification",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    description:
      exitPkg?.description ||
      "University exit exam review by department, with structured notes and practice when materials open. Designed for final-year students who need focused revision, not generic summaries.",
    includes: exitPkg?.includes || [
      "Department graduation exit exam comprehensive tracks",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
  {
    id: "remedial",
    href: "/academy/remedial",
    name: "Remedial Program",
    category: "Higher Ed Catch-Up",
    image: packageImages.remedial,
    accent: "text-amber-400",
    border: "hover:border-amber-400/40",
    description:
      remedialPkg?.description ||
      "Catch-up pathway for core subjects. Strengthen foundations in English, Maths, Physics, Chemistry, Biology, History and Geography with the same learning hubs used across the Academy — notes, flashcards, question banks and practice exams.",
    includes: remedialPkg?.includes || [
      "All seven core remedial prerequisite subjects",
      ...CORE_PACKAGE_INCLUDES,
    ],
  },
];

const freeResources = [
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "Real preparation strategies, score milestones, and study habits from top-ranking students.",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/10 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Active recall, spaced repetition, and focus management frameworks proven for exam mastery.",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/10 hover:border-cyan-400/40",
    iconBg: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Living guides, campus navigation, study balance, and dorm survival tips for university students.",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/10 hover:border-sky-400/40",
    iconBg: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  },
  {
    href: "/academy/universities",
    name: "Universities Directory",
    blurb: "In-depth profiles, campus climate, department strengths, and admission data across Ethiopia.",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/10 hover:border-violet-400/40",
    iconBg: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  },
  {
    href: "/academy/departments",
    name: "Departments Guide",
    blurb: "Understand curriculum requirements, career prospects, and daily realities of each major before choosing.",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/10 hover:border-orange-400/40",
    iconBg: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarships Guide",
    blurb: "Verified domestic and international funding opportunities with deadline tracking and guidance.",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/10 hover:border-rose-400/40",
    iconBg: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  },
];

function PathwayCard({ program }: { program: ProgramCard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`card-modern group flex flex-col ${program.border} shadow-lg shadow-black/25 transition-all`}
    >
      <Link href={program.href} className="relative aspect-video w-full overflow-hidden bg-wisdom-navy block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={program.image}
          alt={program.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
      </Link>

      <div className="p-5 sm:p-6 flex flex-col flex-1 border-t border-white/8">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-wisdom-muted tracking-wide">
            {program.category}
          </span>
        </div>

        <h3 className={`font-display text-xl font-bold tracking-tight mb-2.5 ${program.accent}`}>
          {program.name}
        </h3>

        <p
          className={`text-sm text-slate-300/90 leading-relaxed mb-2 ${
            expanded ? "" : "line-clamp-2"
          }`}
          suppressHydrationWarning
        >
          {program.description}
        </p>

        {/* Collapsible Trigger: About & What's Included */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-cyan-300 hover:bg-white/10 hover:border-cyan-400/40 transition-colors my-2.5 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            {expanded ? "Hide Details" : "About & What's Included"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              expanded ? "rotate-180 text-cyan-400" : ""
            }`}
          />
        </button>

        {/* Collapsible Detailed Bullets */}
        {expanded && program.includes.length > 0 && (
          <div className="space-y-2 mb-4 pt-3 border-t border-white/6 animate-in fade-in duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Everything Included:
            </p>
            <ul className="space-y-2">
              {program.includes.map((line) => (
                <li key={line} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300/90 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={program.href}
            className="btn-primary w-full text-center"
          >
            <span>Explore {program.name}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function LandingPathways() {
  const pathwaysSection = useInView();

  return (
    <>
      <section
        className="pb-16 md:pb-24 relative"
        ref={pathwaysSection.ref}
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className={`text-center mb-12 md:mb-16 reveal-item ${
              pathwaysSection.inView ? "is-visible" : ""
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-3">
              Curated Academic Tracks
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Choose your pathway
            </h2>
            <p className="text-wisdom-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Every course, question bank, and exam simulation is tailored to Ethiopian national syllabus and university standards.
            </p>
          </div>

          {/* All Academic Pathways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 md:mb-24">
            {allPrograms.map((program) => (
              <PathwayCard key={program.id} program={program} />
            ))}
          </div>

          {/* Free Academic Resources Section */}
          <section className="mb-12">
            <div className="text-center mb-10 md:mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-2">
                Open Access
              </p>
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">
                Free resources & guides
              </h3>
              <p className="text-wisdom-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Study frameworks, student insights, and university directories available freely to every learner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`card-modern group p-5 sm:p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${item.border}`}
                  >
                    <div
                      className={`mb-4 inline-flex p-3 rounded-xl border w-fit ${item.iconBg} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4
                      className={`font-display text-lg sm:text-xl mb-2 font-bold transition-colors ${item.accent}`}
                    >
                      {item.name}
                    </h4>
                    <p className="text-sm text-wisdom-muted leading-relaxed mb-5 flex-1">
                      {item.blurb}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                      Open guide
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
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
