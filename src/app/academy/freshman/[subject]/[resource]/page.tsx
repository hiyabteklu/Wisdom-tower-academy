import { notFound } from "next/navigation";
import Link from "next/link";
import { freshmanSubjects, getFreshmanSubject } from "@/data/freshman";
import { getResource, resourceHubs, type ResourceType } from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import type { HubId } from "@/lib/content";

export function generateStaticParams() {
  const params: { subject: string; resource: string }[] = [];
  for (const s of freshmanSubjects) {
    for (const r of resourceHubs) {
      params.push({ subject: s.id, resource: r.id });
    }
  }
  return params;
}

export default async function FreshmanSubjectResourcePage({
  params,
}: {
  params: Promise<{ subject: string; resource: string }>;
}) {
  const { subject: subjectId, resource: resourceId } = await params;
  const subject = getFreshmanSubject(subjectId);
  const resource = getResource(resourceId);

  if (!subject || !resource) notFound();

  const hub = resource.id as HubId;
  const scopePath = `freshman/${subject.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/freshman/${subject.id}`} />

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            Freshman · {subject.name} · Learning hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={`freshman-${subject.id}-${resource.id}`}
            scopeLabel={`Freshman · ${subject.name} · ${resource.name}`}
            accent={resource.accent}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId="freshman"
          accent={resource.accent}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`/academy/freshman/${subject.id}/${h.id}`}
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
