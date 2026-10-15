"use client";

// Admin mobile redesign A11 (layout only). Logic, state, data calls and texts are unchanged.
// Phone rules: no horizontal scrolling, 44 px touch targets, no animate-* / blur / shadow,
// page chips as a 2-column grid, item cards stacked (info row, then buttons row).

import { useCallback, useEffect, useState } from "react";
import {
  FREE_RESOURCE_LABELS,
  FREE_RESOURCE_SLUGS,
  PAGE_ITEM_KIND,
  NOTE_ONLY_SLUGS,
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
import { universities } from "@/data/universities";
import {
  BookOpen,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Circle,
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  Star,
  StickyNote,
} from "lucide-react";

const inputCls =
  "mt-1 w-full min-h-[44px] min-w-0 rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white";
const labelCls = "block min-w-0 text-xs text-wisdom-muted";
const pillCls =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-bold";
const checkRowCls = "flex min-h-[44px] items-center gap-3 text-sm";
const checkCls = "h-5 w-5 shrink-0";

function emptyMetaFor(kind: FreeResourceItemKind, slug: FreeResourceSlug): Record<string, unknown> {
  if (kind === "success_story") {
    return { studentName: "", program: "", result: "", year: "", quote: "" };
  }
  if (kind === "scholarship") {
    return { organization: "", amount: "", eligibility: "", status: "open" };
  }
  if (kind === "university" || slug === "universities") {
    return { universityId: "" };
  }
  if (kind === "department" || slug === "departments") {
    return { departmentId: "" };
  }
  return {};
}

export default function FreeResourcesPanel() {
  const [pages, setPages] = useState<FreeResourcePage[]>([]);
  const [items, setItems] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [activeSlug, setActiveSlug] = useState<FreeResourceSlug>("success-stories");

  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [pageBody, setPageBody] = useState("");
  const [pagePublished, setPagePublished] = useState(false);
  const [pageId, setPageId] = useState<string | undefined>();
  const [savingPage, setSavingPage] = useState(false);

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
  const isNoteOnly = NOTE_ONLY_SLUGS.includes(activeSlug);
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
      setToast(res.error || "Page save failed. Run docs/free-resources-setup.sql");
      return;
    }
    setToast(pagePublished ? "Page saved and published" : "Page saved (draft)");
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
      meta: emptyMetaFor(itemKind, activeSlug),
      featured: false,
      published: false,
      sortOrder: items.length * 10,
      deadline: null,
      externalUrl: null,
      createdAt: "",
      updatedAt: "",
    });
    setItTitle("");
    setItSubtitle("");
    setItBody("");
    setItMeta(emptyMetaFor(itemKind, activeSlug));
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
    setItMeta({ ...emptyMetaFor(item.kind, activeSlug), ...item.meta });
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
      setToast(res.error || "Item save failed. Run docs/free-resources-setup.sql");
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

  const addLabel =
    itemKind === "success_story"
      ? "Add story"
      : itemKind === "scholarship"
        ? "Add opportunity"
        : "Add note";

  return (
    <div className="space-y-4 break-words">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <BookOpen className="h-5 w-5 shrink-0 text-cyan-400" />
            Free resources
          </h2>
          <p className="mt-1 text-sm text-wisdom-muted">
            Stories and scholarships are full cards. University, department, campus life, and study
            technique notes only append at the end of the hard-coded guides.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className={`${pillCls} w-full border border-white/12 text-white`}
        >
          <RefreshCw className="h-4 w-4" />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {FREE_RESOURCE_SLUGS.map((slug) => {
          const page = pages.find((p) => p.slug === slug);
          const isActive = activeSlug === slug;
          const noteOnly = NOTE_ONLY_SLUGS.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveSlug(slug)}
              className={`flex min-h-[44px] min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold leading-tight ${
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 text-wisdom-muted"
              }`}
            >
              {noteOnly ? (
                <StickyNote className="h-4 w-4 shrink-0 text-amber-300" />
              ) : page?.published ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 opacity-50" />
              )}
              <span className="min-w-0 break-words">{FREE_RESOURCE_LABELS[slug]}</span>
            </button>
          );
        })}
      </div>

      {!isNoteOnly && (
        <div className="space-y-3 rounded-2xl border border-white/12 bg-wisdom-card p-4">
          <p className="text-xs uppercase tracking-wider text-wisdom-muted">
            Page settings · <code className="break-all text-cyan-300">{activeSlug}</code>
          </p>
          <a
            href={`/academy/${activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-cyan-300"
          >
            Open live page <ExternalLink className="h-3.5 w-3.5" />
          </a>

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

          <label className={labelCls}>
            {activeSlug === "scholarships" ? "Tips and guidance (Markdown)" : "Intro blurb (Markdown, optional)"}
            <textarea
              className={`${inputCls} font-mono leading-relaxed`}
              rows={activeSlug === "scholarships" ? 10 : 4}
              value={pageBody}
              onChange={(e) => setPageBody(e.target.value)}
              placeholder={"## Heading\n\nYour content…"}
            />
          </label>

          <label className={checkRowCls}>
            <input
              type="checkbox"
              className={checkCls}
              checked={pagePublished}
              onChange={(e) => setPagePublished(e.target.checked)}
            />
            Page published
          </label>
          <button
            type="button"
            disabled={savingPage}
            onClick={savePage}
            className={`${pillCls} w-full bg-cyan-500 text-wisdom-dark disabled:opacity-50`}
          >
            <Save className="h-4 w-4" />
            {savingPage ? "Saving…" : "Save page"}
          </button>
        </div>
      )}

      {isNoteOnly && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-4 text-sm text-wisdom-muted">
          <p className="mb-1 flex items-center gap-2 font-semibold text-amber-200">
            <StickyNote className="h-4 w-4 shrink-0" />
            Additive notes only
          </p>
          <p>
            Hard-coded page content stays in code. Notes you publish here appear at the end of the
            matching card or section on the live page.
          </p>
          <a
            href={`/academy/${activeSlug === "universities" ? "universities" : activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-cyan-300"
          >
            Open live page <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {hasItemList && (
        <div className="space-y-3">
          <h3 className="font-semibold text-white">
            {itemKind === "success_story" && "Student stories"}
            {itemKind === "scholarship" && "Opportunity listings"}
            {isNoteOnly && "Published notes"}
            <span className="ml-2 text-sm font-normal text-wisdom-muted">
              {items.length} · {items.filter((i) => i.published).length} live
            </span>
          </h3>
          <button
            type="button"
            onClick={openNewItem}
            className={`${pillCls} w-full bg-amber-500 text-wisdom-dark`}
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>

          {loading && <p className="py-6 text-center text-sm text-wisdom-muted">Loading…</p>}

          {!loading && items.length === 0 && !editing && (
            <p className="rounded-2xl border border-dashed border-white/15 py-10 text-center text-sm text-wisdom-muted">
              No items yet. Tap <strong className="text-white">Add</strong> to create the first one.
            </p>
          )}

          <ul className="space-y-2">
            {items.map((item) => {
              const uniId = String(item.meta?.universityId || "");
              const uni = universities.find((u) => u.id === uniId);
              return (
                <li
                  key={item.id}
                  className="space-y-3 rounded-2xl border border-white/12 bg-wisdom-card p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {item.imagePath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={freeResourcePublicUrl(item.imagePath)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-wisdom-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-start gap-2 font-semibold text-white">
                        <span className="min-w-0 break-words">{item.title}</span>
                        {item.featured && <Star className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-300" />}
                      </p>
                      <p className="break-words text-xs text-wisdom-muted">
                        {uni ? `${uni.abbr} · ${uni.name}` : item.subtitle || item.kind}
                        {item.published ? " · published" : " · draft"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditItem(item)}
                      className={`${pillCls} flex-1 border border-white/12 text-white`}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Delete item"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-400/30 text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {editing && (
            <div className="space-y-3 rounded-2xl border border-amber-400/30 bg-wisdom-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{isNew ? "New item" : "Edit item"}</h3>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Close editor"
                  className="inline-flex h-11 w-11 items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className={labelCls}>
                Title *
                <input className={inputCls} value={itTitle} onChange={(e) => setItTitle(e.target.value)} />
              </label>
              <label className={labelCls}>
                Subtitle
                <input
                  className={inputCls}
                  value={itSubtitle}
                  onChange={(e) => setItSubtitle(e.target.value)}
                />
              </label>

              {activeSlug === "universities" && (
                <label className={labelCls}>
                  University *
                  <select
                    className={inputCls}
                    value={String(itMeta.universityId || "")}
                    onChange={(e) => setMetaField("universityId", e.target.value)}
                  >
                    <option value="">Select university…</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.abbr} · {u.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {itemKind === "success_story" && (
                <div className="grid grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Student name
                    <input
                      className={inputCls}
                      value={String(itMeta.studentName || "")}
                      onChange={(e) => setMetaField("studentName", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Result / score
                    <input
                      className={inputCls}
                      value={String(itMeta.result || "")}
                      onChange={(e) => setMetaField("result", e.target.value)}
                      placeholder="e.g. 600/600"
                    />
                  </label>
                  <label className={labelCls}>
                    Program
                    <input
                      className={inputCls}
                      value={String(itMeta.program || "")}
                      onChange={(e) => setMetaField("program", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Year
                    <input
                      className={inputCls}
                      value={String(itMeta.year || "")}
                      onChange={(e) => setMetaField("year", e.target.value)}
                    />
                  </label>
                  <label className={`${labelCls} col-span-2`}>
                    Quote
                    <input
                      className={inputCls}
                      value={String(itMeta.quote || "")}
                      onChange={(e) => setMetaField("quote", e.target.value)}
                    />
                  </label>
                </div>
              )}

              {itemKind === "scholarship" && (
                <div className="grid grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Organization
                    <input
                      className={inputCls}
                      value={String(itMeta.organization || "")}
                      onChange={(e) => setMetaField("organization", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Amount
                    <input
                      className={inputCls}
                      value={String(itMeta.amount || "")}
                      onChange={(e) => setMetaField("amount", e.target.value)}
                    />
                  </label>
                  <label className={`${labelCls} col-span-2`}>
                    Deadline
                    <input
                      className={inputCls}
                      type="date"
                      value={itDeadline}
                      onChange={(e) => setItDeadline(e.target.value)}
                    />
                  </label>
                  <label className={`${labelCls} col-span-2`}>
                    External URL
                    <input
                      className={inputCls}
                      value={itUrl}
                      onChange={(e) => setItUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                  <label className={`${labelCls} col-span-2`}>
                    Eligibility
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
                {isNoteOnly ? "Note body (Markdown)" : "Full text / story (Markdown)"}
                <textarea
                  className={`${inputCls} font-mono`}
                  rows={6}
                  value={itBody}
                  onChange={(e) => setItBody(e.target.value)}
                />
              </label>

              {!isNoteOnly && (
                <label className={labelCls}>
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1 file:text-cyan-200`}
                    onChange={(e) => setItFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}

              <label className={checkRowCls}>
                <input
                  type="checkbox"
                  className={checkCls}
                  checked={itPublished}
                  onChange={(e) => setItPublished(e.target.checked)}
                />
                Published
              </label>
              {!isNoteOnly && (
                <label className={checkRowCls}>
                  <input
                    type="checkbox"
                    className={checkCls}
                    checked={itFeatured}
                    onChange={(e) => setItFeatured(e.target.checked)}
                  />
                  Featured
                </label>
              )}
              <button
                type="button"
                disabled={savingItem}
                onClick={saveItem}
                className={`${pillCls} w-full bg-cyan-500 text-wisdom-dark disabled:opacity-50`}
              >
                <Save className="h-4 w-4" />
                {savingItem ? "Saving…" : "Save item"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
