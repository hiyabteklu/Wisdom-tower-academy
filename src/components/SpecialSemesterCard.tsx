"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Info } from "lucide-react";
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

  const description =
    academyPkg?.description ||
    `Senior Electrical and Computer Engineering, ${sem.label}. Course material written for your department with chapter question banks, flashcards, and official solved exams.`;

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

      <div className="p-5 border-t border-white/8 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-2">
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

        <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-2">
          {sem.label}
        </h2>

        <p
          className={`text-xs sm:text-sm text-wisdom-muted leading-relaxed mb-3 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {description}
        </p>

        {/* Collapsible About Button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/[0.05] text-slate-200 hover:bg-white/[0.1] hover:border-white/20 transition-all my-2 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            {expanded ? "Hide Details" : "About & What's Included"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              expanded ? "rotate-180 text-cyan-300" : ""
            }`}
          />
        </button>

        {/* Collapsible Detailed Bullets */}
        {expanded && (
          <div className="space-y-2 mb-4 pt-3 border-t border-white/6 animate-in fade-in duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Everything Included in {sem.label}:
            </p>
            <ul className="space-y-2">
              {includes.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 text-xs sm:text-sm text-slate-300/90 leading-snug"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-3 space-y-2.5">
          <Link
            href={`/academy/special-packages/${pkg.slug}/${sem.id}`}
            className="btn-primary w-full text-center"
          >
            <span>Open {sem.label}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <AddToCartButton packageId={sem.packageId} variant="ghost" />
        </div>
      </div>
    </div>
  );
}
