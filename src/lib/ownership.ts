/**
 * Which packages the signed-in user already owns (enrolled or verified order).
 * Freshman and ECE Year 3 Semester 1 are free for any registered (signed-in) user.
 */
import { listMyEnrollments, listMyOrders } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

export type OwnershipMap = Set<string>;

/** Packages unlocked automatically for every signed-in user (no payment). */
export const FREE_FOR_REGISTERED_PACKAGE_IDS = ["freshman", "ece-y3-sem-1"] as const;

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
    // Free for all registered users
    for (const id of FREE_FOR_REGISTERED_PACKAGE_IDS) {
      ids.add(id);
    }
    for (const e of enrolls || []) {
      if (e.packageId) ids.add(e.packageId);
    }
    for (const o of orders || []) {
      if (o.status === "verified" && o.packageId) ids.add(o.packageId);
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
