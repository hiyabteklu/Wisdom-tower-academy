import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import UatIntroduction from "@/components/uat/UatIntroduction";
import { Award } from "lucide-react";

export default function UatPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-wisdom-card text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-wisdom-muted">
              Academic branch
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span className="text-emerald-400">UAT</span> resources
          </h1>
          <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed mx-auto sm:mx-0">
            Quantitative and Verbal reasoning under time constraint. Architecture, practice hubs, and
            result tracking in one place.
          </p>
        </div>

        <div className="max-w-2xl mx-auto sm:mx-0 mb-8">
          <PackageOfferBanner packageId="uat" />
        </div>

        {/* Authoritative introduction — architecture of the exam */}
        <UatIntroduction />

        <div className="max-w-2xl mx-auto sm:mx-0">
          <BranchLeaderboard branchName="UAT" accent="text-emerald-400" />
        </div>

        <div className="max-w-2xl mx-auto sm:mx-0 mb-12">
          <AcademicResultSaver scopeId="uat" scopeLabel="UAT" accent="text-emerald-400" />
        </div>

        <p className="text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted mb-4 text-center sm:text-left">
          Learning hubs
        </p>

        <ResourceHubGrid basePath="/academy/uat" />
      </div>
    </div>
  );
}
