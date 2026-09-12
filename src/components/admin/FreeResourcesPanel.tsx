"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FREE_RESOURCE_LABELS,
  FREE_RESOURCE_SLUGS,
  listFreeResourcePages,
  upsertFreeResourcePage,
  uploadFreeResourceFile,
  freeResourcePublicUrl,
  type FreeResourcePage,
  type FreeResourceSlug,
} from "@/lib/free-resources";
import {
  BookOpen,
  Save,
  RefreshCw,
  Upload,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function FreeResourcesPanel() {
  const [items, setItems] = useState<FreeResourcePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [activeSlug, setActiveSlug] = useState<FreeResourceSlug>("universities");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [metaJson, setMetaJson] = useState("{}");
  const [published, setPublished] = useState(false);
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listFreeResourcePages();
    setItems(res.items);
    if (res.error) setToast(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Load selected page into form
  useEffect(() => {
    const page = items.find((p) => p.slug === activeSlug);
    if (page) {
      setEditingId(page.id);
      setTitle(page.title);
      setSubtitle(page.subtitle || "");
      setBodyMd(page.bodyMd || "");
      setMetaJson(JSON.stringify(page.meta || {}, null, 2));
      setPublished(page.published);
      setCoverPath(page.coverPath);
      setFile(null);
    } else {
      // Not yet in DB (table not seeded) — blank form with defaults
      setEditingId(undefined);
      setTitle(FREE_RESOURCE_LABELS[activeSlug]);
      setSubtitle("");
      setBodyMd("");
      setMetaJson(activeSlug === "universities" ? '{\n  "items": []\n}' : "{}");
      setPublished(false);
      setCoverPath(null);
      setFile(null);
    }
  }, [activeSlug, items]);

  async function save() {
    setSaving(true);
    let nextCover = coverPath;
    if (file) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${activeSlug}/cover-${Date.now()}-${safe}`;
      const up = await uploadFreeResourceFile(path, file);
      if (up.error) {
        setToast(up.error);
        setSaving(false);
        return;
      }
      nextCover = up.path || path;
    }

    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(metaJson || "{}");
    } catch {
      setToast("Meta JSON is invalid — fix before saving");
      setSaving(false);
      return;
    }

    const res = await upsertFreeResourcePage({
      id: editingId,
      slug: activeSlug,
      title: title.trim() || FREE_RESOURCE_LABELS[activeSlug],
      subtitle: subtitle.trim() || null,
      bodyMd,
      meta,
      coverPath: nextCover,
      published,
      sortOrder: (FREE_RESOURCE_SLUGS.indexOf(activeSlug) + 1) * 10,
    });

    setSaving(false);
    if (!res.ok) {
      setToast(res.error || "Save failed — run docs/free-resources-setup.sql?");
      return;
    }
    setToast(published ? "Saved & published" : "Saved as draft");
    setCoverPath(nextCover);
    setFile(null);
    await load();
  }

  const active = items.find((p) => p.slug === activeSlug);

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Free resources
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            Edit the six free resource pages. Publish when ready — students see published content only.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Resource picker */}
      <div className="flex flex-wrap gap-2">
        {FREE_RESOURCE_SLUGS.map((slug) => {
          const page = items.find((p) => p.slug === slug);
          const isActive = activeSlug === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveSlug(slug)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 text-wisdom-muted hover:text-white hover:border-white/20"
              }`}
            >
              {page?.published ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 opacity-50" />
              )}
              {FREE_RESOURCE_LABELS[slug]}
            </button>
          );
        })}
      </div>

      {loading && items.length === 0 ? (
        <p className="text-wisdom-muted text-sm py-10 text-center">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-wisdom-muted">
                Editing · <code className="text-cyan-300">{activeSlug}</code>
              </p>
              {active?.updatedAt && (
                <p className="text-xs text-wisdom-muted mt-0.5">
                  Last updated {new Date(active.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <a
              href={`/academy/${activeSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:underline"
            >
              Open live page
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <label className="block text-xs text-wisdom-muted">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-wisdom-muted">
            Subtitle
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white"
              placeholder="Short line under the title"
            />
          </label>

          <label className="block text-xs text-wisdom-muted">
            Body (Markdown)
            <textarea
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              rows={12}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white font-mono leading-relaxed"
              placeholder={
                activeSlug === "universities"
                  ? "## Intro\n\nOptional intro above the university cards…\n\nImages: ![Campus](https://…) or upload cover below"
                  : "## Heading\n\nYour content in Markdown…\n\n- Tip one\n- Tip two"
              }
            />
          </label>

          <label className="block text-xs text-wisdom-muted">
            Structured data (JSON meta)
            <span className="block text-[11px] text-wisdom-muted/80 mt-0.5 mb-1">
              Universities → {`{"items":[…]}`} · Galleries → {`{"gallery":[{"src":"…","caption":"…"}]}`} ·
              Study methods → {`{"methods":[…]}`}
            </span>
            <textarea
              value={metaJson}
              onChange={(e) => setMetaJson(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white font-mono"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block text-xs text-wisdom-muted">
              Cover / hero image
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 cursor-pointer text-sm">
                  <Upload className="w-4 h-4" />
                  {file ? file.name : "Choose image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                {coverPath && !file && (
                  <a
                    href={freeResourcePublicUrl(coverPath)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-300 hover:underline"
                  >
                    Current cover
                  </a>
                )}
              </div>
            </label>

            <label className="flex items-center gap-2 text-sm pt-5">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-white/20"
              />
              Published (visible on the site)
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save"}
            </button>
            <p className="text-xs text-wisdom-muted self-center">
              Run <code className="text-cyan-300">docs/free-resources-setup.sql</code> once if save fails.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-wisdom-muted space-y-1">
        <p className="font-semibold text-white/80">Migration tip</p>
        <p>
          Existing static text stays live until you publish here. Paste current page content into Body
          (Markdown) and structured lists into Meta JSON, then tick Published.
        </p>
        <p>
          Multimodal: use Markdown images in Body, or put gallery / method cards in Meta — the
          frontend can render both after a small page update.
        </p>
      </div>
    </div>
  );
}
