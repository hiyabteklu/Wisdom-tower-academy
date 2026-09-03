"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  listResources,
  saveProgress,
  getMyProgress,
  focusStatusLabel,
  type LearningResource,
  type HubId,
  type ProgressMeta,
} from "@/lib/content";
import { isPackageOwned } from "@/lib/ownership";
import {
  BookOpen,
  Clock,
  FileText,
  Play,
  HelpCircle,
  Timer,
  Layers,
  BarChart3,
  Gauge,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import NotesViewer from "@/components/learning/NotesViewer";
import QuizExamViewer from "@/components/learning/QuizExamViewer";
import FlashcardViewer from "@/components/learning/FlashcardViewer";
import PdfReader from "@/components/learning/PdfReader";

type Props = {
  scopePath: string;
  hub: HubId;
  packageId: string;
  accent?: string;
  trackerScopeId?: string;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}

function completionLabel(pct: number) {
  if (pct >= 85) return "Nearly done";
  if (pct >= 40) return "In progress";
  if (pct > 0) return "Just started";
  return "Not started";
}

function hubIcon(hub: HubId, className = "w-7 h-7") {
  if (hub === "exams") return <Timer className={`${className} text-emerald-400`} />;
  if (hub === "question-banks") return <HelpCircle className={`${className} text-cyan-400`} />;
  if (hub === "flashcards") return <Layers className={`${className} text-violet-400`} />;
  if (hub === "videos") return <Play className={`${className} text-rose-400`} />;
  if (hub === "short-notes") return <FileText className={`${className} text-sky-400`} />;
  return <BookOpen className={`${className} text-amber-400`} />;
}

function hubAccentClass(hub: HubId) {
  if (hub === "exams") return "text-emerald-300";
  if (hub === "question-banks") return "text-cyan-300";
  if (hub === "flashcards") return "text-violet-300";
  if (hub === "videos") return "text-rose-300";
  if (hub === "short-notes") return "text-sky-300";
  return "text-amber-300";
}

function hubItemsLabel(hub: HubId) {
  if (hub === "books") return "all books";
  if (hub === "short-notes") return "all notes";
  if (hub === "videos") return "all videos";
  if (hub === "flashcards") return "all decks";
  if (hub === "question-banks") return "all question banks";
  if (hub === "exams") return "all exams";
  return "all items";
}

export default function HubContentView({
  scopePath,
  hub,
  packageId,
  accent = "text-amber-300",
  trackerScopeId,
}: Props) {
  const [items, setItems] = useState<LearningResource[]>([]);
  const [owned, setOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<LearningResource | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [progMeta, setProgMeta] = useState<ProgressMeta>({});
  const videoWatchRef = useRef(0);

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
      if (document.visibilityState === "visible") {
        setFocusSeconds((f) => f + 1);
      }
      if (active.contentType === "video_url") {
        videoWatchRef.current += 1;
      }
      if (tick % 30 === 0) {
        const videoMeta =
          active.contentType === "video_url"
            ? {
                video: {
                  watchSeconds:
                    (Number(progMeta.video?.watchSeconds || 0) || 0) +
                    videoWatchRef.current,
                },
              }
            : undefined;
        if (videoMeta) videoWatchRef.current = 0;
        void saveProgress({
          resourceId: active.id,
          progressPct,
          addSeconds: 30,
          addFocusSeconds: document.visibilityState === "visible" ? 30 : 0,
          meta: videoMeta,
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, owned, progressPct, progMeta.video?.watchSeconds]);

  async function openItem(item: LearningResource) {
    setActive(item);
    videoWatchRef.current = 0;
    const prog = await getMyProgress(item.id);
    setProgressPct(prog.pct);
    setSeconds(prog.totalSeconds);
    setFocusSeconds(prog.focusSeconds);
    setProgMeta(prog.meta || {});

    if (item.contentType === "pdf" && item.storagePath) {
      setPdfUrl(`/api/content/pdf?path=${encodeURIComponent(item.storagePath)}`);
    } else {
      setPdfUrl(null);
    }
  }

  function backToItems() {
    setActive(null);
    setPdfUrl(null);
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
    const quiz = progMeta.quiz;
    const fc = progMeta.flashcards;
    const vid = progMeta.video;
    const isBookLike = hub === "books" || active.contentType === "pdf";
    const isNotes = hub === "short-notes" || active.contentType === "markdown";
    const focusNow = focusStatusLabel(focusSeconds, seconds);

    return (
      <div className="space-y-4 w-full max-w-full">
        {/* Always visible — returns to the items list, not the parent hub route */}
        <button
          type="button"
          onClick={backToItems}
          className="sticky top-[4.25rem] z-20 inline-flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-[#0b1220]/95 px-3.5 py-2.5 text-sm font-bold text-cyan-200 shadow-lg backdrop-blur-md hover:bg-cyan-500/15 hover:border-cyan-400/55 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {hubItemsLabel(hub)}
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className={`font-display text-xl sm:text-2xl font-bold ${accent}`}>{active.title}</h2>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {(isBookLike || isNotes) && (
            <>
              <Chip tone="cyan">
                <Clock className="w-3 h-3 inline mr-1" />
                Reading {formatTime(seconds)}
              </Chip>
              <Chip tone="amber">
                <Gauge className="w-3 h-3 inline mr-1" />
                Focus: {focusNow}
              </Chip>
              <Chip>Session: {completionLabel(progressPct)}</Chip>
              <Chip tone="emerald">
                <BarChart3 className="w-3 h-3 inline mr-1" />
                {Math.round(progressPct)}% complete
              </Chip>
            </>
          )}

          {hub === "videos" && (
            <>
              <Chip tone="cyan">
                Watch {formatTime(Number(vid?.watchSeconds || seconds))}
              </Chip>
              <Chip tone="amber">{Math.round(progressPct)}%</Chip>
            </>
          )}

          {hub === "flashcards" && fc && (
            <>
              <Chip>
                Cards {fc.seen}/{fc.total}
              </Chip>
              <Chip tone="emerald">Know {fc.know}</Chip>
              <Chip tone="amber">Learning {fc.learning}</Chip>
              <Chip tone="rose">Again {fc.again}</Chip>
              <Chip tone="cyan">Mastery {fc.accuracy}%</Chip>
            </>
          )}

          {(hub === "question-banks" || hub === "exams") && quiz && (
            <>
              <Chip>
                Attempted {quiz.attempted}/{quiz.total}
              </Chip>
              <Chip tone="emerald">Correct {quiz.correct}</Chip>
              {"wrong" in quiz && (
                <Chip tone="rose">
                  Wrong {Number((quiz as { wrong?: number }).wrong || 0)}
                </Chip>
              )}
              {"skipped" in quiz && (
                <Chip>
                  Skipped {Number((quiz as { skipped?: number }).skipped || 0)}
                </Chip>
              )}
              <Chip tone="amber">Accuracy {quiz.accuracy}%</Chip>
              {"elapsedSec" in quiz && (
                <Chip tone="cyan">
                  Time{" "}
                  {formatTime(Number((quiz as { elapsedSec?: number }).elapsedSec || 0))}
                </Chip>
              )}
            </>
          )}
        </div>

        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>

        {active.contentType === "pdf" && pdfUrl && (
          <PdfReader
            url={pdfUrl}
            title={active.title}
            onOpened={() => {
              setProgressPct((p) => Math.max(p, 5));
              void saveProgress({
                resourceId: active.id,
                progressPct: Math.max(progressPct, 5),
                addSeconds: 0,
              });
            }}
          />
        )}

        {active.contentType === "pdf" && !pdfUrl && (
          <p className="text-sm text-wisdom-muted">Could not load this PDF.</p>
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
                  onLoad={() => setProgressPct((p) => Math.max(p, 10))}
                />
              </div>
            ) : (
              <a
                href={active.bodyMd || "#"}
                className="text-cyan-300 underline text-sm"
                target="_blank"
                rel="noreferrer"
              >
                {active.bodyMd || "No URL"}
              </a>
            )}
          </div>
        )}

        {active.contentType === "flashcard_deck" && (
          <FlashcardViewer meta={active.meta} resourceId={active.id} />
        )}

        {(active.contentType === "quiz" || active.contentType === "exam") && (
          <QuizExamViewer
            meta={active.meta}
            isExam={active.contentType === "exam"}
            resourceId={active.id}
            title={active.title}
            trackerScopeId={trackerScopeId}
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

  const titleAccent = accent || hubAccentClass(hub);

  return (
    <ul className="space-y-3 w-full max-w-full">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => void openItem(item)}
            className="w-full flex items-center gap-4 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-4 sm:px-5 sm:py-5 text-left hover:border-amber-400/40 hover:bg-wisdom-card/90 transition-colors shadow-sm group"
          >
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/50">
              {hubIcon(hub, "w-7 h-7 sm:w-8 sm:h-8")}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-display text-base sm:text-lg font-bold truncate ${titleAccent}`}>
                {item.title}
              </p>
              {item.chapter != null && (
                <p className="text-xs sm:text-sm text-wisdom-muted mt-0.5">
                  Chapter {item.chapter}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-wisdom-muted shrink-0 group-hover:text-amber-300 transition-colors" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Chip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "emerald" | "amber" | "rose" | "cyan";
}) {
  const map = {
    muted: "border-white/10 text-wisdom-muted",
    emerald: "border-emerald-400/25 text-emerald-200 bg-emerald-500/10",
    amber: "border-amber-400/25 text-amber-200 bg-amber-500/10",
    rose: "border-rose-400/25 text-rose-200 bg-rose-500/10",
    cyan: "border-cyan-400/25 text-cyan-200 bg-cyan-500/10",
  };
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 font-medium ${map[tone]}`}
    >
      {children}
    </span>
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
