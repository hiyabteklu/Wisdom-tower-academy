"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  X,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  Sparkles,
  Square,
} from "lucide-react";
import RichContent from "@/components/learning/RichContent";
import "katex/dist/katex.min.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultFullScreen?: boolean;
  isEmbedded?: boolean;
  courseContext?: string;
};

const STORAGE_KEY = "wt_ai_tutor_chat_v2";

const DEFAULT_WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Welcome! I am your **Wisdom Tower AI Tutor** — your friendly academic coach.\n\nWhether you're tackling **Grade 9–12** secondary concepts, navigating **Freshman university** courses (Calculus, Physics, C++, Logic...), or diving into **Senior Engineering (ECE)** and national entrance exams (**UAT, GAT, COC, Exit Exams**), I'm here to break down problems step-by-step with clear derivations.\n\nWhat concept, formula, or problem are we conquering today?",
  timestamp: "Just now",
  suggestions: [
    "How to calculate Ethiopian university GPA?",
    "Explain Newton's Laws with examples",
    "Derivative power rule step-by-step",
  ],
};

export default function AiTutor({
  isOpen,
  onClose,
  courseContext,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [DEFAULT_WELCOME];
  });

  const [input, setInput] = useState("");
  // isThinking is true ONLY while waiting for the very first token
  const [isThinking, setIsThinking] = useState(false);
  // isStreaming is true while tokens are actively streaming in
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic visual viewport positioning for mobile/Android WebViews
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist messages in localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  // Track visualViewport so the composer stays strictly pinned above mobile keyboard
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => {
      if (window.innerWidth < 640) {
        if (window.visualViewport) {
          const vv = window.visualViewport;
          setViewportStyle({
            position: "fixed",
            top: `${vv.offsetTop}px`,
            left: `${vv.offsetLeft}px`,
            width: `${vv.width}px`,
            height: `${vv.height}px`,
            maxHeight: `${vv.height}px`,
            bottom: "auto",
          });
        } else {
          setViewportStyle({
            position: "fixed",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100dvh",
            maxHeight: "100dvh",
          });
        }
      } else {
        setViewportStyle({});
      }
    };

    updateViewport();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
    }
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", updateViewport);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", updateViewport);
    };
  }, []);

  const keepInputVisible = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      requestAnimationFrame(() => {
        inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    keepInputVisible();
    setTimeout(keepInputVisible, 150);
    setTimeout(keepInputVisible, 320);
  }, [keepInputVisible]);

  // Scroll to bottom when new messages arrive or stream updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, isThinking]);

  if (!isOpen) return null;

  const isBusy = isThinking || isStreaming;

  async function sendMessage(textOverride?: string) {
    const q = (textOverride !== undefined ? textOverride : input).trim();
    if (!q || isBusy) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsThinking(true);
    setIsStreaming(false);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const botMessageId = "bot-" + Date.now();
    const botTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let accumulatedText = "";
    let hasReceivedFirstToken = false;

    try {
      const historyPayload = nextHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          courseContext,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Missing response body stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === "chunk" && data.text) {
              if (!hasReceivedFirstToken) {
                hasReceivedFirstToken = true;
                setIsThinking(false); // Stop "Thinking" immediately upon first token!
                setIsStreaming(true);
                accumulatedText = data.text;

                setMessages((prev) => [
                  ...prev,
                  {
                    id: botMessageId,
                    role: "assistant",
                    content: accumulatedText,
                    timestamp: botTimestamp,
                  },
                ]);
              } else {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } else if (data.type === "suggestions" && Array.isArray(data.suggestions)) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMessageId ? { ...m, suggestions: data.suggestions } : m
                )
              );
            }
          } catch {
            // Ignore incomplete chunks
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.log("[AI Tutor] Stream aborted by user");
        // Keep partial text if already generated
        if (!hasReceivedFirstToken) {
          // If stopped before any token arrived, show clean notice
          setMessages((prev) => [
            ...prev,
            {
              id: botMessageId,
              role: "assistant",
              content: "Response stopped. What would you like to explore instead?",
              timestamp: botTimestamp,
              suggestions: [
                "Give me a practice problem",
                "Explain the formula step-by-step",
                "What are common exam pitfalls?",
              ],
            },
          ]);
        }
      } else {
        console.warn("[AI Tutor] Request failed:", err?.message || err);
        const calmNotice =
          "The Wisdom Tower AI Tutor is currently experiencing high demand. Please wait a moment and try asking your question again.";

        if (!hasReceivedFirstToken) {
          setMessages((prev) => [
            ...prev,
            {
              id: "err-" + Date.now(),
              role: "assistant",
              content: calmNotice,
              timestamp: botTimestamp,
              suggestions: [
                "Try asking again",
                "Explain in simpler terms",
                "Give me an example",
              ],
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: m.content + "\n\n*(Response stopped due to high server demand. You can ask to continue.)*",
                    suggestions: ["Please continue where you left off", "Summarize this topic"],
                  }
                : m
            )
          );
        }
      }
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    setIsStreaming(false);
    // User can type again immediately
    inputRef.current?.focus();
  }

  function handleCopy(id: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function handleClear() {
    if (isBusy) {
      handleStop();
    }
    const freshWelcome: Message = {
      ...DEFAULT_WELCOME,
      id: "welcome-" + Date.now(),
      content: "Chat cleared. What concept or problem would you like to explore next?",
      timestamp: "Just now",
      suggestions: [
        "Review high school physics formula",
        "Freshman calculus limit problem",
        "Common Ethiopian matriculation traps",
      ],
    };
    setMessages([freshWelcome]);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([freshWelcome]));
      } catch {}
    }
    inputRef.current?.focus();
  }

  function handleSuggestionClick(prompt: string) {
    if (isBusy) return;
    sendMessage(prompt);
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex flex-col bg-[#050914] w-full h-[100dvh] max-h-[100dvh] overflow-hidden sm:relative sm:inset-auto sm:z-auto sm:w-full sm:max-w-4xl sm:mx-auto sm:h-[680px] sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-cyan-400/30 sm:bg-[#091122]/95 sm:backdrop-blur-2xl sm:shadow-2xl sm:ring-1 sm:ring-cyan-500/20 animate-in fade-in duration-200"
      style={viewportStyle}
    >
      {/* ── Top Header ── */}
      <header className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-white/10 bg-[#0c162a]/95 backdrop-blur-xl flex items-center justify-between shrink-0 select-none z-20 pt-[max(0.6rem,env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-100" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
              Wisdom Tower AI Tutor
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Ethiopian Academic Study Coach
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Clear conversation button */}
          <button
            type="button"
            onClick={handleClear}
            title="Clear chat history"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Clear chat</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            title="Close AI Tutor and return"
            aria-label="Close AI Tutor"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 hover:text-white border border-rose-500/40 text-xs sm:text-sm font-bold active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* ── Scrollable Messages Container ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4">
        {messages.map((m, index) => {
          const isBot = m.role === "assistant";
          const isLatestBot = isBot && index === messages.length - 1;

          return (
            <div key={m.id} className="space-y-2.5">
              <div
                className={`flex gap-2.5 sm:gap-3 ${isBot ? "items-start" : "items-end justify-end"}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`group relative rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed ${
                    isBot
                      ? "w-full max-w-full sm:max-w-[92%] bg-[#0c1628]/95 border border-white/10 text-slate-100 shadow-md"
                      : "max-w-[90%] sm:max-w-[80%] bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-medium rounded-br-xs shadow-md shadow-cyan-500/20"
                  }`}
                >
                  {/* KaTeX and Markdown parsed rich mathematical body */}
                  <div className="break-words font-sans">
                    <RichContent
                      body={m.content}
                      className={
                        isBot
                          ? "text-slate-100 study-prose text-sm sm:text-base"
                          : "text-slate-950 font-medium text-sm sm:text-base"
                      }
                    />
                  </div>

                  <div
                    className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                      isBot ? "text-slate-400" : "text-slate-900/75"
                    }`}
                  >
                    <span>{m.timestamp}</span>

                    {isBot && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity cursor-pointer inline-flex items-center gap-1 text-slate-400 hover:text-white"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mb-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* ── Follow-up Suggestions Chips (up to 3 short tappable prompts) ── */}
              {isBot && m.suggestions && m.suggestions.length > 0 && (!isBusy || !isLatestBot) && (
                <div className="pl-10 sm:pl-11 pr-2 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {m.suggestions.slice(0, 3).map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-200 hover:text-white border border-cyan-400/25 hover:border-cyan-400/50 transition-all active:scale-95 text-left cursor-pointer shadow-xs disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-300 shrink-0" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Compact Academy Brand "Thinking" Indicator (Active ONLY until first token) ── */}
        {isThinking && (
          <div className="flex items-start gap-2.5 sm:gap-3 animate-in fade-in duration-150">
            {/* Tutor avatar with brand glow */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>

            {/* Compact Brand Thinking Bubble */}
            <div className="rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#0c1628]/95 border border-cyan-400/25 text-slate-100 shadow-lg flex items-center gap-3">
              {/* Academy Brand Motion Circular Ring */}
              <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
              </div>

              {/* Thinking status indicator with brand rhythmic bouncing dots */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-cyan-200 tracking-wide">
                  Thinking
                </span>
                <span className="flex items-center gap-0.5 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Fixed Bottom Composer Bar (Always Pinned Above Virtual Keyboard) ── */}
      <footer className="shrink-0 p-2.5 sm:p-3.5 border-t border-white/10 bg-[#070d1d] z-30 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.4rem))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto w-full"
        >
          <input
            ref={inputRef}
            type="text"
            id="wt-ai-tutor-input"
            name="query"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              keepInputVisible();
            }}
            onFocus={handleInputFocus}
            onClick={handleInputFocus}
            placeholder={
              isBusy
                ? "AI Tutor is responding (click Stop to cancel)..."
                : "Ask a concept, formula, or problem…"
            }
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="send"
            className="flex-1 bg-[#060b17] border border-white/15 focus:border-cyan-400 rounded-2xl px-3.5 py-2.5 sm:py-3 text-base text-white placeholder-slate-400 focus:outline-none transition-colors"
          />

          {/* Abort button when loading/streaming, Send button otherwise */}
          {isBusy ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/40 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 sm:p-3 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/25 shrink-0 flex items-center justify-center"
              aria-label="Send question"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
}
