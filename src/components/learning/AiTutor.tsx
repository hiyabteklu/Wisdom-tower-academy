"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  Sparkles,
} from "lucide-react";

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

const SUGGESTIONS = [
  "Explain Calculus chain rule step-by-step",
  "How to balance redox reactions in Chemistry",
  "Key formulas for Physics matriculation exam",
  "Solve a circuit problem with Ohm's law",
];

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultFullScreen) {
      setIsFullScreen(true);
    }
  }, [defaultFullScreen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  async function sendMessage(textToSend?: string) {
    const q = (textToSend || input).trim();
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
        content: "Chat cleared. What topic or problem would you like to explore next?",
        timestamp: "Just now",
      },
    ]);
  }

  return (
    <div
      className={
        isFullScreen
          ? "fixed inset-0 z-[120] bg-[#050914] flex flex-col animate-in fade-in duration-200"
          : isEmbedded
            ? "w-full h-[620px] max-h-[85vh] rounded-3xl border border-cyan-400/30 bg-[#091122]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-cyan-500/20"
            : "fixed bottom-4 right-4 z-[120] w-[min(26rem,calc(100vw-2rem))] h-[min(38rem,calc(100vh-6rem))] rounded-3xl border border-cyan-400/30 bg-[#091122]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-250 ring-1 ring-cyan-500/20"
      }
    >
      {/* ── Header ── */}
      <header className="px-4 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <GraduationCap className="w-5 h-5 text-cyan-100" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white tracking-wide truncate">
              Wisdom Tower AI Tutor
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              Academic Problem Solver & Study Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear conversation"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullScreen((v) => !v)}
            title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Tutor and return to tools"
            className="px-2.5 py-1.5 rounded-xl text-slate-200 hover:text-white bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* ── Conversation Scroll Area ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isBot ? "items-start" : "items-end justify-end"}`}
            >
              {isBot && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`group relative max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? "bg-[#0e192f] border border-white/10 text-slate-100 shadow-md"
                    : "bg-cyan-500 text-slate-950 font-medium rounded-br-xs shadow-md shadow-cyan-500/20"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>

                <div
                  className={`mt-1.5 flex items-center justify-between gap-3 text-[10px] ${
                    isBot ? "text-slate-400" : "text-slate-900/70"
                  }`}
                >
                  <span>{m.timestamp}</span>

                  {isBot && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity cursor-pointer inline-flex items-center gap-1"
                      title="Copy text"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isBot && (
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mb-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
            </div>
            <div className="bg-[#0e192f] border border-white/10 rounded-2xl p-3 text-xs text-cyan-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing problem & formulating explanation…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Starter Chips ── */}
      {messages.length <= 1 && !loading && (
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendMessage(sug)}
              className="text-[11px] font-medium whitespace-nowrap px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-cyan-500/15 hover:border-cyan-400/30 text-slate-300 hover:text-cyan-200 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Bar ── */}
      <footer className="p-3 border-t border-white/10 bg-[#070d1d] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2"
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
            className="flex-1 bg-[#060b17] border border-white/15 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/25 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}

