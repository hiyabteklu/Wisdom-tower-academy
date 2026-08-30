"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAllCatalogForAdmin,
  upsertCatalogItem,
  deleteCatalogItem,
  seedCatalogFromStatic,
  packageToInput,
  type CatalogRow,
  type CatalogInput,
} from "@/lib/catalog";
import { academyPackages, formatEtb } from "@/data/packages";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Save,
  X,
  Database,
} from "lucide-react";

const EMPTY: CatalogInput = {
  id: "",
  name: "",
  shortName: "",
  description: "",
  priceEtb: 500,
  href: "/packages",
  image: "",
  includes: [""],
  enrolledLabel: "",
  group: "custom",
  active: true,
  sortOrder: 200,
};

function rowToInput(row: CatalogRow): CatalogInput {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    priceEtb: Number(row.price_etb),
    href: row.href,
    image: row.image,
    includes: row.includes?.length ? row.includes : [""],
    enrolledLabel: row.enrolled_label,
    group: row.group_key,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export default function CatalogPanel() {
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CatalogInput | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAllCatalogForAdmin();
    if (res.error) {
      setError(
        res.error.includes("relation") || res.error.includes("does not exist")
          ? "Table missing — run docs/catalog-setup.sql in Supabase SQL Editor."
          : res.error
      );
      setRows([]);
    } else {
      setRows(res.rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function openNew() {
    setIsNew(true);
    setEditing({ ...EMPTY, id: `custom-${Date.now().toString(36)}` });
  }

  function openEdit(row: CatalogRow) {
    setIsNew(false);
    setEditing(rowToInput(row));
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await upsertCatalogItem(editing);
    setSaving(false);
    if (!res.ok) {
      setToast(res.error || "Save failed");
      return;
    }
    setToast(isNew ? "Product added" : "Product updated");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm(`Delete catalog item “${id}”? This cannot be undone.`)) return;
    setBusyId(id);
    const res = await deleteCatalogItem(id);
    setBusyId("");
    if (!res.ok) {
      setToast(res.error || "Delete failed");
      return;
    }
    setToast("Deleted");
    if (editing?.id === id) setEditing(null);
    load();
  }

  async function seed() {
    setSaving(true);
    const res = await seedCatalogFromStatic();
    setSaving(false);
    if (!res.ok) {
      setToast(res.error || "Seed failed");
      return;
    }
    setToast(
      res.count > 0
        ? `Seeded ${res.count} packages from code defaults`
        : res.error || "Already seeded"
    );
    load();
  }

  function setField<K extends keyof CatalogInput>(key: K, value: CatalogInput[K]) {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Catalog
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            Add, edit, or remove sellable packages · {rows.length} items
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={seed}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
            title="Copy static packages into the database (only if empty)"
          >
            <Database className="w-4 h-4" />
            Seed defaults
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold hover:bg-amber-400"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>
      </div>

      {editing && (
        <div className="rounded-2xl border border-amber-400/30 bg-wisdom-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white">{isNew ? "New product" : "Edit product"}</h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="p-2 rounded-lg border border-white/10 text-wisdom-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs text-wisdom-muted">
              ID (slug, unique)
              <input
                value={editing.id}
                disabled={!isNew}
                onChange={(e) => setField("id", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white disabled:opacity-60"
                placeholder="grade-9"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Group
              <select
                value={editing.group}
                onChange={(e) =>
                  setField("group", e.target.value as CatalogInput["group"])
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              >
                <option value="grades">grades</option>
                <option value="branch">branch</option>
                <option value="special">special</option>
                <option value="custom">custom</option>
              </select>
            </label>
            <label className="block text-xs text-wisdom-muted sm:col-span-2">
              Name
              <input
                value={editing.name}
                onChange={(e) => setField("name", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Short name
              <input
                value={editing.shortName}
                onChange={(e) => setField("shortName", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Price (ETB)
              <input
                type="number"
                min={0}
                value={editing.priceEtb}
                onChange={(e) => setField("priceEtb", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted sm:col-span-2">
              Description
              <textarea
                value={editing.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white resize-none"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Preview href
              <input
                value={editing.href}
                onChange={(e) => setField("href", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
                placeholder="/academy/freshman"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Image URL path
              <input
                value={editing.image}
                onChange={(e) => setField("image", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
                placeholder="/images/packages/..."
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Enrolled label
              <input
                value={editing.enrolledLabel}
                onChange={(e) => setField("enrolledLabel", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
                placeholder="320+ students"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Sort order
              <input
                type="number"
                value={editing.sortOrder}
                onChange={(e) => setField("sortOrder", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-white mt-6">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setField("active", e.target.checked)}
                className="rounded border-white/30"
              />
              Active (shown on /packages)
            </label>
          </div>

          <div>
            <p className="text-xs text-wisdom-muted mb-1">Includes (one per line)</p>
            <textarea
              value={editing.includes.join("\n")}
              onChange={(e) =>
                setField(
                  "includes",
                  e.target.value.split("\n").map((s) => s.trim())
                )
              }
              rows={3}
              className="w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-xl border border-white/12 text-sm text-wisdom-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && rows.length === 0 ? (
        <p className="py-12 text-center text-wisdom-muted">Loading catalog…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-wisdom-muted">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white/80 mb-1">Catalog empty</p>
          <p className="text-sm mb-4">
            Run <code className="text-cyan-300">docs/catalog-setup.sql</code> in Supabase, then
            seed defaults or add a product.
          </p>
          <p className="text-xs">
            Code still has {academyPackages.length} static packages as fallback until you seed.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`rounded-2xl border bg-wisdom-card p-4 flex flex-wrap items-center gap-3 ${
                row.active ? "border-white/12" : "border-white/8 opacity-60"
              }`}
            >
              <div
                className="w-14 h-14 rounded-xl bg-cover bg-center shrink-0 border border-white/10 bg-wisdom-dark"
                style={{ backgroundImage: row.image ? `url(${row.image})` : undefined }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{row.name}</p>
                <p className="text-xs text-wisdom-muted">
                  <span className="font-mono text-white/70">{row.id}</span>
                  {" · "}
                  {row.group_key}
                  {" · "}
                  <span className="text-amber-300 font-semibold">
                    {formatEtb(Number(row.price_etb))}
                  </span>
                  {!row.active && " · inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold hover:bg-white/5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => remove(row.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-400/30 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!editing && rows.length === 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={seed}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-400/40 text-amber-200 text-sm font-semibold"
          >
            <Database className="w-4 h-4" />
            Seed {academyPackages.length} default packages
          </button>
        </div>
      )}
    </div>
  );
}
