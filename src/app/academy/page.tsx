import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  BadgeCheck,
  FileCheck2,
  Sparkles,
  Lightbulb,
  Building2,
  Library,
  GraduationCap as GradCap,
  Trees,
} from "lucide-react";
import VoiceMessageCard from "@/components/VoiceMessageCard";
import TestimonialMarquee from "@/components/TestimonialMarquee";

const programs = [
  {
    id: "grade-9-12",
    href: "/academy/grades",
    name: "Grade 9–12",
    description:
      "Complete secondary pathways. Open a grade, then access books, videos, flashcards, question banks, and exams.",
    icon: <BookOpen className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
    gradient: "from-sky-500/30 to-cyan-500/10",
    accent: "text-sky-400",
    border: "hover:border-sky-400/40",
    cta: "Open grades",
  },
  {
    id: "freshman",
    href: "/academy/freshman",
    name: "Freshman",
    description:
      "Nineteen first-year subjects — math, sciences, languages, civics, tech, and more.",
    icon: <GraduationCap className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    gradient: "from-purple-500/30 to-pink-500/10",
    accent: "text-purple-400",
    border: "hover:border-purple-400/40",
    cta: "Open subjects",
  },
  {
    id: "uat",
    href: "/academy/uat",
    name: "UAT",
    description: "University Admission Test preparation with practice, mocks, and strategies.",
    icon: <Award className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    gradient: "from-emerald-500/30 to-teal-500/10",
    accent: "text-emerald-400",
    border: "hover:border-emerald-400/40",
    cta: "Open UAT",
  },
  {
    id: "gat",
    href: "/academy/gat",
    name: "GAT",
    description: "Graduate Admission Test coaching — quantitative, verbal, and analytical.",
    icon: <Users className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    gradient: "from-rose-500/30 to-red-500/10",
    accent: "text-rose-400",
    border: "hover:border-rose-400/40",
    cta: "Open GAT",
  },
  {
    id: "coc",
    href: "/academy/coc",
    name: "COC",
    description: "Certificate of Competency preparation — skills assessment and exam readiness.",
    icon: <BadgeCheck className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    gradient: "from-indigo-500/30 to-blue-500/10",
    accent: "text-indigo-400",
    border: "hover:border-indigo-400/40",
    cta: "Open COC",
  },
  {
    id: "exit-exam",
    href: "/academy/exit-exam",
    name: "Exit Exam",
    description: "University exit exam preparation with structured review and practice tests.",
    icon: <FileCheck2 className="w-7 h-7" />,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
    gradient: "from-fuchsia-500/30 to-pink-500/10",
    accent: "text-fuchsia-400",
    border: "hover:border-fuchsia-400/40",
    cta: "Open Exit Exam",
  },
];

const freeResources = [
  {
    href: "/academy/success-stories",
    name: "Success Stories",
    blurb: "Journeys of students who leveled up with Academy",
    icon: Sparkles,
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
    // audioSrc: "/audio/testimonials/hana.mp3",
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
          <div className="text-center mb-14 animate-fade-up">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-amber-400/90 mb-3">
              Wisdom Tower Academy
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              Academic Excellence Pathways
            </h1>
            <p className="text-wisdom-muted max-w-2xl mx-auto text-lg leading-relaxed">
              Six structured branches — each with its own leaderboard when you open it.
            </p>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-wisdom-muted">
              Educational branches
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          <div className="perspective-scene grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {programs.map((program) => (
              <Link
                key={program.id}
                href={program.href}
                className={`card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card ${program.border}`}
              >
                <div className="relative h-40 md:h-44 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${program.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/60 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-br ${program.gradient} border border-white/15 ${program.accent}`}
                    >
                      {program.icon}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`font-display text-xl font-bold mb-2 ${program.accent}`}>
                    {program.name}
                  </h3>
                  <p className="text-sm text-wisdom-muted leading-relaxed mb-4">{program.description}</p>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${program.accent}`}>
                    {program.cta}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Free resources */}
          <div className="mt-24 md:mt-28 relative">
            <div className="absolute -inset-x-4 -inset-y-8 rounded-[2rem] border border-teal-500/15 bg-gradient-to-b from-teal-500/[0.06] via-transparent to-transparent pointer-events-none" />

            <div className="relative text-center mb-10 pt-4">
              <p
                className="text-teal-300/90 text-sm mb-2 tracking-wide"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
              >
                Open library · no enrollment required
              </p>
              <h2
                className="text-3xl md:text-4xl text-white mb-3"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                Free resources
              </h2>
              <p
                className="text-wisdom-muted max-w-lg mx-auto text-base leading-relaxed"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
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
                    <h3
                      className="text-xl text-teal-50 mb-2 group-hover:text-teal-200 transition-colors"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontWeight: 600,
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      className="text-sm text-wisdom-muted leading-relaxed"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}
                    >
                      {item.blurb}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-teal-400/90">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* What students say */}
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

          <div className="mt-16 relative overflow-hidden rounded-3xl border border-white/12 shadow-card-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/12 via-wisdom-card to-orange-500/8" />
            <div className="relative px-8 py-14 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Ready to start learning?</h2>
              <p className="text-wisdom-muted mb-8 max-w-lg mx-auto">
                Contact us to enroll or get a personalized study plan.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 text-wisdom-dark font-semibold hover:bg-amber-400 hover:scale-105 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
