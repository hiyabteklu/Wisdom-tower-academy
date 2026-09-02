/**
 * Which packages the signed-in user already owns (enrolled or verified order).
 */
import { listMyEnrollments, listMyOrders } from "@/lib/orders";
import { supabase } from "@/lib/supabase";
import { FREE_FOR_LOGGED_IN_PACKAGE_IDS } from "@/data/packages";

export type OwnershipMap = Set<string>;

let cache: { at: number; ids: OwnershipMap; userId: string | null } | null = null;
const TTL_MS = 30_000;

export function clearOwnershipCache() {
  cache = null;
}

export async function getOwnedPackageIds(force = false): Promise<OwnershipMap> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    if (!userId) {
      cache = null;
      return new Set();
    }

    if (
      !force &&
      cache &&
      cache.userId === userId &&
      Date.now() - cache.at < TTL_MS
    ) {
      return cache.ids;
    }

    const [enrolls, orders] = await Promise.all([
      listMyEnrollments(),
      listMyOrders(),
    ]);

    const ids = new Set<string>();
    for (const e of enrolls || []) {
      if (e.packageId) ids.add(e.packageId);
    }
    for (const o of orders || []) {
      if (o.status === "verified" && o.packageId) ids.add(o.packageId);
    }
    for (const packageId of FREE_FOR_LOGGED_IN_PACKAGE_IDS) {
      ids.add(packageId);
    }

    cache = { at: Date.now(), ids, userId };
    return ids;
  } catch {
    return new Set();
  }
}

export async function isPackageOwned(packageId: string): Promise<boolean> {
  const ids = await getOwnedPackageIds();
  return ids.has(packageId);
}
