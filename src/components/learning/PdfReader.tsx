"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Maximize2,
  Minimize2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { fetchPdfCached } from "@/lib/pdfCache";

type Props = {
  url: string;
  title: string;
  onOpened?: () => void;
};

/**
 * True in-app PDF reader using PDF.js → canvas.
 * Never relies on the browser PDF plugin (which on mobile only shows "Open").
 * PDFs are cached in memory after the first fetch.
 */
export default function PdfReader({ url, title, onOpened }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const openedRef = useRef(false);

  // Load document once per URL
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setPage(1);
    setNumPages(0);
    pdfRef.current = null;
    openedRef.current = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Worker from CDN — matches installed major version
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

        const data = await fetchPdfCached(url);
        if (cancelled) return;

        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setLoading(false);
        if (!openedRef.current) {
          openedRef.current = true;
          onOpened?.();
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setError(e instanceof Error ? e.message : "Failed to load PDF");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      try {
        pdfRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      pdfRef.current = null;
    };
  }, [url, onOpened]);

  // Render current page
  const renderPage = useCallback(async () => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || page < 1) return;

    try {
      renderTaskRef.current?.cancel();
      const pageObj = await pdf.getPage(page);

      // Fit width of container when possible
      const container = containerRef.current;
      let viewport = pageObj.getViewport({ scale: 1 });
      let nextScale = scale;
      if (container && container.clientWidth > 40) {
        const fit = (container.clientWidth - 16) / viewport.width;
        nextScale = Math.min(Math.max(scale, fit * 0.98), scale);
        // Prefer user zoom, but never overflow on first paint if scale is default
        if (scale <= 1.2) nextScale = fit * 0.98;
      }
      viewport = pageObj.getViewport({ scale: nextScale });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const task = pageObj.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (e) {
      // Cancelled renders throw — ignore those
      if (e && typeof e === "object" && "name" in e && (e as { name: string }).name === "RenderingCancelledException") {
        return;
      }
      console.warn("PDF render:", e);
    }
  }, [page, scale]);

  useEffect(() => {
    if (!loading && pdfRef.current) void renderPage();
  }, [loading, page, scale, renderPage]);

  // Re-render on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (pdfRef.current) void renderPage();
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [renderPage]);

  return (
    <div
      className={`relative rounded-2xl border border-white/12 bg-neutral-950 overflow-hidden flex flex-col ${
        fullscreen ? "fixed inset-2 z-[80] rounded-xl" : ""
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-2 sm:px-3 py-2 border-b border-white/10 bg-wisdom-dark/95 shrink-0">
        <p className="text-xs text-white/70 truncate flex items-center gap-1.5 min-w-0 flex-1">
          <FileText className="w-3.5 h-3.5 shrink-0 text-amber-300" />
          <span className="truncate">{title}</span>
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            className="p-1.5 rounded-lg border border-white/12 text-white/80 hover:bg-white/5"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            className="p-1.5 rounded-lg border border-white/12 text-white/80 hover:bg-white/5"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/12 text-[11px] font-semibold text-white/80 hover:bg-white/5"
          >
            {fullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Exit
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Expand
              </>
            )}
          </button>
        </div>
      </div>

      {/* Page nav */}
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-3 px-3 py-1.5 border-b border-white/8 bg-wisdom-dark/80 text-xs shrink-0">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-md border border-white/12 disabled:opacity-30 text-white/80"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="tabular-nums text-white/70 min-w-[5rem] text-center">
            {page} / {numPages}
          </span>
          <button
            type="button"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            className="p-1 rounded-md border border-white/12 disabled:opacity-30 text-white/80"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`overflow-auto flex-1 bg-neutral-900 flex justify-center ${
          fullscreen ? "min-h-0" : "h-[min(70vh,640px)]"
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center w-full py-24">
            <p className="text-sm text-wisdom-muted">Loading & caching PDF…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-24 w-full">
            <AlertCircle className="w-8 h-8 text-rose-400/80" />
            <p className="text-sm text-rose-200/90 text-center">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <canvas ref={canvasRef} className="max-w-full shadow-lg my-2" />
        )}
      </div>

      <p className="px-3 py-1.5 text-[10px] text-wisdom-muted border-t border-white/8 bg-wisdom-dark/80 shrink-0">
        In-app reader · cached after first load · no download
      </p>
    </div>
  );
}
