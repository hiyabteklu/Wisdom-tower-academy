"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listResources,
  getSignedContentUrl,
  saveProgress,
  getMyProgress,
  type LearningResource,
  type HubId,
} from "@/lib/content";
import { isPackageOwned } from "@/lib/ownership";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Download,
  Clock,
  FileText,
  Play,
  HelpCircle,
  Timer,
} from "lucide-react";
import NotesViewer from "@/components/learning/NotesViewer";
import QuizExamViewer from "@/components/learning/QuizExamViewer";
import FlashcardViewer from "@/components/learning/FlashcardViewer";

type Props = {
  scopePath: string;
  hub: HubId;
  packageId: string;
  accent?: string;
};

export default function HubContentView({
  scopePath,
  hub,
  packageId,
  accent = "text-amber-300",
}: Props) {
  const [items, setItems] = useState<LearningResource[]>([]);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<LearningResource | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const has = await isPackageOwned(packageId);
      if (cancelled) return;
      setOwned(has);
      if (!has) {
        setLoading(false);
        return;
      }
      const res = await listResources({
        scopePath,
        hub,
        publishedOnly: true,
      });
      if (!cancelled) {
        setItems(res.items);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scopePath, hub, packageId]);

  useEffect(() => {
    if (!active || !owned) return;
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setSeconds((s) => s + 1);
      if (tick % 30 === 0) {
        void saveProgress({
          resourceId: active.id,
          progressPct,
          addSeconds: 30,
          addFocusSeconds: document.visibilityState === "visible" ? 30 : 0,
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, owned, progressPct]);

  async function openItem(item: LearningResource) {
    setActive(item);
    const prog = await getMyProgress(item.id);
    setProgressPct(prog.pct);
    setSeconds(prog.totalSeconds);
    if (item.contentType === "pdf" && item.storagePath) {
      const signed = await getSignedContentUrl(item.storagePath);
      setPdfUrl(signed.url || null);
    } else {
      setPdfUrl(null);
    }
  }

  if (loading) {
    return (
      <p className="text-center text-wisdom-muted py-12 text-sm">Loading materials…</p>
    );
  }

  if (!owned) {
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-6 text-center">
        <p className="text-white font-semibold mb-2">Purchase required</p>
        <p className="text-sm text-wisdom-muted mb-4">
          Unlock this package to open books, notes, questions, and exams.
        </p>
        <Link
          href={`/checkout/${packageId}`}
          className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-wisdom-dark"
        >
          Buy package
        </Link>
      </div>
    );
  }

  if (active) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="text-sm text-cyan-300 hover:underline"
        >
          ← All items
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className={`font-display text-xl font-bold ${accent}`}>{active.title}</h2>
          <p className="text-xs text-wisdom-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(seconds / 60)}m studied · {Math.round(progressPct)}%
          </p>
        </div>

        {active.contentType === "pdf" && pdfUrl && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" /> Open reader tab
              </a>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
            <iframe
              title={active.title}
              src={pdfUrl}
              className="w-full h-[70vh] rounded-2xl border border-white/12 bg-black"
              onLoad={() => {
                setProgressPct((p) => Math.max(p, 5));
                void saveProgress({
                  resourceId: active.id,
                  progressPct: Math.max(progressPct, 5),
                  addSeconds: 0,
                });
              }}
            />
          </div>
        )}

        {active.contentType === "markdown" && (
          <NotesViewer
            body={active.bodyMd || ""}
            resourceId={active.id}
            onProgress={(pct) => {
              setProgressPct(pct);
              void saveProgress({ resourceId: active.id, progressPct: pct });
            }}
          />
        )}

        {active.contentType === "video_url" && (
          <div className="rounded-2xl border border-white/12 p-4">
            <p className="text-sm text-wisdom-muted mb-2 flex items-center gap-1">
              <Play className="w-4 h-4" /> Video
            </p>
            {active.bodyMd?.includes("youtube") || active.bodyMd?.includes("youtu.be") ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src={toEmbed(active.bodyMd)}
                  allowFullScreen
                  title={active.title}
                />
              </div>
            ) : (
              <a href={active.bodyMd || "#"} className="text-cyan-300 underline text-sm" target="_blank" rel="noreferrer">
                {active.bodyMd || "No URL"}
              </a>
            )}
          </div>
        )}

        {active.contentType === "flashcard_deck" && (
          <FlashcardViewer meta={active.meta} />
        )}

        {(active.contentType === "quiz" || active.contentType === "exam") && (
          <QuizExamViewer
            meta={active.meta}
            isExam={active.contentType === "exam"}
            resourceId={active.id}
          />
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/12 bg-wisdom-card p-8 text-center text-wisdom-muted text-sm">
        <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
        No published materials in this hub yet. Check back soon.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => void openItem(item)}
            className="w-full flex items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-3.5 text-left hover:border-amber-400/35"
          >
            {hub === "exams" ? (
              <Timer className="w-5 h-5 text-emerald-400" />
            ) : hub === "question-banks" ? (
              <HelpCircle className="w-5 h-5 text-cyan-400" />
            ) : (
              <BookOpen className="w-5 h-5 text-amber-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate">{item.title}</p>
              {item.chapter != null && (
                <p className="text-xs text-wisdom-muted">Chapter {item.chapter}</p>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function toEmbed(url: string) {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {
    /* ignore */
  }
  return url;
}
