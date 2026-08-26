import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getGrade,
  getResource,
  grades,
  resourceHubs,
} from "@/data/academy";
import CategoryBackButton from "@/components/CategoryBackButton";
import { BookOpen, Construction } from "lucide-react";

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

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${grade.gradient}`} />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback={`/academy/grades/${grade.id}`} />

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up">
          <div className={`px-6 sm:px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-br ${grade.gradient}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
              {grade.label} · Learning hub
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              <span className={resource.accent}>{resource.name}</span>
            </h1>
            <p className="text-wisdom-muted">{resource.description}</p>
          </div>

          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Content coming soon</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-8">
              We&apos;re preparing {resource.name.toLowerCase()} for {grade.label}. The structure is
              ready — materials will appear here as they are published.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/academy/grades/${grade.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium hover:border-wisdom-cyan/40 hover:text-wisdom-cyan transition-colors"
              >
                All hubs for {grade.label}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold hover:bg-wisdom-cyan-dark transition-colors"
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
