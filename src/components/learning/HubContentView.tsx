"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  listResources,
  getSignedContentUrl,
  saveProgress,
  getMyProgress,
  type LearningResource,
  type HubId,
  type ProgressMeta,
} from "@/lib/content";
import { isPackageOwned } from "@/lib/ownership";
import {
  BookOpen,
  Download,
  Clock,
  FileText,
  Play,
  HelpCircle,
  Timer,
  Layers,
  BarChart3,
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

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}

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

  // Study-time ticker
  useEffect(() => {
    if (!active || !owned) return;
    let tick = 0;
    const id = window.setInterval(() => {
      tick += 1;
      setSeconds((s) => s + 1);
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
    setProgMeta(prog.meta || {});
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
    const quiz = progMeta.quiz;
    const fc = progMeta.flashcards;
    const vid = progMeta.video;

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
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-wisdom-dark/50 px-2.5 py-1 text-wisdom-muted">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(seconds)} studied
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-amber-200 font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>

        {/* Type-specific progress chips */}
        {(quiz || fc || vid) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {quiz && (
              <>
                <Chip>
                  Attempted {quiz.attempted}/{quiz.total}
                </Chip>
                <Chip tone="emerald">Correct {quiz.correct}</Chip>
                <Chip tone="amber">Accuracy {quiz.accuracy}%</Chip>
              </>
            )}
            {fc && (
              <>
                <Chip>
                  Cards {fc.seen}/{fc.total}
                </Chip>
                <Chip tone="emerald">Know {fc.know}</Chip>
                <Chip tone="amber">Learning {fc.learning}</Chip>
                <Chip tone="rose">Again {fc.again}</Chip>
              </>
            )}
            {vid && (
              <Chip tone="cyan">
                Watch time {formatTime(Number(vid.watchSeconds || 0))}
              </Chip>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
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
              <Play className="w-4 h-4" /> Video · watch time tracked while this page is open
            </p>
            {active.bodyMd?.includes("youtube") || active.bodyMd?.includes("youtu.be") ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src={toEmbed(active.bodyMd)}
                  allowFullScreen
                  title={active.title}
                  onLoad={() => {
                    setProgressPct((p) => Math.max(p, 10));
                  }}
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
    <span className={`rounded-lg border px-2.5 py-1 font-medium ${map[tone]}`}>
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
