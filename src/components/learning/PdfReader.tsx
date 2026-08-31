"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
  /** Called when current visible page changes (for progress) */
  onPageChange?: (page: number, total: number) => void;
};

/** True in-app PDF: continuous vertical scroll + real fullscreen. */
export default function PdfReader({ url, title, onOpened, onPageChange }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoInput, setGotoInput] = useState("");

  const shellRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);
  const openedRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const onPageChangeRef = useRef(onPageChange);
  onOpenedRef.current = onOpened;
  onPageChangeRef.current = onPageChange;

  // Lock body scroll in fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // Escape exits fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  // Load PDF once per URL
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setNumPages(0);
    setCurrentPage(1);
    pdfRef.current = null;
    openedRef.current = false;
    pageRefs.current = [];

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
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

  // Track visible page while scrolling
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !numPages) return;

    const obs = new IntersectionObserver(
      (entries) => {
        let best: { page: number; ratio: number } | null = null;
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.page);
          if (!idx || !e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { page: idx, ratio: e.intersectionRatio };
          }
        }
        if (best) {
          setCurrentPage(best.page);
          onPageChangeRef.current?.(best.page, numPages);
        }
      },
      { root, threshold: [0.25, 0.5, 0.75] }
    );

    pageRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [numPages, loading]);

  const scrollToPage = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(numPages, p));
      const el = pageRefs.current[clamped - 1];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setCurrentPage(clamped);
      }
    },
    [numPages]
  );

  function onGotoSubmit(e: FormEvent) {
    e.preventDefault();
    const n = parseInt(gotoInput, 10);
    if (!Number.isFinite(n)) return;
    scrollToPage(n);
    setGotoInput("");
  }

  const shell = (
    <div
      ref={shellRef}
      className={`flex flex-col bg-neutral-950 border border-white/12 overflow-hidden ${
        fullscreen
          ? "fixed inset-0 z-[200] rounded-none border-0"
          : "relative rounded-2xl"
      }`}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-2 sm:px-3 py-2 border-b border-white/10 bg-[#0b1220]/98 shrink-0 backdrop-blur">
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
            onClick={() => setScale((s) => Math.min(2.4, Math.round((s + 0.15) * 100) / 100))}
            label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>

          {!fullscreen ? (
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/90 text-wisdom-dark text-[11px] font-bold hover:bg-amber-400 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Full screen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] font-bold hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/30"
            >
              <X className="w-4 h-4" />
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Nav bar */}
      {numPages > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-2 border-b border-white/8 bg-[#0d1526] shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => scrollToPage(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-white/85 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <form onSubmit={onGotoSubmit} className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/45 hidden sm:inline">Page</span>
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
              className="px-2 py-1.5 rounded-lg border border-amber-400/30 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/10"
            >
              Go
            </button>
          </form>

          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => scrollToPage(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-white/85 hover:bg-white/5 disabled:opacity-30"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollToPage(1)}
            className="p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5"
            title="Top"
          >
            <ChevronsUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scrollable pages */}
      <div
        ref={scrollRef}
        className={`overflow-y-auto overflow-x-hidden flex-1 bg-[#121212] ${
          fullscreen ? "min-h-0" : "h-[min(72vh,680px)]"
        }`}
      >
        {loading && (
          <div className="flex items-center justify-center w-full py-28">
            <p className="text-sm text-white/40">Loading…</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-28 w-full">
            <AlertCircle className="w-8 h-8 text-rose-400/80" />
            <p className="text-sm text-rose-200/90 text-center">{error}</p>
          </div>
        )}

        {!loading && !error && numPages > 0 && (
          <div className="flex flex-col items-center gap-3 py-3 px-2 sm:px-4">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={i + 1}
                pdf={pdfRef.current}
                pageNumber={i + 1}
                scale={scale}
                containerWidth={scrollRef.current?.clientWidth ?? 360}
                setRef={(el) => {
                  pageRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating exit when fullscreen (always visible) */}
      {fullscreen && (
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="fixed top-3 right-3 z-[210] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-xl shadow-black/40 hover:bg-rose-400"
        >
          <X className="w-5 h-5" />
          Exit full screen
        </button>
      )}
    </div>
  );

  return shell;
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
      className="p-1.5 rounded-lg border border-white/12 text-white/75 hover:bg-white/5 hover:text-white"
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
  setRef,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any;
  pageNumber: number;
  scale: number;
  containerWidth: number;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    setRef(wrapRef.current);
    return () => setRef(null);
  }, [setRef]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let task: { cancel: () => void } | null = null;

    (async () => {
      try {
        const pageObj = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const base = pageObj.getViewport({ scale: 1 });
        const fit =
          containerWidth > 48
            ? ((containerWidth - 24) / base.width) * scale
            : scale;
        const viewport = pageObj.getViewport({ scale: fit });

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const w = Math.floor(viewport.width);
        const h = Math.floor(viewport.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        task = pageObj.render({ canvasContext: ctx, viewport });
        await task.promise;
        if (!cancelled) setRendered(true);
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
    };
  }, [pdf, pageNumber, scale, containerWidth]);

  return (
    <div
      ref={wrapRef}
      data-page={pageNumber}
      className="relative shadow-2xl shadow-black/40 rounded-sm overflow-hidden bg-white"
    >
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-white/30 text-xs">
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
