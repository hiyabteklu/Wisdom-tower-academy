import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
  Handshake,
  Package,
  ClipboardCheck,
  Mail,
  CheckCircle2,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import VoiceMessageCard from "@/components/VoiceMessageCard";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import WelcomeVideoCard from "@/components/WelcomeVideoCard";
import { packageImages } from "@/data/packages";

/** 6 pathway cards — same files as public/images/packages/ uploads */
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

const partnershipCards = [
  {
    icon: Package,
    title: "What we’re looking for",
    body: "Courses, modules, or learning tools that help students in our community — secondary, freshman, entrance, and professional tracks.",
    points: [
      "Premade courses ready for students",
      "Packages for business, tech, or personal development",
      "Tools that reduce friction in real study paths",
    ],
    accent: "from-amber-500/25 to-orange-500/5 border-amber-400/35 text-amber-300",
  },
  {
    icon: ClipboardCheck,
    title: "How we review",
    body: "Every proposal is checked against community standards — clarity, accuracy, and usefulness for Ethiopian learners first.",
    points: [
      "Alignment with our six academic branches",
      "Quality of materials and teaching design",
      "Fit with ethics and practical outcomes",
    ],
    accent: "from-sky-500/25 to-cyan-500/5 border-sky-400/35 text-sky-300",
  },
  {
    icon: Handshake,
    title: "How we partner",
    body: "From co-branded modules to hosted content on Academy pathways — we structure collaboration so both sides know the scope.",
    points: [
      "Clear ownership and credit",
      "Shared or hosted delivery options",
      "Room to grow with measured adoption",
    ],
    accent: "from-emerald-500/25 to-teal-500/5 border-emerald-400/35 text-emerald-300",
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
            <div className="text-center mb-10 md:mb-12">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">
                Build with us
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Open for partnership & collaboration
              </h2>
              <p className="text-wisdom-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                Educators, course creators, and institutions — if you have something that serves
                students, we want to hear it. We review for fit with our community, not volume of
                pitch decks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 perspective-scene mb-10">
              {partnershipCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className={`card-3d rounded-3xl border bg-gradient-to-br p-6 sm:p-7 ${card.accent}`}
                  >
                    <div className="inline-flex p-3 rounded-2xl bg-wisdom-dark/60 border border-white/10 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-wisdom-muted leading-relaxed mb-4">{card.body}</p>
                    <ul className="space-y-2">
                      {card.points.map((p) => (
                        <li key={p} className="flex gap-2 text-sm text-white/85">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
                          <span className="leading-snug">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>

            <div className="rounded-3xl border border-white/12 bg-wisdom-card shadow-card-3d overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 p-7 sm:p-9 border-b lg:border-b-0 lg:border-r border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold">We&apos;re open</h3>
                  </div>
                  <p className="text-wisdom-muted leading-relaxed mb-5">
                    Bring premade courses, cohort ideas, or institutional packages. Tell us who you
                    serve, what you&apos;ve already built, and how it could sit beside our pathways.
                    Incomplete pitches are fine — clarity beats polish.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/85">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Student-first content
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Business &amp; tech upskilling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Personal development tracks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Co-branded or hosted delivery
                    </li>
                  </ul>
                </div>
                <div className="lg:col-span-2 p-7 sm:p-9 flex flex-col justify-center bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
                  <p className="text-sm text-wisdom-muted mb-4 leading-relaxed">
                    Prefer a direct line? Reach the Academy team and we&apos;ll route your message.
                  </p>
                  <Link
                    href="/contact?topic=partnership"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 text-wisdom-dark font-semibold hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-amber-500/20"
                  >
                    <Mail className="w-4 h-4" />
                    Start a conversation
                  </Link>
                  <p className="mt-4 text-xs text-wisdom-muted text-center lg:text-left">
                    Or email via the contact page — mention “Academy partnership” in the subject.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
