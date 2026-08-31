import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGrade,
  getResource,
  grades,
  resourceHubs,
} from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import type { HubId } from "@/lib/content";
import { gradeScope } from "@/lib/content";

export function generateStaticParams() {
  const params: { grade: string; resource: string }[] = [];
  for (const g of grades) {
    for (const r of resourceHubs) {
      params.push({ grade: g.id, resource: r.id });
    }
  }
  return params;
}

export default async function GradeResourcePage({
  params,
}: {
  params: Promise<{ grade: string; resource: string }>;
}) {
  const { grade: gradeId, resource: resourceId } = await params;
  const grade = getGrade(gradeId);
  const resource = getResource(resourceId);

  if (!grade || !resource) notFound();

  const hub = resource.id as HubId;
  const scopePath = gradeScope(grade.id);
  const packageId = grade.id; // grade-9, grade-10, ...
  const trackerScopeId = `grade-${grade.id}-${resource.id}`;

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/grades/${grade.id}`} />

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            {grade.label} · Learning hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={resource.accent}>{resource.name}</span>
          </h1>
          <p className="text-wisdom-muted">{resource.description}</p>
        </div>

        <div className="mb-8">
          <AcademicResultSaver
            scopeId={trackerScopeId}
            scopeLabel={`${grade.label} · ${resource.name}`}
            accent={resource.accent}
            scopePath={scopePath}
            hub={hub}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId={packageId}
          accent={resource.accent}
          trackerScopeId={trackerScopeId}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`/academy/grades/${grade.id}/${h.id}`}
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
