"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FREE_RESOURCE_LABELS,
  FREE_RESOURCE_SLUGS,
  PAGE_ITEM_KIND,
  EDITORIAL_SLUGS,
  listFreeResourcePages,
  listFreeResourceItems,
  upsertFreeResourcePage,
  upsertFreeResourceItem,
  deleteFreeResourceItem,
  uploadFreeResourceFile,
  freeResourcePublicUrl,
  type FreeResourcePage,
  type FreeResourceItem,
  type FreeResourceSlug,
  type FreeResourceItemKind,
} from "@/lib/free-resources";
import {
  BookOpen,
  Save,
  RefreshCw,
  Upload,
  ExternalLink,
  CheckCircle2,
  Circle,
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  Star,
} from "lucide-react";

const inputCls =
  "mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white";
const labelCls = "block text-xs text-wisdom-muted";

function emptyMetaFor(kind: FreeResourceItemKind): Record<string, unknown> {
  if (kind === "university") {
    return {
      abbr: "",
      region: "Addis Ababa",
      location: "",
      website: "",
      founded: "",
      campuses: "",
      climate: "",
      distanceFromAddisKm: null,
      elevationM: null,
      knownFor: [] as string[],
      strengths: [] as string[],
      whatToExpect: [] as string[],
      tips: [] as string[],
      studentFit: "",
      detailed: true,
    };
  }
  if (kind === "success_story") {
    return {
      studentName: "",
      program: "",
      result: "",
      year: "",
      quote: "",
    };
  }
  if (kind === "scholarship") {
    return {
      organization: "",
      amount: "",
      eligibility: "",
      status: "open",
    };
  }
  if (kind === "department") {
    return { field: "", duration: "", careerPaths: [] as string[] };
  }
  return {};
}

export default function FreeResourcesPanel() {
  const [pages, setPages] = useState<FreeResourcePage[]>([]);
  const [items, setItems] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [activeSlug, setActiveSlug] = useState<FreeResourceSlug>("success-stories");

  // Page shell form
  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [pageBody, setPageBody] = useState("");
  const [pagePublished, setPagePublished] = useState(false);
  const [pageId, setPageId] = useState<string | undefined>();
  const [savingPage, setSavingPage] = useState(false);

  // Item editor
  const [editing, setEditing] = useState<FreeResourceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [itTitle, setItTitle] = useState("");
  const [itSubtitle, setItSubtitle] = useState("");
  const [itBody, setItBody] = useState("");
  const [itMeta, setItMeta] = useState<Record<string, unknown>>({});
  const [itPublished, setItPublished] = useState(false);
  const [itFeatured, setItFeatured] = useState(false);
  const [itDeadline, setItDeadline] = useState("");
  const [itUrl, setItUrl] = useState("");
  const [itImagePath, setItImagePath] = useState<string | null>(null);
  const [itFile, setItFile] = useState<File | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  const itemKind = PAGE_ITEM_KIND[activeSlug];
  const isEditorial = EDITORIAL_SLUGS.includes(activeSlug);
  const hasItemList = Boolean(itemKind);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, iRes] = await Promise.all([
      listFreeResourcePages(),
      listFreeResourceItems({ pageSlug: activeSlug }),
    ]);
    setPages(pRes.items);
    setItems(iRes.items);
    if (pRes.error) setToast(pRes.error);
    else if (iRes.error) setToast(iRes.error);
    setLoading(false);
  }, [activeSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Sync page form when slug / pages change
  useEffect(() => {
    const page = pages.find((p) => p.slug === activeSlug);
    if (page) {
      setPageId(page.id);
      setPageTitle(page.title);
      setPageSubtitle(page.subtitle || "");
      setPageBody(page.bodyMd || "");
      setPagePublished(page.published);
    } else {
      setPageId(undefined);
      setPageTitle(FREE_RESOURCE_LABELS[activeSlug]);
      setPageSubtitle("");
      setPageBody("");
      setPagePublished(false);
    }
    setEditing(null);
    setIsNew(false);
  }, [activeSlug, pages]);

  async function savePage() {
    setSavingPage(true);
    const res = await upsertFreeResourcePage({
      id: pageId,
      slug: activeSlug,
      title: pageTitle.trim() || FREE_RESOURCE_LABELS[activeSlug],
      subtitle: pageSubtitle.trim() || null,
      bodyMd: pageBody,
      published: pagePublished,
      sortOrder: (FREE_RESOURCE_SLUGS.indexOf(activeSlug) + 1) * 10,
    });
    setSavingPage(false);
    if (!res.ok) {
      setToast(res.error || "Page save failed — run docs/free-resources-setup.sql");
      return;
    }
    setToast(pagePublished ? "Page saved & published" : "Page saved (draft)");
    await load();
  }

  function openNewItem() {
    if (!itemKind) return;
    setIsNew(true);
    setEditing({
      id: "",
      pageSlug: activeSlug,
      kind: itemKind,
      title: "",
      subtitle: null,
      bodyMd: "",
      imagePath: null,
      gallery: [],
      meta: emptyMetaFor(itemKind),
      featured: false,
      published: false,
      sortOrder: items.length * 10,
      deadline: null,
      externalUrl: null,
    });
    setItTitle("");
    setItSubtitle("");
    setItBody("");
    setItMeta(emptyMetaFor(itemKind));
    setItPublished(false);
    setItFeatured(false);
    setItDeadline("");
    setItUrl("");
    setItImagePath(null);
    setItFile(null);
  }

  function openEditItem(item: FreeResourceItem) {
    setIsNew(false);
    setEditing(item);
    setItTitle(item.title);
    setItSubtitle(item.subtitle || "");
    setItBody(item.bodyMd || "");
    setItMeta({ ...emptyMetaFor(item.kind), ...item.meta });
    setItPublished(item.published);
    setItFeatured(item.featured);
    setItDeadline(item.deadline || "");
    setItUrl(item.externalUrl || "");
    setItImagePath(item.imagePath);
    setItFile(null);
  }

  async function saveItem() {
    if (!editing || !itemKind) return;
    setSavingItem(true);
    let imagePath = itImagePath;
    if (itFile) {
      const safe = itFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${activeSlug}/${Date.now()}-${safe}`;
      const up = await uploadFreeResourceFile(path, itFile);
      if (up.error) {
        setToast(up.error);
        setSavingItem(false);
        return;
      }
      imagePath = up.path || path;
    }
    const res = await upsertFreeResourceItem({
      id: isNew ? undefined : editing.id,
      pageSlug: activeSlug,
      kind: itemKind,
      title: itTitle.trim() || "Untitled",
      subtitle: itSubtitle.trim() || null,
      bodyMd: itBody,
      imagePath,
      meta: itMeta,
      featured: itFeatured,
      published: itPublished,
      sortOrder: editing.sortOrder,
      deadline: itDeadline || null,
      externalUrl: itUrl.trim() || null,
    });
    setSavingItem(false);
    if (!res.ok) {
      setToast(res.error || "Item save failed — run docs/free-resources-setup.sql");
      return;
    }
    setToast(itPublished ? "Item published" : "Item saved as draft");
    setEditing(null);
    setIsNew(false);
    await load();
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this item permanently?")) return;
    const res = await deleteFreeResourceItem(id);
    if (!res.ok) setToast(res.error || "Delete failed");
    else {
      setToast("Deleted");
      if (editing?.id === id) setEditing(null);
      await load();
    }
  }

  function setMetaField(key: string, value: unknown) {
    setItMeta((m) => ({ ...m, [key]: value }));
  }

  function setMetaList(key: string, raw: string) {
    const list = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setMetaField(key, list);
  }

  function listToText(key: string): string {
    const v = itMeta[key];
    return Array.isArray(v) ? v.map(String).join("\n") : "";
  }

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
          <p className="text-sm text-wisdom-muted mt-0.5 max-w-xl">
            Each university, success story, and scholarship is its own card with photo. Add one,
            publish, then add the next — no giant JSON dump.
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

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {FREE_RESOURCE_SLUGS.map((slug) => {
          const page = pages.find((p) => p.slug === slug);
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

      {/* —— Page shell (title + tips / intro) —— */}
      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-wisdom-muted">
              Page settings · <code className="text-cyan-300">{activeSlug}</code>
            </p>
            <p className="text-xs text-wisdom-muted mt-0.5">
              {activeSlug === "scholarships"
                ? "Tips & how-to live in the body below. Opportunities are separate cards in the list."
                : isEditorial
                  ? "Full guide content for this page."
                  : "Section title + short intro. Individual cards are managed in the list below."}
            </p>
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

        <div className="grid sm:grid-cols-2 gap-3">
          <label className={labelCls}>
            Page title
            <input className={inputCls} value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
          </label>
          <label className={labelCls}>
            Subtitle
            <input
              className={inputCls}
              value={pageSubtitle}
              onChange={(e) => setPageSubtitle(e.target.value)}
              placeholder="One line under the title"
            />
          </label>
        </div>

        <label className={labelCls}>
          {activeSlug === "scholarships"
            ? "Tips & guidance (Markdown)"
            : isEditorial
              ? "Full page body (Markdown)"
              : "Intro blurb (Markdown, optional)"}
          <textarea
            className={`${inputCls} font-mono leading-relaxed`}
            rows={isEditorial || activeSlug === "scholarships" ? 10 : 4}
            value={pageBody}
            onChange={(e) => setPageBody(e.target.value)}
            placeholder={
              activeSlug === "scholarships"
                ? "## How to apply well\n\n- Start early…\n- Documents you need…"
                : "## Heading\n\nYour content…"
            }
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pagePublished}
              onChange={(e) => setPagePublished(e.target.checked)}
            />
            Page published
          </label>
          <button
            type="button"
            disabled={savingPage}
            onClick={savePage}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingPage ? "Saving…" : "Save page"}
          </button>
        </div>
      </div>

      {/* —— Item list (stories / universities / scholarships / departments) —— */}
      {hasItemList && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-white">
              {itemKind === "success_story" && "Student stories"}
              {itemKind === "university" && "Universities"}
              {itemKind === "scholarship" && "Opportunity listings"}
              {itemKind === "department" && "Departments"}
              <span className="ml-2 text-sm font-normal text-wisdom-muted">
                {items.length} · {items.filter((i) => i.published).length} live
              </span>
            </h3>
            <button
              type="button"
              onClick={openNewItem}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              {itemKind === "success_story" && "Add story"}
              {itemKind === "university" && "Add university"}
              {itemKind === "scholarship" && "Add opportunity"}
              {itemKind === "department" && "Add department"}
            </button>
          </div>

          {loading && <p className="text-sm text-wisdom-muted py-6 text-center">Loading…</p>}

          {!loading && items.length === 0 && !editing && (
            <p className="text-center text-wisdom-muted text-sm py-10 border border-dashed border-white/15 rounded-2xl">
              No items yet. Click <strong className="text-white">Add</strong> to create the first one.
            </p>
          )}

          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card p-3"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                  {item.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={freeResourcePublicUrl(item.imagePath)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-wisdom-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate flex items-center gap-2">
                    {item.title}
                    {item.featured && <Star className="w-3.5 h-3.5 text-amber-300" />}
                  </p>
                  <p className="text-xs text-wisdom-muted truncate">
                    {item.subtitle || item.kind}
                    {item.deadline ? ` · deadline ${item.deadline}` : ""}
                    {item.published ? " · published" : " · draft"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEditItem(item)}
                  className="px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5 inline" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-400/30 text-xs text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5 inline" />
                </button>
              </li>
            ))}
          </ul>

          {/* Item editor form */}
          {editing && (
            <div className="rounded-2xl border border-amber-400/30 bg-wisdom-card p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">
                  {isNew ? "New item" : "Edit item"}
                </h3>
                <button type="button" onClick={() => setEditing(null)} className="p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className={labelCls}>
                  Title *
                  <input
                    className={inputCls}
                    value={itTitle}
                    onChange={(e) => setItTitle(e.target.value)}
                    placeholder={
                      itemKind === "success_story"
                        ? "e.g. From 320 to 520 on UAT"
                        : itemKind === "university"
                          ? "Addis Ababa University"
                          : itemKind === "scholarship"
                            ? "MasterCard Foundation Scholars 2027"
                            : "Title"
                    }
                  />
                </label>
                <label className={labelCls}>
                  Subtitle
                  <input
                    className={inputCls}
                    value={itSubtitle}
                    onChange={(e) => setItSubtitle(e.target.value)}
                    placeholder={
                      itemKind === "success_story"
                        ? "Hana G. · Freshman"
                        : itemKind === "university"
                          ? "Addis Ababa · flagship"
                          : "Short line"
                    }
                  />
                </label>
              </div>

              {/* Kind-specific fields */}
              {itemKind === "success_story" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Student name
                    <input
                      className={inputCls}
                      value={String(itMeta.studentName || "")}
                      onChange={(e) => setMetaField("studentName", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Program / pathway
                    <input
                      className={inputCls}
                      value={String(itMeta.program || "")}
                      onChange={(e) => setMetaField("program", e.target.value)}
                      placeholder="UAT · Grade 12 · Freshman"
                    />
                  </label>
                  <label className={labelCls}>
                    Result / score
                    <input
                      className={inputCls}
                      value={String(itMeta.result || "")}
                      onChange={(e) => setMetaField("result", e.target.value)}
                      placeholder="520 UAT · top 1%"
                    />
                  </label>
                  <label className={labelCls}>
                    Year
                    <input
                      className={inputCls}
                      value={String(itMeta.year || "")}
                      onChange={(e) => setMetaField("year", e.target.value)}
                      placeholder="2025"
                    />
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    Short quote
                    <input
                      className={inputCls}
                      value={String(itMeta.quote || "")}
                      onChange={(e) => setMetaField("quote", e.target.value)}
                    />
                  </label>
                </div>
              )}

              {itemKind === "university" && (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <label className={labelCls}>
                      Abbreviation
                      <input
                        className={inputCls}
                        value={String(itMeta.abbr || "")}
                        onChange={(e) => setMetaField("abbr", e.target.value)}
                        placeholder="AAU"
                      />
                    </label>
                    <label className={labelCls}>
                      Region
                      <input
                        className={inputCls}
                        value={String(itMeta.region || "")}
                        onChange={(e) => setMetaField("region", e.target.value)}
                      />
                    </label>
                    <label className={labelCls}>
                      Location
                      <input
                        className={inputCls}
                        value={String(itMeta.location || "")}
                        onChange={(e) => setMetaField("location", e.target.value)}
                      />
                    </label>
                    <label className={labelCls}>
                      Website
                      <input
                        className={inputCls}
                        value={String(itMeta.website || "")}
                        onChange={(e) => setMetaField("website", e.target.value)}
                        placeholder="https://…"
                      />
                    </label>
                    <label className={labelCls}>
                      Founded
                      <input
                        className={inputCls}
                        value={String(itMeta.founded || "")}
                        onChange={(e) => setMetaField("founded", e.target.value)}
                      />
                    </label>
                    <label className={labelCls}>
                      Distance from Addis (km)
                      <input
                        className={inputCls}
                        type="number"
                        value={
                          itMeta.distanceFromAddisKm != null
                            ? String(itMeta.distanceFromAddisKm)
                            : ""
                        }
                        onChange={(e) =>
                          setMetaField(
                            "distanceFromAddisKm",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className={labelCls}>
                    Campuses (detailed)
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={String(itMeta.campuses || "")}
                      onChange={(e) => setMetaField("campuses", e.target.value)}
                      placeholder="Sidist Kilo (main) — social sciences…\nArat Kilo — natural sciences…"
                    />
                  </label>
                  <label className={labelCls}>
                    Climate
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={String(itMeta.climate || "")}
                      onChange={(e) => setMetaField("climate", e.target.value)}
                    />
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className={labelCls}>
                      Known for (one per line)
                      <textarea
                        className={inputCls}
                        rows={4}
                        value={listToText("knownFor")}
                        onChange={(e) => setMetaList("knownFor", e.target.value)}
                      />
                    </label>
                    <label className={labelCls}>
                      Strengths (one per line)
                      <textarea
                        className={inputCls}
                        rows={4}
                        value={listToText("strengths")}
                        onChange={(e) => setMetaList("strengths", e.target.value)}
                      />
                    </label>
                    <label className={labelCls}>
                      What campus life is like (one per line)
                      <textarea
                        className={inputCls}
                        rows={4}
                        value={listToText("whatToExpect")}
                        onChange={(e) => setMetaList("whatToExpect", e.target.value)}
                      />
                    </label>
                    <label className={labelCls}>
                      Tips for new students (one per line)
                      <textarea
                        className={inputCls}
                        rows={4}
                        value={listToText("tips")}
                        onChange={(e) => setMetaList("tips", e.target.value)}
                      />
                    </label>
                  </div>
                  <label className={labelCls}>
                    Who thrives here
                    <input
                      className={inputCls}
                      value={String(itMeta.studentFit || "")}
                      onChange={(e) => setMetaField("studentFit", e.target.value)}
                    />
                  </label>
                </div>
              )}

              {itemKind === "scholarship" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Organization
                    <input
                      className={inputCls}
                      value={String(itMeta.organization || "")}
                      onChange={(e) => setMetaField("organization", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Amount / coverage
                    <input
                      className={inputCls}
                      value={String(itMeta.amount || "")}
                      onChange={(e) => setMetaField("amount", e.target.value)}
                      placeholder="Full tuition + stipend"
                    />
                  </label>
                  <label className={labelCls}>
                    Deadline
                    <input
                      className={inputCls}
                      type="date"
                      value={itDeadline}
                      onChange={(e) => setItDeadline(e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Status
                    <select
                      className={inputCls}
                      value={String(itMeta.status || "open")}
                      onChange={(e) => setMetaField("status", e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="upcoming">Upcoming</option>
                    </select>
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    Apply / info link
                    <input
                      className={inputCls}
                      value={itUrl}
                      onChange={(e) => setItUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    Eligibility notes
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={String(itMeta.eligibility || "")}
                      onChange={(e) => setMetaField("eligibility", e.target.value)}
                    />
                  </label>
                </div>
              )}

              <label className={labelCls}>
                Full story / description (Markdown)
                <textarea
                  className={`${inputCls} font-mono leading-relaxed`}
                  rows={6}
                  value={itBody}
                  onChange={(e) => setItBody(e.target.value)}
                  placeholder="Write the full story or campus guide here…"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className={labelCls}>
                  Photo / cover image
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 cursor-pointer text-sm">
                      <Upload className="w-4 h-4" />
                      {itFile ? itFile.name : "Choose image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setItFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {itImagePath && !itFile && (
                      <a
                        href={freeResourcePublicUrl(itImagePath)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-300 hover:underline"
                      >
                        Current image
                      </a>
                    )}
                  </div>
                </label>
                <div className="flex flex-col gap-2 pt-5">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={itPublished}
                      onChange={(e) => setItPublished(e.target.checked)}
                    />
                    Published (visible on site)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={itFeatured}
                      onChange={(e) => setItFeatured(e.target.checked)}
                    />
                    Featured
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={savingItem}
                onClick={saveItem}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingItem ? "Saving…" : isNew ? "Create & save" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 text-xs text-wisdom-muted space-y-1.5">
        <p className="font-semibold text-white/80">How this works</p>
        <p>
          <strong className="text-white/70">Success stories:</strong> Add one student → photo + name +
          score + story → Publish. Repeat for the next student.
        </p>
        <p>
          <strong className="text-white/70">Universities:</strong> Add AAU with campuses & image →
          Publish. Then add Bahir Dar, Gondar, etc. each as its own card.
        </p>
        <p>
          <strong className="text-white/70">Scholarships:</strong> Write tips in Page settings. Add each
          opportunity below with deadline, photo, and apply link — like news posts.
        </p>
        <p>
          Run <code className="text-cyan-300">docs/free-resources-setup.sql</code> in Supabase once
          (creates both tables). Public pages still show static content until we wire them to these
          published items.
        </p>
      </div>
    </div>
  );
}
