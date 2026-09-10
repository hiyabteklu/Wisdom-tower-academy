/**
 * Which packages the signed-in user already owns
 * (enrollments, verified orders, or admin access grants).
 * ECE Year 3 Semester 1 and Freshman are free for any registered user.
 */
import { listMyEnrollments, listMyOrders } from "@/lib/orders";
import {
  listMyAccessGrants,
  ALL_PACKAGES_ID,
} from "@/lib/access-grants";
import { academyPackages } from "@/data/packages";
import { supabase } from "@/lib/supabase";

export type OwnershipMap = Set<string>;

/** Packages unlocked automatically for every signed-in user (no payment). */
export const FREE_FOR_REGISTERED_PACKAGE_IDS = ["ece-y3-sem-1", "freshman"] as const;

/** Soft-lock flag for UI (landing + academy). Content remains closed until this is flipped. */
export const FRESHMAN_LOCKED_UNTIL_OPENING = false;

let cache: { at: number; ids: OwnershipMap; userId: string | null } | null = null;
const TTL_MS = 30_000;

export function clearOwnershipCache() {
  cache = null;
}

function freePackageSet(): OwnershipMap {
  return new Set<string>(FREE_FOR_REGISTERED_PACKAGE_IDS);
}

function allCatalogIds(): string[] {
  return academyPackages.map((p) => p.id);
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

    // Always grant free packages first — never blocked by enroll/order errors
    const ids = freePackageSet();

    try {
      const [enrolls, orders, grants] = await Promise.all([
        listMyEnrollments(),
        listMyOrders(),
        listMyAccessGrants(),
      ]);

      for (const e of enrolls || []) {
        if (e.packageId === ALL_PACKAGES_ID) {
          for (const id of allCatalogIds()) ids.add(id);
          ids.add(ALL_PACKAGES_ID);
        } else if (e.packageId) {
          ids.add(e.packageId);
        }
      }

      for (const o of orders || []) {
        if (o.status === "verified" && o.packageId) ids.add(o.packageId);
      }

      for (const g of grants || []) {
        if (g.packageId === ALL_PACKAGES_ID) {
          for (const id of allCatalogIds()) ids.add(id);
          ids.add(ALL_PACKAGES_ID);
        } else if (g.packageId) {
          ids.add(g.packageId);
        }
      }
    } catch {
      // keep free packages only
    }

    cache = { at: Date.now(), ids, userId };
    return ids;
  } catch {
    return new Set();
  }
}

export async function isPackageOwned(packageId: string): Promise<boolean> {
  const ids = await getOwnedPackageIds();
  if (ids.has(ALL_PACKAGES_ID)) return true;
  return ids.has(packageId);
}

/** True when this package unlocks for any signed-in user (no payment). */
export function isFreeForRegistered(packageId: string): boolean {
  return (FREE_FOR_REGISTERED_PACKAGE_IDS as readonly string[]).includes(packageId);
}
