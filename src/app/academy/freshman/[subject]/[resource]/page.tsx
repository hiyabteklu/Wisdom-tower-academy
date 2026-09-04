import { notFound, redirect } from "next/navigation";
import {
  freshmanSubjects,
  getFreshmanSubject,
  FRESHMAN_SUBJECT_ALIASES,
} from "@/data/freshman";
import { getResource, resourceHubs } from "@/data/academy";
import FreshmanLockedPanel from "@/components/FreshmanLockedPanel";
import { FRESHMAN_LOCKED_UNTIL_OPENING } from "@/lib/ownership";
import CategoryBackButton from "@/components/CategoryBackButton";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import HubContentView from "@/components/learning/HubContentView";
import type { HubId } from "@/lib/content";
import Link from "next/link";

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
  if (FRESHMAN_LOCKED_UNTIL_OPENING) {
    return <FreshmanLockedPanel />;
  }

  const { subject: subjectId, resource: resourceId } = await params;

  if (FRESHMAN_SUBJECT_ALIASES[subjectId]) {
    redirect(
      `/academy/freshman/${FRESHMAN_SUBJECT_ALIASES[subjectId]}/${resourceId}`
    );
  }

  const subject = getFreshmanSubject(subjectId);
  const resource = getResource(resourceId);

  if (!subject || !resource) notFound();

  const hub = resource.id as HubId;
  const scopePath = `freshman/${subject.id}`;
  const trackerScopeId = `freshman-${subject.id}-${resource.id}`;

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
            scopeId={trackerScopeId}
            scopeLabel={`Freshman · ${subject.name} · ${resource.name}`}
            accent={resource.accent}
            scopePath={scopePath}
            hub={hub}
          />
        </div>

        <HubContentView
          scopePath={scopePath}
          hub={hub}
          packageId="freshman"
          accent={resource.accent}
          trackerScopeId={trackerScopeId}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {resourceHubs.map((h) => (
            <Link
              key={h.id}
              href={`/academy/freshman/${subject.id}/${h.id}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                h.id === resource.id
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 text-wisdom-muted hover:border-white/20 hover:text-white"
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
