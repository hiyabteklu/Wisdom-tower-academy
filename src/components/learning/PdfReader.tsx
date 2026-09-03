"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Maximize2,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ChevronsUp,
} from "lucide-react";
import { fetchPdfCached } from "@/lib/pdfCache";

type Props = {
  url: string;
  title: string;
  onOpened?: () => void;
  onPageChange?: (page: number, total: number) => void;
};

/** How many pages around the current one stay painted as canvases */
const WINDOW = 2; // current ± 2
const DEFAULT_PAGE_H = 520;

/**
 * Memory-safe PDF reader:
 * - Loads the PDF once (cached) with real download progress
 * - Only paints a small window of pages to canvas (HD via devicePixelRatio)
 * - Other pages are lightweight spacers
 * - Single mount for inline vs fullscreen (avoids black pages on toggle)
 */
export default function PdfReader({ url, title, onOpened, onPageChange }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  /** 0–100 download progress; null while parsing after download */
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadPhase, setLoadPhase] = useState<"download" | "parse">("download");
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoInput, setGotoInput] = useState("");
  const [scrollWidth, setScrollWidth] = useState(360);
  /** Estimated height per page for spacers (updated as pages render) */
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);
  const openedRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const onPageChangeRef = useRef(onPageChange);
  onOpenedRef.current = onOpened;
  onPageChangeRef.current = onPageChange;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 360;
      setScrollWidth((prev) => (Math.abs(prev - w) < 2 ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullscreen, loading, numPages]);

  useEffect(() => {
    if (!fullscreen) return;
    const prevB = document.body.style.overflow;
    const prevH = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevB;
      document.documentElement.style.overflow = prevH;
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // Load document metadata only (no page rasterization)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setNumPages(0);
    setCurrentPage(1);
    setPageHeights({});
    setLoadProgress(0);
    setLoadPhase("download");
    pdfRef.current = null;
    openedRef.current = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

        const data = await fetchPdfCached(url, (loaded, total) => {
          if (cancelled) return;
          if (total && total > 0) {
            setLoadProgress(Math.min(99, Math.round((loaded / total) * 100)));
          } else {
            // Indeterminate-ish: climb slowly with bytes
            setLoadProgress((p) => Math.min(90, Math.max(p, Math.round(loaded / 50000))));
          }
        });
        if (cancelled) return;

        setLoadPhase("parse");
        setLoadProgress(99);

        const doc = await pdfjs.getDocument({
          data,
          disableAutoFetch: true,
          disableStream: true,
        }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setLoadProgress(100);
        setLoading(false);
        if (!openedRef.current) {
          openedRef.current = true;
          onOpenedRef.current?.();
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
      try {
        pdfRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      pdfRef.current = null;
    };
  }, [url]);

  // Detect current page from scroll position
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !numPages) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = root.scrollTop;
        let acc = 0;
        let page = 1;
        for (let i = 1; i <= numPages; i++) {
          const h = pageHeights[i] ?? DEFAULT_PAGE_H;
          if (scrollTop + 80 < acc + h) {
            page = i;
            break;
          }
          acc += h + 12;
          page = i;
        }
        setCurrentPage((prev) => {
          if (prev !== page) {
            onPageChangeRef.current?.(page, numPages);
            return page;
          }
          return prev;
        });
      });
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
    };
  }, [numPages, pageHeights]);

  const scrollToPage = useCallback(
    (p: number) => {
      const root = scrollRef.current;
      if (!root || !numPages) return;
      const clamped = Math.max(1, Math.min(numPages, p));
      let top = 0;
      for (let i = 1; i < clamped; i++) {
        top += (pageHeights[i] ?? DEFAULT_PAGE_H) + 12;
      }
      root.scrollTo({ top, behavior: "smooth" });
      setCurrentPage(clamped);
    },
    [numPages, pageHeights]
  );

  function onGotoSubmit(e: FormEvent) {
    e.preventDefault();
    const n = parseInt(gotoInput, 10);
    if (!Number.isFinite(n)) return;
    scrollToPage(n);
    setGotoInput("");
  }

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - WINDOW);
    const end = Math.min(numPages, currentPage + WINDOW);
    const set = new Set<number>();
    for (let i = start; i <= end; i++) set.add(i);
    return set;
  }, [currentPage, numPages]);

  const onPageMeasured = useCallback((pageNumber: number, height: number) => {
    setPageHeights((prev) => {
      if (prev[pageNumber] === height) return prev;
      return { ...prev, [pageNumber]: height };
    });
  }, []);

  const readerChrome = (
    <>
      <div className="flex items-center gap-2 px-2 sm:px-3 py-2 border-b border-white/10 bg-[#0b1220] shrink-0">
        <FileText className="w-4 h-4 shrink-0 text-amber-300" />
        <p className="text-xs sm:text-sm text-white/80 truncate font-medium flex-1 min-w-0">
          {title}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <ToolBtn
            onClick={() => setScale((s) => Math.max(0.55, Math.round((s - 0.15) * 100) / 100))}
            label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </ToolBtn>
          <span className="text-[11px] tabular-nums text-white/50 w-10 text-center hidden sm:inline">
            {Math.round(scale * 100)}%
          </span>
          <ToolBtn
            onClick={() => setScale((s) => Math.min(2.2, Math.round((s + 0.15) * 100) / 100))}
            label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
          {!fullscreen ? (
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/90 text-wisdom-dark text-[11px] font-bold"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Full screen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] font-bold"
            >
              <X className="w-4 h-4" />
              Exit
            </button>
          )}
        </div>
      </div>

      {numPages > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-2 border-b border-white/8 bg-[#0d1526] shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => scrollToPage(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-white/85 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <form onSubmit={onGotoSubmit} className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={numPages}
              value={gotoInput}
              placeholder={String(currentPage)}
              onChange={(e) => setGotoInput(e.target.value)}
              className="w-14 rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-center tabular-nums text-white focus:outline-none focus:border-amber-400/50"
            />
            <span className="text-[11px] text-white/45 tabular-nums">/ {numPages}</span>
            <button
              type="submit"
              className="px-2 py-1.5 rounded-lg border border-amber-400/30 text-[11px] font-semibold text-amber-200"
            >
              Go
            </button>
          </form>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => scrollToPage(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-white/85 disabled:opacity-30"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToPage(1)}
            className="p-1.5 rounded-lg border border-white/10 text-white/50"
            title="Top"
          >
            <ChevronsUp className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 bg-[#121212]"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center w-full py-24 px-6 gap-4">
            <p className="text-sm text-white/50">
              {loadPhase === "parse" ? "Opening book…" : "Loading book…"}
            </p>
            <div className="w-full max-w-sm">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-[width] duration-200 ease-out"
                  style={{
                    width: `${Math.max(4, loadProgress)}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={loadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-2 text-center text-[11px] tabular-nums text-white/40">
                {loadProgress}%
              </p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-28 w-full">
            <AlertCircle className="w-8 h-8 text-rose-400/80" />
            <p className="text-sm text-rose-200/90 text-center">{error}</p>
          </div>
        )}
        {!loading && !error && numPages > 0 && (
          <div className="flex flex-col items-center gap-3 py-3 px-2 sm:px-4 pb-20">
            {Array.from({ length: numPages }, (_, i) => {
              const pageNumber = i + 1;
              const active = visiblePages.has(pageNumber);
              const h = pageHeights[pageNumber] ?? DEFAULT_PAGE_H;
              return (
                <div
                  key={pageNumber}
                  data-page={pageNumber}
                  className="relative w-full flex justify-center"
                  style={{ minHeight: active ? undefined : h }}
                >
                  {active ? (
                    <PdfPage
                      pdf={pdfRef.current}
                      pageNumber={pageNumber}
                      scale={scale}
                      containerWidth={scrollWidth}
                      onMeasured={onPageMeasured}
                    />
                  ) : (
                    <div
                      className="w-full max-w-full rounded-sm bg-neutral-800/80 border border-white/5 flex items-center justify-center text-white/25 text-xs"
                      style={{ height: h }}
                    >
                      {pageNumber}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // Single mount only — never render readerChrome in both inline and portal
  // (dual mount caused black pages after fullscreen toggle).
  if (mounted && fullscreen) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a0a]"
        style={{ height: "100dvh", width: "100vw" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {readerChrome}
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-[10000] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-xl"
        >
          <X className="w-5 h-5" />
          Exit
        </button>
      </div>,
      document.body
    );
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/12 bg-neutral-950 overflow-hidden h-[min(72vh,680px)]">
      {readerChrome}
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="p-1.5 rounded-lg border border-white/12 text-white/75 hover:bg-white/5"
    >
      {children}
    </button>
  );
}

function PdfPage({
  pdf,
  pageNumber,
  scale,
  containerWidth,
  onMeasured,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any;
  pageNumber: number;
  scale: number;
  containerWidth: number;
  onMeasured: (page: number, height: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(true);
  const renderGen = useRef(0);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    const gen = ++renderGen.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let task: { cancel: () => void; promise: Promise<void> } | null = null;

    (async () => {
      try {
        setBusy(true);
        const pageObj = await pdf.getPage(pageNumber);
        if (cancelled || gen !== renderGen.current) return;

        const base = pageObj.getViewport({ scale: 1 });
        const fit =
          containerWidth > 48
            ? ((containerWidth - 24) / base.width) * scale
            : scale;
        const viewport = pageObj.getViewport({ scale: fit });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        // HD: use full devicePixelRatio (cap only on very high-DPI to limit RAM)
        const rawDpr =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const dpr = Math.min(rawDpr, 2.5);

        const w = Math.floor(viewport.width);
        const h = Math.floor(viewport.height);

        // Keep previous pixels visible until the new frame is ready (no black flash)
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        // Render into an offscreen canvas, then copy — avoids clearing the live canvas
        const off = document.createElement("canvas");
        off.width = Math.floor(w * dpr);
        off.height = Math.floor(h * dpr);
        const offCtx = off.getContext("2d", { alpha: false });
        if (!offCtx) return;
        offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = pageObj.render({
          canvasContext: offCtx,
          viewport,
          intent: "display",
        });
        task = renderTask;
        await renderTask.promise;

        if (cancelled || gen !== renderGen.current) return;

        canvas.width = off.width;
        canvas.height = off.height;
        const live = canvas.getContext("2d", { alpha: false });
        if (live) {
          live.setTransform(1, 0, 0, 1, 0, 0);
          live.drawImage(off, 0, 0);
        }

        setBusy(false);
        onMeasured(pageNumber, h);
      } catch (e) {
        if (
          e &&
          typeof e === "object" &&
          "name" in e &&
          (e as { name: string }).name === "RenderingCancelledException"
        ) {
          return;
        }
        console.warn("page render", pageNumber, e);
      }
    })();

    return () => {
      cancelled = true;
      task?.cancel();
      // Do NOT zero canvas size here — that caused black pages on fullscreen /
      // resize re-renders. Canvas is released when the page leaves the window
      // (component unmounts) via React removing the node.
    };
  }, [pdf, pageNumber, scale, containerWidth, onMeasured]);

  // Release GPU memory only when this page fully unmounts (left the render window)
  useEffect(() => {
    return () => {
      const c = canvasRef.current;
      if (c) {
        c.width = 0;
        c.height = 0;
      }
    };
  }, []);

  return (
    <div className="relative shadow-lg shadow-black/30 rounded-sm overflow-hidden bg-white">
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/80 text-white/40 text-xs min-h-[120px] z-10">
          {pageNumber}
        </div>
      )}
      <canvas ref={canvasRef} className="block max-w-full" />
      <span className="absolute bottom-1.5 right-2 text-[10px] font-semibold tabular-nums text-black/35 bg-white/70 px-1.5 py-0.5 rounded">
        {pageNumber}
      </span>
    </div>
  );
}
