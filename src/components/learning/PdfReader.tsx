"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Maximize2, Minimize2, AlertCircle } from "lucide-react";

type Props = {
  url: string;
  title: string;
  onOpened?: () => void;
};

/**
 * True in-app PDF reader.
 * Fetches the signed URL into a same-origin blob so mobile browsers
 * do not hand off to an external PDF app. No download button.
 */
export default function PdfReader({ url, title, onOpened }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const blobRef = useRef<string | null>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setBlobUrl(null);
    openedRef.current = false;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load PDF (${res.status})`);
        const blob = await res.blob();
        // Force application/pdf so the browser treats it as a document, not a download
        const pdfBlob =
          blob.type === "application/pdf"
            ? blob
            : new Blob([blob], { type: "application/pdf" });
        const objectUrl = URL.createObjectURL(pdfBlob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        blobRef.current = objectUrl;
        setBlobUrl(objectUrl);
        setLoading(false);
        if (!openedRef.current) {
          openedRef.current = true;
          onOpened?.();
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load PDF");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [url, onOpened]);

  return (
    <div
      className={`relative rounded-2xl border border-white/12 bg-neutral-950 overflow-hidden ${
        fullscreen ? "fixed inset-2 z-[80] rounded-xl" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-wisdom-dark/95">
        <p className="text-xs text-white/70 truncate flex items-center gap-1.5 min-w-0">
          <FileText className="w-3.5 h-3.5 shrink-0 text-amber-300" />
          <span className="truncate">{title}</span>
        </p>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/12 text-[11px] font-semibold text-white/80 hover:bg-white/5"
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

      {loading && (
        <div
          className={`flex items-center justify-center ${fullscreen ? "h-[calc(100%-2.5rem)]" : "h-[70vh]"}`}
        >
          <p className="text-sm text-wisdom-muted">Loading reader…</p>
        </div>
      )}

      {error && (
        <div
          className={`flex flex-col items-center justify-center gap-2 px-4 ${fullscreen ? "h-[calc(100%-2.5rem)]" : "h-[70vh]"}`}
        >
          <AlertCircle className="w-8 h-8 text-rose-400/80" />
          <p className="text-sm text-rose-200/90 text-center">{error}</p>
          <p className="text-xs text-wisdom-muted text-center max-w-xs">
            Check that the file is a valid PDF and your connection is stable.
          </p>
        </div>
      )}

      {blobUrl && !error && (
        <object
          data={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          type="application/pdf"
          className={`w-full bg-neutral-900 ${fullscreen ? "h-[calc(100%-2.5rem)]" : "h-[70vh]"}`}
          aria-label={title}
        >
          {/* Fallback for browsers that won't render <object> PDF */}
          <iframe
            title={title}
            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full bg-neutral-900 border-0"
          />
        </object>
      )}

      <p className="px-3 py-1.5 text-[10px] text-wisdom-muted border-t border-white/8 bg-wisdom-dark/80">
        In-app reader · no download
      </p>
    </div>
  );
}
