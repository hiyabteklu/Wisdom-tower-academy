/**
 * Live vs uploading + purchase gates.
 *
 * Purchasable: Freshman (300) + ECE Semester 1 only (300).
 * ECE Semester 2 = coming soon (not for sale).
 * No full-year ECE package.
 */

export const PURCHASABLE_PACKAGE_IDS = new Set([
  "freshman",
  "ece-y3-sem-1",
]);

export type HubLockMode = "open" | "require_purchase" | "coming_soon";

export function isSpecialPackagePath(pathnameOrBase: string): boolean {
  return pathnameOrBase.includes("/special-packages");
}

export function isPackagePurchasable(packageId: string): boolean {
  return PURCHASABLE_PACKAGE_IDS.has(packageId);
}

export function isFreshmanSubjectReady(_subjectId: string): boolean {
  return true;
}

export function unlockPackageIdsForPath(basePath: string): string[] {
  if (basePath.includes("/academy/freshman")) {
    return ["freshman"];
  }
  if (basePath.includes("/special-packages/electrical-computer-engineering")) {
    if (basePath.includes("/sem-1")) return ["ece-y3-sem-1"];
    // sem-2 not sellable yet
    return [];
  }
  return [];
}

export function getHubLockMode(basePath: string): HubLockMode {
  if (basePath.includes("/academy/freshman")) return "require_purchase";
  if (basePath.includes("/special-packages") && basePath.includes("/sem-1")) {
    return "require_purchase";
  }
  if (basePath.includes("/special-packages") && basePath.includes("/sem-2")) {
    return "coming_soon";
  }
  if (isSpecialPackagePath(basePath)) return "coming_soon";
  return "coming_soon";
}

export function areHubsReady(basePath: string): boolean {
  return getHubLockMode(basePath) === "open";
}

export const COMING_SOON_TITLE = "Resources are being uploaded";
export const COMING_SOON_BODY =
  "This learning hub is almost ready. Check back soon — we’re adding books, videos, flashcards, and practice materials.";

export const PURCHASE_TITLE = "Purchase required";
export const PURCHASE_BODY_FRESHMAN =
  "Unlock all Freshman subjects with one package. After payment is verified, every subject’s books, flashcards, videos, and more open for you.";
