"use client";

import { useEffect, useState } from "react";
import { resourceHubs } from "@/data/academy";
import ResourceHubCard from "@/components/ResourceHubCard";
import {
  getHubLockMode,
  unlockPackageIdsForPath,
} from "@/data/content-availability";
import { getOwnedPackageIds } from "@/lib/ownership";
import { supabase } from "@/lib/supabase";

type Props = {
  /** Path prefix without trailing slash, e.g. /academy/freshman/mathematics */
  basePath: string;
};

export default function ResourceHubGrid({ basePath }: Props) {
  const lockMode = getHubLockMode(basePath);
  const unlockIds = unlockPackageIdsForPath(basePath);
  const purchasePackageId = unlockIds[0] || "freshman";

  const [owned, setOwned] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (lockMode === "open") {
        if (!cancelled) setOwned(true);
        return;
      }
      if (lockMode === "coming_soon") {
        if (!cancelled) setOwned(false);
        return;
      }
      // require_purchase
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) setOwned(false);
        return;
      }
      const ids = await getOwnedPackageIds();
      const has = unlockIds.some((id) => ids.has(id));
      if (!cancelled) setOwned(has);
    }

    void check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void check();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [basePath, lockMode, unlockIds.join(",")]);

  return (
    <div className="perspective-scene grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 stagger-children">
      {resourceHubs.map((hub) => (
        <ResourceHubCard
          key={hub.id}
          hub={hub}
          href={`${basePath}/${hub.id}`}
          owned={owned}
          lockMode={lockMode}
          purchasePackageId={purchasePackageId}
        />
      ))}
    </div>
  );
}
