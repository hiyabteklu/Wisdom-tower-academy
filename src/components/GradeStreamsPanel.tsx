"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { subjectsForGrade } from "@/data/grade-subjects";
import GradeSubjectIcon from "@/components/GradeSubjectIcon";

export default function GradeStreamsPanel({ gradeId }: { gradeId: string }) {
  const subjects = subjectsForGrade(gradeId);

  return (
    <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
      {subjects.map((sub) => (
        <Link
          key={sub.id}
          href={`/academy/grades/${gradeId}/${sub.id}`}
          className="card-3d group flex items-start gap-3.5 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-4 sm:px-5 sm:py-4.5 hover:border-sky-400/35 transition-colors shadow-lg"
        >
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-400/10 text-sky-300">
            <GradeSubjectIcon name={sub.icon} className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm sm:text-base leading-snug group-hover:text-sky-100 transition-colors">
              {sub.name}
            </p>
            {sub.hint ? (
              <p className="text-xs text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
                {sub.hint}
              </p>
            ) : null}
            <span className="mt-2.5 inline-flex items-center gap-0.5 text-xs font-semibold text-sky-400">
              Open hubs
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
