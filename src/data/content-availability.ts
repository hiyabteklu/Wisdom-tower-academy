/**
 * What is live vs still uploading.
 *
 * Purchasable now: Freshman package + ECE special packages.
 * Explore allowed everywhere; resource hubs (books, flashcards, …) open only
 * where content is marked ready — otherwise a coming-soon modal.
 */

/** Packages users may add to cart / checkout */
export const PURCHASABLE_PACKAGE_IDS = new Set([
  "freshman",
  "ece-y3-full",
  "ece-y3-sem-1",
  "ece-y3-sem-2",
]);

/** Freshman subjects with full hub access (top card = Mathematics) */
export const READY_FRESHMAN_SUBJECT_IDS = new Set(["mathematics"]);

/** Special-package tracks are treated as ready for exploration + purchase */
export function isSpecialPackagePath(pathnameOrBase: string): boolean {
  return pathnameOrBase.includes("/special-packages");
}

export function isPackagePurchasable(packageId: string): boolean {
  return PURCHASABLE_PACKAGE_IDS.has(packageId);
}

/** Resource hub pages under this basePath are clickable (not modal-locked). */
export function areHubsReady(basePath: string): boolean {
  if (isSpecialPackagePath(basePath)) return true;

  // /academy/freshman/mathematics → ready
  const m = basePath.match(/^\/academy\/freshman\/([^/]+)/);
  if (m) return READY_FRESHMAN_SUBJECT_IDS.has(m[1]);

  // grades, uat, gat, coc, exit-exam, remedial, freshman root hubs, etc.
  return false;
}

export function isFreshmanSubjectReady(subjectId: string): boolean {
  return READY_FRESHMAN_SUBJECT_IDS.has(subjectId);
}

export const COMING_SOON_TITLE = "Resources are being uploaded";
export const COMING_SOON_BODY =
  "This learning hub is almost ready. Check back soon — we’re adding books, videos, flashcards, and practice materials.";
