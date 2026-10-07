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
} from "lucide-react";
import RichContent from "@/components/learning/RichContent";
import "katex/dist/katex.min.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultFullScreen?: boolean;
  isEmbedded?: boolean;
  courseContext?: string;
};

export default function AiTutor({
  isOpen,
  onClose,
  courseContext,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Welcome! I am your **Wisdom Tower AI Tutor**.\n\nAsk me any concept, formula, homework problem, or practice question from your high school, freshman, or engineering tracks. How can I help your studies today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic visual viewport positioning for mobile/Android WebViews
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track visualViewport so the composer stays strictly pinned above the mobile keyboard
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
    // Re-verify after virtual keyboard transitions finish on Android/iOS
    setTimeout(keepInputVisible, 150);
    setTimeout(keepInputVisible, 320);
  }, [keepInputVisible]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  async function sendMessage() {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          courseContext,
        }),
      });

      const data = await res.json().catch(() => null);

      const botReply =
        data?.reply ||
        "The Wisdom Tower AI Tutor is currently experiencing high demand. Please wait a moment and try asking your question again.";

      const botMsg: Message = {
        id: "bot-" + Date.now(),
        role: "assistant",
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content:
            "The Wisdom Tower AI Tutor is currently experiencing high demand. Please wait a moment and try asking your question again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function handleClear() {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Chat cleared. What concept or problem would you like to explore next?",
        timestamp: "Just now",
      },
    ]);
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
              Academic Problem Solver
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Clear conversation */}
          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear conversation"
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Prominent, always-reachable Close button */}
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
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          return (
            <div
              key={m.id}
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
          );
        })}

        {/* ── Compact Academy Brand "Thinking" Indicator ── */}
        {loading && (
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
            placeholder="Ask a question, formula, or problem…"
            disabled={loading}
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="send"
            className="flex-1 bg-[#060b17] border border-white/15 focus:border-cyan-400 rounded-2xl px-3.5 py-2.5 sm:py-3 text-base text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 sm:p-3 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/25 shrink-0 flex items-center justify-center"
            aria-label="Send question"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
