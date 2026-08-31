"use client";

import { useEffect, useState } from "react";
import { FileText, Maximize2, Minimize2 } from "lucide-react";

type Props = {
  url: string;
  title: string;
  onOpened?: () => void;
};

/**
 * In-app PDF viewer — no download button, no "open in browser" link.
 * Uses browser PDF plugin inside a controlled iframe with chrome hidden
 * (#toolbar=0). Fullscreen stays on our page.
 */
export default function PdfReader({ url, title, onOpened }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Hide Acrobat/Chrome toolbar + nav panes when possible
  const embedUrl = (() => {
    try {
      const u = new URL(url);
      // fragment params for built-in PDF viewers
      u.hash = "toolbar=0&navpanes=0&scrollbar=1&view=FitH";
      return u.toString();
    } catch {
      return `${url}#toolbar=0&navpanes=0&scrollbar=1`;
    }
  })();

  useEffect(() => {
    setLoaded(false);
  }, [url]);

  return (
    <div
      className={`relative rounded-2xl border border-white/12 bg-black overflow-hidden ${
        fullscreen ? "fixed inset-2 z-[80] rounded-xl" : ""
      }`}
    >
      {/* Top bar — our chrome only */}
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

      {!loaded && (
        <div className="absolute inset-0 top-10 flex items-center justify-center bg-black/80 z-10 pointer-events-none">
          <p className="text-sm text-wisdom-muted">Loading reader…</p>
        </div>
      )}

      <iframe
        title={title}
        src={embedUrl}
        className={`w-full bg-neutral-900 ${
          fullscreen ? "h-[calc(100%-2.5rem)]" : "h-[70vh]"
        }`}
        // sandbox keeps it on-page; allow-scripts needed for some PDF engines
        sandbox="allow-scripts allow-same-origin allow-popups"
        // discourage download / open-external UX where browsers respect it
        allow="fullscreen"
        onLoad={() => {
          setLoaded(true);
          onOpened?.();
        }}
      />

      <p className="px-3 py-1.5 text-[10px] text-wisdom-muted border-t border-white/8 bg-wisdom-dark/80">
        Built-in reader · download disabled
      </p>
    </div>
  );
}
