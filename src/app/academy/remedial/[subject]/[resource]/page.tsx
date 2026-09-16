import { notFound } from "next/navigation";
import Link from "next/link";
import { getResource, resourceHubs } from "@/data/academy";
import { getRemedialSubject, remedialSubjects } from "@/data/remedial";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import { BookOpen, Construction } from "lucide-react";

export function generateStaticParams() {
  const params: { subject: string; resource: string }[] = [];
  for (const s of remedialSubjects) {
    for (const r of resourceHubs) {
      params.push({ subject: s.id, resource: r.id });
    }
  }
  return params;
}

export default async function RemedialSubjectResourcePage({
  params,
}: {
  params: Promise<{ subject: string; resource: string }>;
}) {
  const { subject: subjectId, resource: resourceId } = await params;
  const subject = getRemedialSubject(subjectId);
  const resource = getResource(resourceId);

  if (!subject || !resource) notFound();

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/remedial/${subject.id}`} />

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            Remedial · {subject.name} · Learning hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={`remedial-${subject.id}-${resource.id}`}
            scopeLabel={`Remedial · ${subject.name} · ${resource.name}`}
            accent={resource.accent}
          />
        </div>

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up">
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Content coming soon</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-8">
              Remedial {subject.name} · {resource.name.toLowerCase()} materials will appear here.
              Track scores above.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/academy/remedial/${subject.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium hover:border-amber-400/40 hover:text-amber-400 transition-colors"
              >
                All hubs for {subject.name}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold hover:bg-amber-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Request materials
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`/academy/remedial/${subject.id}/${h.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                h.id === resource.id
                  ? `${h.accent} border-current bg-white/5`
                  : "border-white/10 text-wisdom-muted hover:border-white/20"
              }`}
            >
              {h.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
