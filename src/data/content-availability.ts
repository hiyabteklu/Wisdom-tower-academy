/**
 * Live vs uploading + purchase gates.
 *
 * Purchasable now: Freshman (300 ETB) + ECE special packages.
 * Freshman: everyone browses subjects + 6 hubs; opening a hub needs ownership.
 * One Freshman purchase unlocks ALL subjects’ hubs.
 * Other pathways: explore until hubs → “coming soon” modal (not for sale yet).
 */

export const PURCHASABLE_PACKAGE_IDS = new Set([
  "freshman",
  "ece-y3-full",
  "ece-y3-sem-1",
  "ece-y3-sem-2",
]);

export type HubLockMode = "open" | "require_purchase" | "coming_soon";

export function isSpecialPackagePath(pathnameOrBase: string): boolean {
  return pathnameOrBase.includes("/special-packages");
}

export function isPackagePurchasable(packageId: string): boolean {
  return PURCHASABLE_PACKAGE_IDS.has(packageId);
}

/** Whole freshman catalog is live (not “uploading”). */
export function isFreshmanSubjectReady(_subjectId: string): boolean {
  return true;
}

/**
 * Which package(s) unlock hubs under this path.
 * Freshman path → only "freshman".
 * ECE → semester package and/or full year.
 */
export function unlockPackageIdsForPath(basePath: string): string[] {
  if (basePath.includes("/academy/freshman")) {
    return ["freshman"];
  }
  if (basePath.includes("/special-packages/electrical-computer-engineering")) {
    if (basePath.includes("/sem-1")) return ["ece-y3-sem-1", "ece-y3-full"];
    if (basePath.includes("/sem-2")) return ["ece-y3-sem-2", "ece-y3-full"];
    return ["ece-y3-full", "ece-y3-sem-1", "ece-y3-sem-2"];
  }
  return [];
}

export function getHubLockMode(basePath: string): HubLockMode {
  if (basePath.includes("/academy/freshman")) return "require_purchase";
  if (isSpecialPackagePath(basePath)) return "require_purchase";
  // Grades, UAT, GAT, COC, Exit Exam — content still uploading
  return "coming_soon";
}

/** @deprecated use getHubLockMode — kept for older call sites */
export function areHubsReady(basePath: string): boolean {
  return getHubLockMode(basePath) === "open";
}

export const COMING_SOON_TITLE = "Resources are being uploaded";
export const COMING_SOON_BODY =
  "This learning hub is almost ready. Check back soon — we’re adding books, videos, flashcards, and practice materials.";

export const PURCHASE_TITLE = "Purchase required";
export const PURCHASE_BODY_FRESHMAN =
  "Unlock all Freshman subjects with one package. After payment is verified, every subject’s books, flashcards, videos, and more open for you.";
