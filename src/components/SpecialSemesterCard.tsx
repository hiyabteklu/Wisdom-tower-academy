"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown } from "lucide-react";
import SafeCoverImage from "@/components/SafeCoverImage";
import AddToCartButton from "@/components/AddToCartButton";
import { getPackage, formatEtb } from "@/data/packages";
import { IS_FREE_MODE } from "@/lib/ownership";
import type { SpecialPackage, SpecialSemester } from "@/data/special-packages";

export default function SpecialSemesterCard({
  pkg,
  sem,
}: {
  pkg: SpecialPackage;
  sem: SpecialSemester;
}) {
  const [expanded, setExpanded] = useState(false);
  const academyPkg = getPackage(sem.packageId);

  const includes = academyPkg?.includes || [
    `All ${sem.courses.length} ${sem.label} engineering courses`,
    "Official Textbooks & Comprehensive Reference Books",
    "Chapter-by-Chapter Short Notes & Key Summaries",
    "Extensive Chapter Question Banks",
    "Mock & Model Practice Exams",
    "All worked with official step-by-step solutions + Explain with AI",
    "Flashcards for rapid active recall",
  ];

  return (
    <div className="card-modern flex flex-col shadow-xl transition-all">
      <Link
        href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
        className="group flex flex-col"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-wisdom-navy">
          <SafeCoverImage src={sem.image} alt={sem.label} />
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex flex-col flex-1 border-t border-white/8 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sem.courses.length} courses</span>
          </div>
          {!IS_FREE_MODE && (
            <span className="font-display font-bold text-cyan-300 text-sm sm:text-base">
              {formatEtb(sem.priceEtb)}
            </span>
          )}
        </div>

        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
          {sem.label}
        </h2>

        {/* Action buttons: What's included + Open */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-pointer"
          >
            <span>What&apos;s included</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                expanded ? "rotate-180 text-cyan-300" : ""
              }`}
            />
          </button>

          <Link
            href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm transition-all text-center"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dedicated package description and includes in expanded drawer */}
        {expanded && (
          <div className="pt-3 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
            {academyPkg?.description && (
              <p className="text-xs text-slate-300 leading-relaxed">
                {academyPkg.description}
              </p>
            )}
            <ul className="space-y-1.5 pt-1">
              {includes.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-xs text-slate-300 leading-snug"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-2">
          <AddToCartButton packageId={sem.packageId} variant="ghost" hideIfAccessible />
        </div>
      </div>
    </div>
  );
}
