import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import { FileCheck2 } from "lucide-react";

export default function ExitExamPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-wisdom-card text-fuchsia-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Academic branch
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-fuchsia-400">Exit Exam</span>
          </h1>
          <p className="text-wisdom-muted text-sm leading-relaxed max-w-lg">
            University exit exam revision tracks and academic wave defense drills.
          </p>
        </div>

        <div className="mb-8">
          <PackageOfferBanner packageId="exit-exam" />
        </div>
      </div>
    </div>
  );
}
