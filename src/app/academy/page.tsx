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
import VoiceMessageCard from "@/components/VoiceMessageCard";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import WelcomeVideoCard from "@/components/WelcomeVideoCard";
import PartnershipPath from "@/components/PartnershipPath";
import SafeCoverImage from "@/components/SafeCoverImage";
import { packageImages } from "@/data/packages";
import { SPECIAL_PACKAGES_HUB_IMAGE } from "@/data/special-packages";

/** Flip to true when real student voices and quotes are ready. */
const SHOW_STUDENT_VOICES = false;

const programs = [
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
    blurb: "Journeys of students who leveled up with Academy",
    icon: Trophy,
    accent: "text-amber-300",
    border: "border-white/12 hover:border-amber-400/35",
    iconBg: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Methods to learn faster and retain under pressure",
    icon: Lightbulb,
    accent: "text-cyan-300",
    border: "border-white/12 hover:border-cyan-400/35",
    iconBg: "border-cyan-400/25 bg-cyan-500/10 text-cyan-300",
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Friends, focus, burnout, lectures, facilities and group work",
    icon: Trees,
    accent: "text-sky-300",
    border: "border-white/12 hover:border-sky-400/35",
    iconBg: "border-sky-400/25 bg-sky-500/10 text-sky-300",
  },
  {
    href: "/academy/universities",
    name: "Universities Info",
    blurb: "Explore institutions, programs, and pathways",
    icon: Building2,
    accent: "text-violet-300",
    border: "border-white/12 hover:border-violet-400/35",
    iconBg: "border-violet-400/25 bg-violet-500/10 text-violet-300",
  },
  {
    href: "/academy/departments",
    name: "Department Info",
    blurb: "What each field of study actually involves",
    icon: Library,
    accent: "text-orange-300",
    border: "border-white/12 hover:border-orange-400/35",
    iconBg: "border-orange-400/25 bg-orange-500/10 text-orange-300",
  },
  {
    href: "/academy/scholarships",
    name: "Scholarship Info",
    blurb: "Funding options and how to prepare applications",
    icon: GradCap,
    accent: "text-rose-300",
    border: "border-white/12 hover:border-rose-400/35",
    iconBg: "border-rose-400/25 bg-rose-500/10 text-rose-300",
  },
];

const voiceStudents = [
  {
    name: "Hana G.",
    program: "UAT · Voice note",
    duration: "0:42",
    accent: "text-emerald-400",
  },
  {
    name: "Yonas D.",
    program: "Grade 12 · Voice note",
    duration: "0:38",
    accent: "text-sky-400",
  },
  {
    name: "Meron K.",
    program: "Freshman · Voice note",
    duration: "0:51",
    accent: "text-purple-400",
  },
  {
    name: "Samuel B.",
    program: "Exit Exam · Voice note",
    duration: "0:35",
    accent: "text-fuchsia-400",
  },
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
            <p className="mt-4 text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Six structured branches, each with its own path when you open it.
            </p>
          </div>

          <div className="mb-14 md:mb-16">
            <WelcomeVideoCard
              variant="academy"
              title="What you’ll find here"
              subtitle="A short look at how Academy is organized: pathways, practice, and support for real study goals."
            />
          </div>

          <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {programs.map((program) => {
              const locked = "locked" in program && program.locked;
              const body = (
                <>
                  <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={program.image}
                      alt={program.name}
                      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
                        locked ? "saturate-[0.85]" : "group-hover:scale-[1.03]"
                      }`}
                    />
                    {locked && (
                      <div className="absolute inset-0 bg-wisdom-dark/40 flex items-end justify-end p-3">
                        <span className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                          Opening tomorrow
                        </span>
                      </div>
                    )}
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
                      className={`mt-2.5 flex items-center gap-1 text-xs sm:text-sm font-semibold ${
                        locked ? "text-amber-200/90" : program.accent
                      }`}
                    >
                      {program.cta}
                      {!locked && (
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                </>
              );
              const cls = `card-3d group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12 bg-wisdom-card ${program.border} ${
                locked ? "cursor-not-allowed opacity-95" : ""
              }`;
              if (locked) {
                return (
                  <div key={program.id} className={cls} aria-disabled="true">
                    {body}
                  </div>
                );
              }
              return (
                <Link key={program.id} href={program.href} className={cls}>
                  {body}
                </Link>
              );
            })}
          </div>

          <section className="mt-20 md:mt-24" id="special-packages">
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
              className="group block max-w-xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-violet-400/30 bg-wisdom-card hover:border-violet-300/50 transition-all"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                <SafeCoverImage src={SPECIAL_PACKAGES_HUB_IMAGE} alt="" />
              </div>
              <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-white/8 text-left">
                <h3 className="flex items-center gap-1.5 font-display text-base sm:text-lg font-bold text-white group-hover:text-violet-200">
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

          <section className="mt-24 md:mt-28">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/90 mb-3">
                Open library · no enrollment required
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Free resources
              </h2>
              <p className="text-wisdom-muted max-w-lg mx-auto text-base leading-relaxed">
                Guidance beyond the six academic branches: stories, techniques, campus life,
                universities, departments, and scholarships.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative rounded-2xl border bg-wisdom-card p-6 transition-all duration-300 hover:bg-white/[0.03] ${item.border}`}
                  >
                    <div
                      className={`mb-4 inline-flex p-3 rounded-xl border ${item.iconBg} group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3
                      className={`font-display text-xl mb-2 font-semibold transition-colors ${item.accent}`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm text-wisdom-muted leading-relaxed">{item.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-wisdom-muted group-hover:text-white/80">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {SHOW_STUDENT_VOICES && (
            <section className="mt-24 md:mt-28">
              <div className="text-center mb-10">
                <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">
                  Real voices
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                  What students say about us
                </h2>
                <p className="text-wisdom-muted max-w-xl mx-auto">
                  Short voice notes and written feedback from learners across our programs.
                </p>
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
