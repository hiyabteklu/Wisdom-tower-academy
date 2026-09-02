"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  listResources,
  saveProgress,
  getMyProgress,
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
} from "lucide-react";
import NotesViewer from "@/components/learning/NotesViewer";
import QuizExamViewer from "@/components/learning/QuizExamViewer";
import FlashcardViewer from "@/components/learning/FlashcardViewer";
import PdfReader from "@/components/learning/PdfReader";
import { isPackageFreeForLoggedIn } from "@/data/packages";

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

function focusLabel(focusSec: number, totalSec: number) {
  if (totalSec < 30) return "—";
  const ratio = focusSec / Math.max(1, totalSec);
  if (ratio >= 0.75) return "Intense";
  if (ratio >= 0.4) return "Medium";
  return "Fast";
}

function completionLabel(pct: number) {
  if (pct >= 85) return "Long";
  if (pct >= 40) return "Medium";
  if (pct > 0) return "Short";
  return "Not started";
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

  if (loading) {
    return (
      <p className="text-center text-wisdom-muted py-12 text-sm">Loading materials…</p>
    );
  }

  if (!owned) {
    const freeForSignedIn = isPackageFreeForLoggedIn(packageId);
    return (
      <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-6 text-center">
        <p className="text-white font-semibold mb-2">
          {freeForSignedIn ? "Sign in required" : "Purchase required"}
        </p>
        {freeForSignedIn ? (
          <p className="text-sm text-wisdom-muted mb-4">
            This package is free for signed-in users. Log in to open books, notes, questions, and
            exams.
          </p>
        ) : (
          <p className="text-sm text-wisdom-muted mb-4">
            Unlock this package to open books, notes, questions, and exams.
          </p>
        )}
        <Link
          href={freeForSignedIn ? "/login" : `/checkout/${packageId}`}
          className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-wisdom-dark"
        >
          {freeForSignedIn ? "Log in" : "Buy package"}
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

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActive(null)}
          className="text-sm text-cyan-300 hover:underline"
        >
          ← All items
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className={`font-display text-xl font-bold ${accent}`}>{active.title}</h2>
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
                Focus {focusLabel(focusSeconds, seconds)}
              </Chip>
              <Chip>Session {completionLabel(progressPct)}</Chip>
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

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => void openItem(item)}
            className="w-full flex items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-3.5 text-left hover:border-amber-400/35 transition-colors"
          >
            {hub === "exams" ? (
              <Timer className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : hub === "question-banks" ? (
              <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />
            ) : hub === "flashcards" ? (
              <Layers className="w-5 h-5 text-violet-400 shrink-0" />
            ) : hub === "videos" ? (
              <Play className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
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
