import Link from "next/link";
import { resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import {
  BookOpen,
  Library,
  Video,
  Layers,
  ListChecks,
  ClipboardList,
  ChevronRight,
  FileText,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen className="w-7 h-7" />,
  library: <Library className="w-7 h-7" />,
  video: <Video className="w-7 h-7" />,
  layers: <Layers className="w-7 h-7" />,
  list: <ListChecks className="w-7 h-7" />,
  clipboard: <ClipboardList className="w-7 h-7" />,
};

export default function ExitExamPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-fuchsia-500/20 via-pink-500/5 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-wisdom-card text-fuchsia-400">
              <FileText className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Academic branch
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-fuchsia-400">Exit Exam</span> resources
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            University exit exam preparation with structured review and practice tests.
          </p>
        </div>

        <div className="max-w-3xl mb-8">
          <PackageOfferBanner packageId="exit-exam" />
        </div>

        <div className="max-w-3xl">
          <BranchLeaderboard branchName="Exit Exam" accent="text-fuchsia-400" />
        </div>

        <div className="max-w-3xl mb-12">
          <AcademicResultSaver
            scopeId="exit-exam"
            scopeLabel="Exit Exam"
            accent="text-fuchsia-400"
          />
        </div>

        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-4">
          Learning hubs
        </p>

        <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
          {resourceHubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/academy/exit-exam/${hub.id}`}
              className={`card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card p-6 md:p-7 hover:border-fuchsia-400/35 shadow-lg ${hub.glow}`}
            >
              <div
                className={`mb-5 inline-flex p-3.5 rounded-2xl border border-white/10 bg-wisdom-dark/60 ${hub.accent}`}
              >
                {iconMap[hub.icon]}
              </div>
              <h2 className="font-display text-xl font-bold mb-2 group-hover:text-white transition-colors">
                {hub.name}
              </h2>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-5">{hub.description}</p>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${hub.accent}`}>
                Open
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
