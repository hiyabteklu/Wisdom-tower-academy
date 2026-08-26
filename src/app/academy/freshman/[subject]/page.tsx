import { notFound } from "next/navigation";
import Link from "next/link";
import { freshmanSubjects, getFreshmanSubject } from "@/data/freshman";
import CategoryBackButton from "@/components/CategoryBackButton";
import SubjectHeroImage from "@/components/SubjectHeroImage";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import { BookOpen, Construction } from "lucide-react";

export function generateStaticParams() {
  return freshmanSubjects.map((s) => ({ subject: s.id }));
}

export default async function FreshmanSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: subjectId } = await params;
  const subject = getFreshmanSubject(subjectId);

  if (!subject) notFound();

  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-purple-500/25 via-pink-500/10 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy/freshman" />

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up mb-8">
          <div className="relative h-44 sm:h-52 bg-wisdom-navy overflow-hidden border-b border-white/10">
            <SubjectHeroImage src={subject.image} alt={subject.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-wisdom-card via-wisdom-card/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300/80 mb-2">
                Freshman · Subject
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {subject.name}
              </h1>
              <p className="text-wisdom-muted mt-1">{subject.description}</p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Content coming soon</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-8">
              Materials for {subject.name} will appear here. Track every quiz and exam below.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/academy/freshman"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium hover:border-purple-400/40 hover:text-purple-300 transition-colors"
              >
                All freshman subjects
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Request materials
              </Link>
            </div>
          </div>
        </div>

        <AcademicResultSaver
          scopeId={`freshman-${subject.id}`}
          scopeLabel={`Freshman · ${subject.name}`}
          accent="text-purple-400"
        />
      </div>
    </div>
  );
}
