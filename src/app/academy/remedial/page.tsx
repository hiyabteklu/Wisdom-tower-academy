import Link from "next/link";
import { resourceHubs } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  BookOpen,
  Library,
  Video,
  Layers,
  ListChecks,
  ClipboardList,
  ChevronRight,
  Target,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  book: <BookOpen className="w-7 h-7" />,
  library: <Library className="w-7 h-7" />,
  video: <Video className="w-7 h-7" />,
  layers: <Layers className="w-7 h-7" />,
  list: <ListChecks className="w-7 h-7" />,
  clipboard: <ClipboardList className="w-7 h-7" />,
};

export default function RemedialPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-12 md:mb-14 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-wisdom-card text-amber-400">
              <Target className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Catch-up pathway
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-amber-400">Remedial</span> resources
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">
            Strengthen foundations and close learning gaps. Same resource hubs as the grade paths —
            no grade selection required.
          </p>
        </div>

        <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
          {resourceHubs.map((hub) => (
            <Link
              key={hub.id}
              href={`/academy/remedial/${hub.id}`}
              className={`card-3d group relative overflow-hidden rounded-3xl border border-white/12 bg-wisdom-card p-6 md:p-7 hover:border-amber-400/35 shadow-lg ${hub.glow}`}
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
