/**
 * Simple cart: list of package ids in localStorage.
 * Resolves products via catalog runtime cache, then static packages.
 */

import { academyPackages, type AcademyPackage } from "@/data/packages";
import { getPackageResolved, getRuntimeCatalog } from "@/lib/catalog";

const KEY = "wt_cart_v1";
export const CART_EVENT = "wt-cart-change";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
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
    .map((id) => getPackageResolved(id))
    .filter((p): p is AcademyPackage => Boolean(p));
}

export function cartCount(): number {
  return readIds().length;
}

export function isInCart(packageId: string): boolean {
  return readIds().includes(packageId);
}

export function addToCart(packageId: string): boolean {
  if (!getPackageResolved(packageId)) return false;
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

export function allPackageIds(): string[] {
  const runtime = getRuntimeCatalog();
  if (runtime?.length) return runtime.map((p) => p.id);
  return academyPackages.map((p) => p.id);
}
