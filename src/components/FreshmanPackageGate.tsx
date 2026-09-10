"use client";

import { useEffect, useState, type ReactNode } from "react";
import FreshmanLockedPanel from "@/components/FreshmanLockedPanel";
import {
  resolveEffectiveLock,
  toHubLockMode,
} from "@/lib/content-locks";
import { FRESHMAN_LOCKED_UNTIL_OPENING } from "@/lib/ownership";

/**
 * Wraps Freshman pages: respects admin content_locks for package:freshman,
 * falling back to the static FRESHMAN_LOCKED_UNTIL_OPENING flag.
 */
export default function FreshmanPackageGate({
  children,
  showBack = true,
}: {
  children: ReactNode;
  showBack?: boolean;
}) {
  const [closed, setClosed] = useState<boolean | null>(
    FRESHMAN_LOCKED_UNTIL_OPENING ? true : null
  );

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const dyn = await resolveEffectiveLock({ packageId: "freshman" });
      const mode = toHubLockMode(dyn.mode);
      if (cancelled) return;
      if (mode === "coming_soon" || dyn.mode === "locked") {
        setClosed(true);
      } else if (mode === "open" || mode === "require_purchase") {
        setClosed(false);
      } else {
        setClosed(FRESHMAN_LOCKED_UNTIL_OPENING);
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (closed === null) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (closed) {
    return <FreshmanLockedPanel showBack={showBack} />;
  }

  return <>{children}</>;
}
