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
  Sparkles,
} from "lucide-react";
import VoiceMessageCard from "@/components/VoiceMessageCard";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import WelcomeVideoCard from "@/components/WelcomeVideoCard";
import PartnershipPath from "@/components/PartnershipPath";
import { packageImages } from "@/data/packages";
import { specialPackages } from "@/data/special-packages";

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
  },
  {
    href: "/academy/study-techniques",
    name: "Study Techniques",
    blurb: "Methods to learn faster and retain under pressure",
    icon: Lightbulb,
  },
  {
    href: "/academy/campus-life",
    name: "Campus Life",
    blurb: "Friends, focus, burnout, lectures, facilities & group work",
    icon: Trees,
  },
  {
    href: "/academy/universities",
    name: "Universities Info",
    blurb: "Explore institutions, programs, and pathways",
    icon: Building2,
  },
  {
    href: "/academy/departments",
    name: "Department Info",
    blurb: "What each field of study actually involves",
    icon: Library,
  },
  {
    href: "/academy/scholarships",
    name: "Scholarship Info",
    blurb: "Funding options and how to prepare applications",
    icon: GradCap,
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
  const featuredSpecial = specialPackages[0];

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
              Six structured branches — each with its own path when you open it.
            </p>
          </div>

          <div className="mb-14 md:mb-16">
            <WelcomeVideoCard
              variant="academy"
              title="What you’ll find here"
              subtitle="A short look at how Academy is organized — pathways, practice, and support for real study goals."
            />
          </div>

          <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {programs.map((program) => (
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
                    <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-sky-400" aria-label="Verified" />
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

          {/* Special packages — clearly separated from the six branches */}
          <section className="mt-20 md:mt-24 relative" id="special-packages">
            <div className="absolute -inset-x-2 md:-inset-x-6 -inset-y-6 rounded-[2rem] border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.08] via-violet-500/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

            <div className="relative text-center mb-8 pt-6">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300/90 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Beyond the six branches
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Special packages
              </h2>
              <p className="text-wisdom-muted max-w-lg mx-auto text-base leading-relaxed">
                Department tracks by year and semester — starting with Electrical & Computer
                Engineering.
              </p>
            </div>

            {featuredSpecial && (
              <Link
                href={`/academy/special-packages/${featuredSpecial.slug}`}
                className="relative group block max-w-4xl mx-auto overflow-hidden rounded-3xl border border-violet-400/30 bg-wisdom-card hover:border-violet-300/50 transition-all shadow-lg shadow-violet-900/20"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredSpecial.image}
                    alt={featuredSpecial.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070c16] via-[#070c16]/45 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-left">
                    <p className="text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">
                      {featuredSpecial.yearLabel}
                    </p>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                      {featuredSpecial.name}
                    </h3>
                    <p className="text-sm text-wisdom-muted max-w-md mb-4">
                      {featuredSpecial.blurb}
                    </p>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold">
                      Open special package
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <p className="relative mt-5 text-center">
              <Link
                href="/academy/special-packages"
                className="text-sm font-semibold text-violet-300 hover:text-violet-200"
              >
                View all special packages →
              </Link>
            </p>
          </section>

          <div className="mt-24 md:mt-28 relative">
            <div className="absolute -inset-x-4 -inset-y-8 rounded-[2rem] border border-teal-500/15 bg-gradient-to-b from-teal-500/[0.06] via-transparent to-transparent pointer-events-none" />

            <div className="relative text-center mb-10 pt-4">
              <p className="text-teal-300/90 text-sm mb-2 tracking-wide font-medium">
                Open library · no enrollment required
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Free resources
              </h2>
              <p className="text-wisdom-muted max-w-lg mx-auto text-base leading-relaxed">
                Guidance beyond the six academic branches — stories, techniques, campus life,
                universities, departments, and scholarships.
              </p>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {freeResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative rounded-2xl border border-teal-400/20 bg-wisdom-dark/50 backdrop-blur-sm p-6 hover:border-teal-300/45 hover:bg-teal-500/[0.07] transition-all duration-300"
                  >
                    <div className="mb-4 inline-flex p-3 rounded-full border border-teal-400/25 bg-teal-500/10 text-teal-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl text-teal-50 mb-2 group-hover:text-teal-200 transition-colors font-semibold">
                      {item.name}
                    </h3>
                    <p className="text-sm text-wisdom-muted leading-relaxed">{item.blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-400/90">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

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
            <p className="mt-3 text-center text-[11px] text-wisdom-muted">
              Quotes auto-scroll · hover to pause · replace with your real feedback anytime
            </p>
          </section>

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
