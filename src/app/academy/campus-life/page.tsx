import Link from "next/link";
import {
  ArrowRight,
  Users,
  Heart,
  Brain,
  Flame,
  Shield,
  Coffee,
  BookOpen,
  MapPin,
  UsersRound,
  MessageSquare,
  Library,
  Building2,
  AlertTriangle,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

const navSections = [
  {
    id: "friends",
    title: "Friends & social life",
    blurb: "Staying close to people without losing your focus",
    accent: "text-rose-300",
    border: "border-rose-400/30",
    bg: "from-rose-500/12",
    icon: Users,
  },
  {
    id: "mind",
    title: "Energy & pressure",
    blurb: "Motivation dips, burnout signs, and real rest",
    accent: "text-violet-300",
    border: "border-violet-400/30",
    bg: "from-violet-500/12",
    icon: Brain,
  },
  {
    id: "lectures",
    title: "Lectures & class time",
    blurb: "Getting something useful out of every session",
    accent: "text-sky-300",
    border: "border-sky-400/30",
    bg: "from-sky-500/12",
    icon: BookOpen,
  },
  {
    id: "places",
    title: "Places, groups & staff",
    blurb: "Libraries, group work, and talking to instructors",
    accent: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "from-emerald-500/12",
    icon: Building2,
  },
];

export default function CampusLifePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-48 right-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-12 md:mb-14">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-teal-300/90 mb-3">
            Free resource
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            <span className="text-white">Campus </span>
            <span className="text-teal-300">life</span>
          </h1>
          <div className="space-y-4 text-wisdom-muted text-base sm:text-lg leading-relaxed">
            <p>
              Most of what decides your grades does not happen only at a desk with a highlighter.
              It happens in the hours between classes: who you sit with, how late you stay online,
              whether you recover after a hard week, and whether a weak lecture still leaves you with
              something you can revise.
            </p>
            <p>
              This page is a practical guide to that side of university — friendships, pressure,
              classrooms, and the buildings and people around you. Nothing here is a personality
              test. It is ordinary advice that works when you apply it imperfectly but consistently.
            </p>
          </div>
        </header>

        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-14">
          {navSections.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`rounded-2xl border ${s.border} bg-gradient-to-br ${s.bg} to-transparent bg-wisdom-card/80 p-4 hover:bg-wisdom-card transition-colors`}
              >
                <div className={`mb-2 inline-flex p-2 rounded-lg bg-wisdom-dark/50 border border-white/10 ${s.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`font-display font-bold text-sm ${s.accent}`}>{s.title}</p>
                <p className="text-xs text-wisdom-muted mt-1 leading-snug">{s.blurb}</p>
              </a>
            );
          })}
        </nav>

        {/* Friends */}
        <section id="friends" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-300">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Friends & social life</h2>
          </div>

          <div className="space-y-8 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-white">Keeping friends without losing the semester</h3>
              <p>
                University is where many people meet the friends they keep for years. That matters.
                What also matters is that endless availability — answering every message the moment
                it arrives, accepting every invitation because saying no feels rude — leaves almost
                no quiet stretch for real study.
              </p>
              <p>
                You do not need to become cold. You need a simple pattern: some hours are for work,
                and during those hours you are allowed to be slow to reply. When you are free, be
                actually free. People respect clarity more than vague half-attention all day long.
              </p>
              <ul className="space-y-2 pt-1">
                {[
                  "Block a few study hours where your phone is not the priority.",
                  "Put social plans after those blocks when you can, not in the middle of them.",
                  "A short, honest “I’m finishing this, talk later” is enough — you do not owe a speech.",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-rose-300/90 mt-1" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-white">What “everyone is doing” really means</h3>
              <p>
                Peer pressure on campus rarely looks like someone ordering you around. More often it
                is the quiet assumption that skipping class is normal, that starting the assignment
                the night before is normal, or that staying out late before an exam is just how
                students live. If you absorb that as the default, your own standards drift without
                a dramatic decision.
              </p>
              <p>
                The practical fix is to decide your minimums in advance — which classes you will
                not skip, how early you start major work — and to spend study time near people who
                are actually working. You can still like friends who live differently. You do not
                have to copy their calendar.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-white">Loneliness is not the same as discipline</h3>
              <p>
                Cutting everyone off is not a study strategy. Constant group chat noise is not the
                same as having someone who checks in when a week goes badly. Most students do better
                with one or two steady relationships than with a large circle they only half-know.
              </p>
              <p>
                If the campus feels empty, treat connection like something you schedule: a weekly
                walk, studying in the same room as someone else, a short call home. Isolation makes
                hard courses harder; so does a social life that never leaves room to think.
              </p>
            </div>
          </div>
        </section>

        {/* Mind */}
        <section id="mind" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-400/25 text-violet-300">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Energy & pressure</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-300">
                <Flame className="w-4 h-4" />
                <h3 className="font-display text-base font-bold text-white">When motivation comes and goes</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Some weeks you feel sharp and willing. Other weeks even opening the book feels
                heavy. If your plan only works on the good weeks, it will fail often. On low-energy
                days, shrink the task: a short review, a few problems, one section of notes. Save
                the hardest work for when your mind is clearer. The aim is not to pretend every day
                feels the same — it is to avoid going all the way to zero.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-300">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-display text-base font-bold text-white">Noticing burnout before it breaks you</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Burnout usually builds quietly. You sleep but still feel tired. Subjects you cared
                about feel flat. You delay simple tasks and feel oddly numb or irritable. That is
                not a moral failure; it is a sign the load is too high for too long. Cut volume,
                simplify what you are trying to maintain, protect sleep, and talk to someone early
                — a friend, family, or campus support — instead of waiting until you cannot function.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-300">
                <Shield className="w-4 h-4" />
                <h3 className="font-display text-base font-bold text-white">Showing up when you do not “feel like it”</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Waiting to feel inspired is a poor plan for a degree. What helps more is a small
                routine you can keep on ordinary days: the same desk, a fixed starting time, a first
                step so easy you can do it half-awake (open the notes, do one exercise). Intensity can
                wait. Continuity is what keeps you in the course when motivation is quiet.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 text-violet-300">
                <Coffee className="w-4 h-4" />
                <h3 className="font-display text-base font-bold text-white">Rest that actually restores you</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Scrolling until your eyes hurt is not the same as rest. Real recovery is sleep,
                a walk, a meal without a screen, time with someone who does not drain you. Short
                breaks between study blocks help more than pushing until you crash. Stopping while
                you still have a little energy left makes it easier to return tomorrow.
              </p>
            </article>
          </div>
        </section>

        {/* Lectures */}
        <section id="lectures" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-400/25 text-sky-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Lectures & class time</h2>
          </div>

          <div className="space-y-5 text-[15px] sm:text-base text-wisdom-muted leading-relaxed">
            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-sky-200">Where you sit and how you listen</h3>
              <p>
                Sitting where you can see the board and hear clearly is not about looking keen. It
                is about reducing the effort it takes to stay with the material. The back row with
                friends is comfortable; it is also where side conversations and phones win. If you
                bring a laptop, decide in advance whether it is for notes or for distraction — and
                be honest when it becomes the second.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-sky-200">Attendance without perfectionism</h3>
              <p>
                You will miss some sessions. Life happens. What hurts is missing the hard lectures
                and then never repairing the gap. When a topic is central or the instructor is
                signalling exam material, being in the room saves hours later. If you do skip, treat
                the same day as the deadline to catch up from a classmate’s notes or the reading —
                not “sometime next week.”
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-sky-200">Noise, phones, and getting back on track</h3>
              <p>
                Classrooms are rarely perfect. A message pops up, someone talks behind you, your
                mind drifts. Getting angry at the interruption often costs more than the interruption
                itself. Silence the phone, write a quick mark in your notes where you left off, and
                return to the next sentence the instructor says. Focus is something you recover,
                not something you either have all day or lose forever.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-lg font-bold text-sky-200">When the teaching is weak</h3>
              <p>
                Not every lecturer explains clearly. You still need the syllabus, the topics that
                get repeated, and any hints about how you will be examined. Use the contact hours to
                collect that map. Build understanding afterward with a textbook, recorded material,
                or a peer who understood the section — tied to the same course outline, not random
                videos that feel related but do not match what you will be tested on.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-400/25 bg-sky-500/[0.07] p-5 flex gap-3">
              <MapPin className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm leading-relaxed">
                <p className="font-semibold text-sky-100">A habit that pays off quickly</p>
                <p>
                  After a demanding class, take ten or twenty minutes the same day to rewrite the
                  main points from memory, then check against your notes. That short window is when
                  the structure of the lecture is still easy to hold. Waiting until the weekend is
                  how small confusions stack into a chapter you no longer understand.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Places */}
        <section id="places" className="mb-16 scroll-mt-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-300">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Places, groups & staff</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 space-y-3 sm:col-span-1">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                <Library className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Use the buildings on purpose</h3>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                The library is not decoration. Quiet rooms are for deep reading; labs and computer
                rooms are for work that needs equipment you may not have at home. Match the place to
                the task. Studying where people only chat will fight you the whole time.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 space-y-3">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                <UsersRound className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Group assignments</h3>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Agree early who does what and when internal drafts are due — not the night before
                the university deadline. Everyone should understand the whole project well enough to
                explain it, even if they own one part. If someone disappears from the work, raise it
                while there is still time to fix the balance, not after grades are locked.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-wisdom-card/90 p-5 space-y-3">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Talking to instructors</h3>
              <p className="text-sm text-wisdom-muted leading-relaxed">
                Specific questions asked early (“I do not follow how we moved from step A to step B”)
                help more than a vague “I am lost” the week of the exam. Notice what they spend time
                on and what they repeat — that is often a clue to emphasis. Feedback on your work is
                information about the next attempt, not a verdict on your worth.
              </p>
            </article>
          </div>
        </section>

        {/* Checklist */}
        <section className="mb-14 rounded-3xl border border-teal-400/20 bg-gradient-to-br from-teal-500/10 via-wisdom-card to-wisdom-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-5 h-5 text-teal-300" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-white">A simple weekly check</h2>
          </div>
          <p className="text-sm text-wisdom-muted mb-5 leading-relaxed">
            You do not need to tick every box every week. Use this as a mirror when the semester
            starts to feel noisy or thin.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              "At least one stretch of real focus away from group chats and open invitations",
              "One genuine conversation or check-in — not only reacting to notifications",
              "Same-day review after the hardest lecture you attended",
              "Studying at least once in a place chosen for the work, not only by habit",
              "An honest look at sleep, mood, and avoidance — reduce load if you are running empty",
              "For any group task, roles and dates written down before the deadline gets close",
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 items-start rounded-xl bg-wisdom-dark/50 border border-white/8 px-4 py-3"
              >
                <Heart className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                <span className="text-wisdom-muted leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-3xl border border-white/10 bg-wisdom-card p-8 md:p-10 text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold mb-3 text-white">
            Campus habits and study skill go together
          </h2>
          <p className="text-wisdom-muted max-w-md mx-auto mb-6 leading-relaxed text-sm sm:text-base">
            How you live among people and places sets how much attention you have left. How you
            study decides what you do with that attention. Use both.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/academy/study-techniques"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-400 text-wisdom-dark font-semibold hover:bg-teal-300 transition-colors"
            >
              Study techniques
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/academy/universities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium hover:border-white/30 transition-colors"
            >
              Universities guide
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-sm font-medium hover:border-white/30 transition-colors"
            >
              Back to Academy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
