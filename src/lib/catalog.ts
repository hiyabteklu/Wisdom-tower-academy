/**
 * Admin catalog — Supabase catalog_items + static fallback from packages.ts
 */
import { supabase } from "@/lib/supabase";
import {
  academyPackages,
  getPackage as getStaticPackage,
  type AcademyPackage,
} from "@/data/packages";

export type CatalogRow = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  price_etb: number;
  href: string;
  image: string;
  includes: string[];
  enrolled_label: string;
  group_key: "grades" | "branch" | "special" | "custom";
  active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type CatalogInput = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  priceEtb: number;
  href: string;
  image: string;
  includes: string[];
  enrolledLabel: string;
  group: "grades" | "branch" | "special" | "custom";
  active: boolean;
  sortOrder: number;
};

/** Client-side cache for cart / getPackageResolved */
let runtimeCatalog: AcademyPackage[] | null = null;

export function setRuntimeCatalog(list: AcademyPackage[]) {
  runtimeCatalog = list;
}

export function getRuntimeCatalog(): AcademyPackage[] | null {
  return runtimeCatalog;
}

export function rowToPackage(row: CatalogRow): AcademyPackage {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name || row.name,
    description: row.description || "",
    priceEtb: Number(row.price_etb) || 0,
    href: row.href || "/packages",
    image: row.image || "",
    includes: Array.isArray(row.includes) ? row.includes : [],
    enrolledLabel: row.enrolled_label || "",
    group: (row.group_key === "custom" ? "branch" : row.group_key) as AcademyPackage["group"],
  };
}

export function packageToInput(p: AcademyPackage, sortOrder = 100): CatalogInput {
  return {
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    description: p.description,
    priceEtb: p.priceEtb,
    href: p.href,
    image: p.image,
    includes: p.includes,
    enrolledLabel: p.enrolledLabel,
    group: p.group,
    active: true,
    sortOrder,
  };
}

/** Resolve package for cart/checkout: runtime catalog → static */
export function getPackageResolved(id: string): AcademyPackage | undefined {
  if (runtimeCatalog) {
    const found = runtimeCatalog.find((p) => p.id === id);
    if (found) return found;
  }
  return getStaticPackage(id);
}

export async function listCatalogItems(opts?: {
  includeInactive?: boolean;
}): Promise<{ rows: CatalogRow[]; error?: string }> {
  try {
    let q = supabase.from("catalog_items").select("*").order("sort_order", { ascending: true });
    if (!opts?.includeInactive) {
      q = q.eq("active", true);
    }
    const { data, error } = await q;
    if (error) {
      console.warn("[catalog]", error.message);
      return { rows: [], error: error.message };
    }
    return { rows: (data || []) as CatalogRow[] };
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Public list as AcademyPackage[]; falls back to static if table empty/missing */
export async function listSellablePackages(): Promise<AcademyPackage[]> {
  const { rows, error } = await listCatalogItems({ includeInactive: false });
  if (error || rows.length === 0) {
    const list = [...academyPackages];
    setRuntimeCatalog(list);
    return list;
  }
  const list = rows.map(rowToPackage);
  setRuntimeCatalog(list);
  return list;
}

export async function listAllCatalogForAdmin(): Promise<{
  rows: CatalogRow[];
  error?: string;
}> {
  return listCatalogItems({ includeInactive: true });
}

export async function upsertCatalogItem(
  input: CatalogInput
): Promise<{ ok: boolean; error?: string }> {
  const id = input.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
  if (!id || !input.name.trim()) {
    return { ok: false, error: "ID and name are required" };
  }

  const payload = {
    id,
    name: input.name.trim(),
    short_name: input.shortName.trim() || input.name.trim(),
    description: input.description.trim(),
    price_etb: Number(input.priceEtb) || 0,
    href: input.href.trim() || "/packages",
    image: input.image.trim() || "",
    includes: input.includes.filter(Boolean),
    enrolled_label: input.enrolledLabel.trim(),
    group_key: input.group,
    active: input.active,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("catalog_items").upsert(payload, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteCatalogItem(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("catalog_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Insert static academyPackages into catalog if table is empty */
export async function seedCatalogFromStatic(): Promise<{
  ok: boolean;
  count: number;
  error?: string;
}> {
  const { rows, error: listErr } = await listCatalogItems({ includeInactive: true });
  if (listErr) {
    return { ok: false, count: 0, error: listErr };
  }
  if (rows.length > 0) {
    return { ok: true, count: 0, error: "Catalog already has items — seed skipped" };
  }

  let n = 0;
  for (let i = 0; i < academyPackages.length; i++) {
    const p = academyPackages[i];
    const res = await upsertCatalogItem(packageToInput(p, (i + 1) * 10));
    if (res.ok) n++;
    else return { ok: false, count: n, error: res.error };
  }
  return { ok: true, count: n };
}
