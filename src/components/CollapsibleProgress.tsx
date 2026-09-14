"use client";

import { Activity } from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";
import AcademicResultSaver from "@/components/AcademicResultSaver";

export default function CollapsibleProgress({
  scopeId,
  scopeLabel,
  accent,
}: {
  scopeId: string;
  scopeLabel: string;
  accent?: string;
}) {
  return (
    <CollapsibleSection
      title="Progress tracker"
      subtitle={scopeLabel}
      icon={<Activity className="w-5 h-5 text-cyan-300" />}
      defaultOpen={false}
    >
      <AcademicResultSaver scopeId={scopeId} scopeLabel={scopeLabel} accent={accent} />
    </CollapsibleSection>
  );
}
