/**
 * Simple cart: list of package ids in localStorage.
 * One entry per package (no quantity mess).
 */

import { academyPackages, getPackage, type AcademyPackage } from "@/data/packages";

const KEY = "wt_cart_v1";
export const CART_EVENT = "wt-cart-change";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((id) => Boolean(getPackage(id))) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCartIds(): string[] {
  return readIds();
}

export function getCartPackages(): AcademyPackage[] {
  return readIds()
    .map((id) => getPackage(id))
    .filter((p): p is AcademyPackage => Boolean(p));
}

export function cartCount(): number {
  return readIds().length;
}

export function isInCart(packageId: string): boolean {
  return readIds().includes(packageId);
}

/** Returns true if newly added, false if already present */
export function addToCart(packageId: string): boolean {
  if (!getPackage(packageId)) return false;
  const ids = readIds();
  if (ids.includes(packageId)) return false;
  writeIds([...ids, packageId]);
  return true;
}

export function removeFromCart(packageId: string) {
  writeIds(readIds().filter((id) => id !== packageId));
}

export function clearCart() {
  writeIds([]);
}

export function cartTotalEtb(): number {
  return getCartPackages().reduce((sum, p) => sum + p.priceEtb, 0);
}

/** All sellable packages (for validation) */
export function allPackageIds(): string[] {
  return academyPackages.map((p) => p.id);
}
