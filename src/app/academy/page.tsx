import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
  Shield,
} from "lucide-react";
import VoiceMessageCard from "@/components/VoiceMessageCard";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import PartnershipPath from "@/components/PartnershipPath";
import SafeCoverImage from "@/components/SafeCoverImage";
import { packageImages } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

/** Flip to true when real student voices and quotes are ready. */
const SHOW_STUDENT_VOICES = false;

type ProgramCard = {
  id: string;
  href: string;
  name: string;
  category: string;
  image: string;
  accent: string;
  border: string;
  description: string;
};

const programs: ProgramCard[] = [
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    category: "First-Year University",
    image: packageImages.freshman,
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    description: "Complete course hubs for Natural & Social streams with textbook notes, question banks, and exams.",
  },
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    category: "Secondary Education",
    image: packageImages["grade-9-12"],
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    description: "National secondary curriculum with chapter-by-chapter drills and matriculation practice.",
  },
  {
    id: "special",
    href: "/academy/special-packages",
    name: "Special Packages",
    category: "Department Tracks",
    image: SPECIAL_PACKAGES_HUB_IMAGE,
    accent: "text-violet-300",
    border: "hover:border-violet-400/40",
    description: "Undergraduate department engineering courses, chapter exercises, and technical problem sets.",
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    category: "University Entrance",
    image: packageImages.uat,
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    description: "Undergraduate Admission Test preparation covering quantitative reasoning and verbal problem solving.",
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    category: "Postgraduate Entrance",
    image: packageImages.gat,
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    description: "Graduate Admission Test practice sets, analytical reasoning drills, and timed simulations.",
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    category: "Occupational Assessment",
    image: packageImages.coc,
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    description: "Center of Competence assessment question banks and applied practical revision guides.",
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    category: "Graduation Assessment",
    image: packageImages["exit-exam"],
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    description: "National university exit examination materials to consolidate your field of study.",
  },
  {
    id: "remedial",
    href: "/academy/remedial",
    name: "Remedial Program",
    category: "Foundation Catch-Up",
    image: packageImages.remedial,
    accent: "text-amber-400",
    border: "hover:border-amber-400/40",
    description: "Core prerequisite subject strengthening for university transition and placement success.",
  },
];

const freeResources = [
  {
    href: "/games/tower-defense",
    name: "Tower Defense",
    blurb: "Survive exam problem waves and defend your Knowledge Citadel",
    icon: Shield,
    accent: "text-emerald-300",
    border: "border-white/12 hover:border-emerald-400/40",
    iconBg: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(52,211,153,0.3)]",
  },
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "How top students prepared and what they learned along the way",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/12 hover:border-amber-400/40",
    iconBg: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,191,36,0.35)]",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Practical ways to learn faster and remember more",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/12 hover:border-cyan-400/40",
    iconBg: "border-cyan-400/30 bg-cyan-500/15 text-cyan-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(34,211,238,0.3)]",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Friends, focus, lectures, and life between classes",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/12 hover:border-sky-400/40",
    iconBg: "border-sky-400/30 bg-sky-500/15 text-sky-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(56,189,248,0.3)]",
  },
  {
    href: "/academy/universities",
    name: "Universities",
    blurb: "Schools, programs, and what each is known for",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/12 hover:border-violet-400/40",
    iconBg: "border-violet-400/30 bg-violet-500/15 text-violet-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(167,139,250,0.3)]",
  },
  {
    href: "/academy/departments",
    name: "Departments",
    blurb: "Clear picture of each field before you choose",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/12 hover:border-orange-400/40",
    iconBg: "border-orange-400/30 bg-orange-500/15 text-orange-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(251,146,60,0.3)]",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarships",
    blurb: "Funding options and how to apply with confidence",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/12 hover:border-rose-400/40",
    iconBg: "border-rose-400/30 bg-rose-500/15 text-rose-300",
    glow: "group-hover:shadow-[0_12px_40px_-16px_rgba(244,63,94,0.3)]",
  },
];

const voiceStudents = [
  { name: "Hiwot", program: "Grade 12", duration: "0:42", accent: "text-amber-400" },
  { name: "Yonas", program: "Freshman", duration: "0:38", accent: "text-sky-400" },
  { name: "Meron", program: "UAT", duration: "0:51", accent: "text-violet-400" },
  { name: "Abel", program: "COC", duration: "0:35", accent: "text-emerald-400" },
];

export default function AcademyPage() {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12 animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Wisdom Tower Academy
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <article
                key={program.id}
                className={`card-modern group flex flex-col ${program.border} shadow-lg shadow-black/25`}
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
                  <span className="text-xs font-semibold text-wisdom-muted tracking-wide mb-1.5">
                    {program.category}
                  </span>
                  <h2
                    className={`font-display text-xl font-bold tracking-tight mb-2 ${program.accent}`}
                  >
                    {program.name}
                  </h2>
                  <p className="text-sm text-slate-300/90 leading-relaxed mb-5 flex-1 line-clamp-3">
                    {program.description}
                  </p>
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
            ))}
          </div>

          <section className="mt-20 md:mt-24">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Free resources
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative rounded-2xl border bg-wisdom-card/95 p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-white/[0.04] ${item.border} ${item.glow}`}
                  >
                    <div
                      className={`mb-4 inline-flex p-3 rounded-xl border ${item.iconBg} transition-transform duration-300 group-hover:scale-110`}
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

          {SHOW_STUDENT_VOICES && (
            <section className="mt-24 md:mt-28">
              <div className="text-center mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                  What students say about us
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {voiceStudents.map((s) => (
                  <VoiceMessageCard
                    key={s.name}
                    name={s.name}
                    program={s.program}
                    duration={s.duration}
                    accent={s.accent}
                  />
                ))}
              </div>
              <TestimonialMarquee />
            </section>
          )}

          <section className="mt-24 md:mt-28" id="partnership">
            <div className="max-w-3xl mx-auto">
              <PartnershipPath />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
