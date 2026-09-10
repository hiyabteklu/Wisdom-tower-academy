"use client";

import { useEffect, useState } from "react";
import { resourceHubs } from "@/data/academy";
import ResourceHubCard from "@/components/ResourceHubCard";
import {
  getHubLockMode,
  unlockPackageIdsForPath,
  type HubLockMode,
} from "@/data/content-availability";
import { getOwnedPackageIds } from "@/lib/ownership";
import {
  resolveEffectiveLock,
  toHubLockMode,
} from "@/lib/content-locks";
import { supabase } from "@/lib/supabase";

type Props = {
  /** Path prefix without trailing slash, e.g. /academy/freshman/mathematics */
  basePath: string;
  /** Optional package id override for lock resolution */
  packageId?: string;
  /** Optional scope path override (e.g. freshman/math-natural) */
  scopePath?: string;
};

function inferPackageAndScope(basePath: string): {
  packageId?: string;
  scopePath?: string;
} {
  const unlockIds = unlockPackageIdsForPath(basePath);
  let packageId = unlockIds[0];
  let scopePath: string | undefined;

  // /academy/freshman/{subject}
  const fresh = basePath.match(/\/academy\/freshman\/([^/]+)/);
  if (fresh) {
    packageId = packageId || "freshman";
    scopePath = `freshman/${fresh[1]}`;
  }

  // /academy/special-packages/.../sem-1/{course}
  const ece = basePath.match(
    /\/special-packages\/electrical-computer-engineering\/(sem-[12])\/([^/]+)/
  );
  if (ece) {
    packageId =
      packageId || (ece[1] === "sem-1" ? "ece-y3-sem-1" : "ece-y3-sem-2");
    scopePath = `ece/${ece[1]}/${ece[2]}`;
  }

  return { packageId, scopePath };
}

export default function ResourceHubGrid({
  basePath,
  packageId: packageIdProp,
  scopePath: scopePathProp,
}: Props) {
  const inferred = inferPackageAndScope(basePath);
  const packageId = packageIdProp || inferred.packageId;
  const scopePath = scopePathProp || inferred.scopePath;

  const staticMode = getHubLockMode(basePath);
  const unlockIds = unlockPackageIdsForPath(basePath);
  const purchasePackageId = unlockIds[0] || packageId || "freshman";

  const [lockMode, setLockMode] = useState<HubLockMode>(staticMode);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveMode() {
      const dyn = await resolveEffectiveLock({
        packageId,
        scopePath,
      });
      const mapped = toHubLockMode(dyn.mode);
      if (!cancelled) {
        setLockMode(mapped ?? staticMode);
      }
    }

    void resolveMode();
    return () => {
      cancelled = true;
    };
  }, [packageId, scopePath, staticMode]);

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
