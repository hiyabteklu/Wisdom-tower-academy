import { Suspense } from "react";
import LearningContent, {
  normalizeToolParam,
  type FeatureKey,
} from "./LearningContent";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

function LearningFallback({ initialTool }: { initialTool?: FeatureKey | null }) {
  const toolName = initialTool
    ? initialTool === "tutor"
      ? "AI Tutor"
      : initialTool === "calculator"
        ? "Scientific Calculator"
        : initialTool === "timer"
          ? "Focus Timer"
          : initialTool === "planner"
            ? "Study Planner"
            : initialTool === "notes"
              ? "Scholar Notebook"
              : "Study Tool"
    : "Learning Suite";

  return (
    <div className="relative min-h-[85vh] pb-16 bg-[#050811] text-[#f4f7fb] flex flex-col justify-center items-center px-4">
      <div className="p-6 rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl shadow-2xl text-center max-w-sm w-full mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mx-auto shadow-md">
          <Sparkles className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Opening {toolName}…
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Loading Wisdom Tower scholar workspace
          </p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawTool =
    (typeof params?.tool === "string" ? params.tool : null) ||
    (typeof params?.tab === "string" ? params.tab : null) ||
    (typeof params?.feature === "string" ? params.feature : null);
  const initialTool = normalizeToolParam(rawTool);

  return (
    <Suspense fallback={<LearningFallback initialTool={initialTool} />}>
      <LearningContent initialTool={initialTool} />
    </Suspense>
  );
}
