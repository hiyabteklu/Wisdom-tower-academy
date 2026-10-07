"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Maximize2,
  Minimize2,
  Minus,
  Move,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  Sparkles,
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
  defaultFullScreen = false,
  isEmbedded = false,
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
  const [isFullScreen, setIsFullScreen] = useState(defaultFullScreen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Floating draggable position state
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultFullScreen) {
      setIsFullScreen(true);
    }
  }, [defaultFullScreen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, messages]);

  // Drag-and-move handler for the floating card
  const handleDragStart = (clientX: number, clientY: number) => {
    if (isFullScreen || isEmbedded) return;
    const rect = cardRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : (pos?.x ?? 16);
    const currentY = rect ? rect.top : (pos?.y ?? 64);

    dragStartRef.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: currentX,
      posY: currentY,
    };
    isDraggingRef.current = true;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const curX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const curY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = curX - dragStartRef.current.mouseX;
      const dy = curY - dragStartRef.current.mouseY;

      const cardW = cardRef.current?.offsetWidth || 340;
      const newX = Math.max(8, Math.min(window.innerWidth - cardW - 8, dragStartRef.current.posX + dx));
      const newY = Math.max(56, Math.min(window.innerHeight - 120, dragStartRef.current.posY + dy));

      setPos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  };

  if (!isOpen) return null;

  // Minimized floating bubble
  if (isMinimized && !isEmbedded) {
    return (
      <div
        className="fixed z-[140] flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-700 text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 cursor-pointer active:scale-95 transition-all select-none animate-in fade-in"
        style={{
          bottom: "5.5rem",
          right: "1rem",
        }}
        onClick={() => setIsMinimized(false)}
        title="Tap to restore AI Tutor"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
        </div>
        <span>AI Tutor</span>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
          Tap to open
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-1 p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

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
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      ref={cardRef}
      className={
        isFullScreen
          ? "fixed inset-0 z-[160] bg-[#050914] flex flex-col h-[100dvh] overflow-hidden animate-in fade-in duration-200"
          : isEmbedded
            ? "relative w-full max-w-4xl mx-auto h-[calc(100dvh-12rem)] min-h-[480px] max-h-[740px] rounded-2xl sm:rounded-3xl border border-cyan-400/30 bg-[#091122]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-cyan-500/20 animate-in fade-in duration-200"
            : pos
              ? "fixed z-[140] w-[min(34rem,calc(100vw-1rem))] h-[min(36rem,calc(100dvh-7.5rem))] rounded-2xl sm:rounded-3xl border border-cyan-400/30 bg-[#091122]/98 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-cyan-500/20 animate-in fade-in"
              : "fixed inset-x-2 sm:inset-x-auto sm:right-6 bottom-20 sm:bottom-20 z-[140] w-auto sm:w-[32rem] h-[min(36rem,calc(100dvh-7.5rem))] max-h-[calc(100dvh-6.5rem)] min-h-[380px] rounded-2xl sm:rounded-3xl border border-cyan-400/30 bg-[#091122]/98 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-cyan-500/20 animate-in slide-in-from-bottom-4 duration-200"
      }
      style={
        !isFullScreen && !isEmbedded && pos
          ? {
              left: `${pos.x}px`,
              top: `${pos.y}px`,
            }
          : undefined
      }
    >
      {/* ── Fixed Top Header (Draggable when floating) ── */}
      <header
        onMouseDown={(e) => {
          if (!isFullScreen && !isEmbedded) {
            const target = e.target as HTMLElement;
            if (!target.closest("button") && !target.closest("input")) {
              handleDragStart(e.clientX, e.clientY);
            }
          }
        }}
        onTouchStart={(e) => {
          if (!isFullScreen && !isEmbedded) {
            const target = e.target as HTMLElement;
            if (!target.closest("button") && !target.closest("input")) {
              handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }
        }}
        className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-[#0c162a]/95 backdrop-blur-xl flex items-center justify-between shrink-0 select-none z-20 ${
          !isFullScreen && !isEmbedded ? "cursor-move" : ""
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <GraduationCap className="w-4 h-4 text-cyan-100" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              Wisdom Tower AI Tutor
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Academic Problem Solver
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Drag Move indicator (in floating mode only) */}
          {!isFullScreen && !isEmbedded && (
            <button
              type="button"
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              title="Drag to reposition window"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white cursor-grab active:cursor-grabbing text-xs select-none touch-none border border-white/10"
            >
              <Move className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold hidden md:inline">Move</span>
            </button>
          )}

          {/* Minimize Button (when floating) */}
          {!isEmbedded && (
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize window"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
          )}

          {/* Full Screen Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullScreen((v) => !v)}
            title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Clear conversation */}
          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear conversation"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Clear & Obvious Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="Close Tutor"
            aria-label="Close AI Tutor"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* ── Conversation Scroll Area ── */}
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
                    className={isBot ? "text-slate-100 study-prose text-sm sm:text-base" : "text-slate-950 font-medium text-sm sm:text-base"}
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
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity cursor-pointer inline-flex items-center gap-1 text-slate-400 hover:text-white"
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

        {loading && (
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
            </div>
            <div className="bg-[#0c1628]/95 border border-white/10 rounded-2xl p-3.5 text-xs sm:text-sm text-cyan-300 flex items-center gap-2.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing problem & formulating step-by-step solution…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Fixed Bottom Composer Bar ── */}
      <footer className="shrink-0 p-2.5 sm:p-3.5 border-t border-white/10 bg-[#070d1d] z-20 pb-[max(0.75rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))]">
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
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question, formula, or problem…"
            disabled={loading}
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="send"
            className="flex-1 bg-[#060b17] border border-white/15 focus:border-cyan-400 rounded-2xl px-4 py-2.5 sm:py-3 text-base text-white placeholder-slate-400 focus:outline-none transition-colors"
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


