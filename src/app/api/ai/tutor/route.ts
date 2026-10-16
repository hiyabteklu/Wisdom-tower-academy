import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

// Provider candidate definition
type Candidate =
  | { provider: "gateway"; model: string; timeoutMs?: number }
  | { provider: "gemini"; model: string; timeoutMs?: number }
  | { provider: "groq"; model: string; timeoutMs?: number };

// Provider / model order for Tutor only (3 tutor keys):
// 1) Vercel AI Gateway (AI_GATEWAY_API_KEY_TUTOR): openai/gpt-oss-20b  (primary)
// 2) Gemini (GEMINI_API_KEY): gemini-3.1-flash-lite  (GA, long-lived, high capacity)
// 3) Groq (GROQ_API_KEY_TUTOR): llama-3.3-70b-versatile  (separate provider = separate rate limits)
// 4) Gemini: gemini-3.5-flash-lite
// 5) Gemini: gemini-3.5-flash
// 6) Gemini: gemini-3.6-flash
// Removed (unreliable): gemini-3.8-flash, gemini-3.7-flash, *-latest aliases.
const CANDIDATES: Candidate[] = [
  // gpt-oss is a reasoning model: allow more time before the first visible token
  { provider: "gateway", model: "openai/gpt-oss-20b", timeoutMs: 9000 },
  { provider: "gemini", model: "gemini-3.1-flash-lite" },
  { provider: "groq", model: "llama-3.3-70b-versatile" },
  { provider: "gemini", model: "gemini-3.5-flash-lite" },
  { provider: "gemini", model: "gemini-3.5-flash" },
  { provider: "gemini", model: "gemini-3.6-flash" },
];

const PER_ATTEMPT_TIMEOUT_MS = 4500;

const GATEWAY_CHAT_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const CALM_BUSY_MESSAGE =
  "The Wisdom Tower AI Tutor is currently experiencing high demand. Please wait a moment and try asking your question again.";

const DEFAULT_SUGGESTIONS = [
  "Give me a worked practice problem",
  "Explain step-by-step with an example",
  "What is the most common exam trap?",
];

const STATIC_KNOWLEDGE_BLURB = `
[Wisdom Tower Knowledge Base]
- Curriculum:
  * Grades 9-12: Ethiopian National Secondary Curriculum (Natural & Social Science Streams); national matriculation examinations.
  * Remedial Program: Pre-university foundation catch-up.
  * University Freshman: 1st year foundational courses across Ethiopian public and private universities.
    - Natural Stream: Calculus I/II, General Physics, General Chemistry, C++ Programming, Emerging Technologies, Critical Thinking & Logic, General Psychology, Inclusiveness, Communicative English.
    - Social Stream: Applied Mathematics for Social Sciences, Economics, Geography, History of Ethiopia & the Horn, Global Trends, Social Anthropology, Entrepreneurship.
  * Senior Engineering: 3rd & 4th Year Electrical and Computer Engineering (ECE) - Circuits, Signals & Systems, Electromagnetics, Electronics, Control Systems.
  * Standardized Exams: AAU UAT (Undergraduate Admission Test), AAU GAT (Graduate Aptitude Test: Quantitative, Verbal, Analytical), COC (Occupational Competency), MoE University Exit Exam.
  * Ethiopian University GPA: 4.0 scale (A+/A: 4.0, A-: 3.75, B+: 3.5, B: 3.0, B-: 2.75, C+: 2.5, C: 2.0, D: 1.0, F: 0.0). Good academic standing is GPA >= 2.00; Great Distinction >= 3.75.
  * Wisdom Tower Academy: All-in-one Ethiopian edtech platform with chapter textbooks, high-yield short notes, interactive flashcards, categorized question banks, and authentic solved university exams.
`;

const SYSTEM_INSTRUCTION = `You are the Wisdom Tower AI Academic Tutor — a warm, brilliant, and encouraging study coach for Ethiopian students across Secondary (Grades 9–12), University Freshman, and Senior Engineering tracks.

Your Persona & Tone:
- You act as a warm, supportive, and lightly witty mentor (like a brilliant senior university peer who makes hard concepts feel intuitive and achievable).
- Use tasteful, intentional emojis sparingly (e.g. 💡, 🎯, 📐, ✨) — never spam emojis.
- Be encouraging and patient. If a student is confused, rephrase with relatable intuition before formal notation.
- Tone should be respectful, positive, scholarly, and motivating.

Problem Solving & Explanations:
1. Step-by-Step Rigor:
   - For all mathematical, physics, chemistry, or engineering calculations, always explain step-by-step.
   - Clarify the given parameters, state the governing formula/principle first, show intermediate substitutions, and highlight the final solution clearly.
   - Mention practical exam takeaways and common pitfalls students often encounter in Ethiopian national and university exams.
2. KaTeX / LaTeX Formatting (CRITICAL):
   - ALWAYS format mathematical symbols, equations, and expressions using standard LaTeX.
   - Inline math: use single dollar signs, e.g., $f(x) = 3x^2 - 4x + 1$, $\\frac{dy}{dx}$, $\\lim_{x \\to 0}$.
   - Block/display math: use double dollar signs on separate lines, e.g.,
     $$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$
   - Ensure all LaTeX delimiters are properly closed and valid.
   - Use real LaTeX for everything mathematical (x^2, x_3, \\Delta, \\times) — never Unicode fake math like x² or Δ. Units go in \\text{...}, e.g. $9.8\\,\\text{m/s}^2$.
3. Markdown Rules (the app renderer supports only this):
   - Allowed: # / ## / ### headings, **bold**, *italic*, bullet lists with "- ", "> " callouts, "---" dividers, inline \`code\`.
   - Never use HTML tags, Markdown pipe tables, or images. For any table, use a LaTeX array inside $$...$$, e.g. $$\\begin{array}{l|c} \\text{Quantity} & \\text{Value} \\\\ \\hline m & 20\\,\\text{kg} \\end{array}$$
   - Put every heading, list item and display equation on its own line with a blank line between blocks.
4. Errors & Safeguards:
   - NEVER expose internal server information, API keys, or raw system error codes. Never show raw API errors.
   - Keep answers structured, insightful, and easy to read.

Follow-up Suggestions:
At the very end of your response, after your main explanation, provide 2 or 3 short, relevant follow-up questions or prompts the student could ask next. Format each on its own line exactly like this:
>>> SUGGESTION: <short follow-up prompt>
>>> SUGGESTION: <short follow-up prompt>
Keep each suggestion under 8 words.`;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function parseSuggestions(buffer: string): string[] {
  if (!buffer) return [];
  const lines = buffer.split("\n");
  const list: string[] = [];
  for (const line of lines) {
    const cleaned = line
      .replace(/^[\s>*-]+(?:SUGGESTION|Suggestion|Follow-up):\s*/i, "")
      .replace(/^[\d\-*•.]+\s*/, "")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (cleaned.length > 2 && cleaned.length < 80) {
      list.push(cleaned);
      if (list.length >= 3) break;
    }
  }
  return list;
}

function getContextualSuggestions(courseContext?: string): string[] {
  const ctx = (courseContext || "").toLowerCase();
  if (ctx.includes("ece") || ctx.includes("engineering")) {
    return [
      "Explain the circuit equivalent",
      "Step-by-step formula derivation",
      "Common exam question format",
    ];
  }
  if (ctx.includes("freshman") || ctx.includes("calculus") || ctx.includes("physics")) {
    return [
      "Give me a worked practice problem",
      "What is the intuitive explanation?",
      "How is this tested in midterms?",
    ];
  }
  if (ctx.includes("uat") || ctx.includes("gat") || ctx.includes("exit")) {
    return [
      "Show a multiple-choice question",
      "Time-saving trick for this problem",
      "Most common exam pitfall",
    ];
  }
  return DEFAULT_SUGGESTIONS;
}

async function tryGeminiCandidate(
  ai: GoogleGenAI,
  model: string,
  fullSystemInstruction: string,
  formattedContents: any[],
  timeoutMs: number
) {
  const streamResponse = await withTimeout(
    ai.models.generateContentStream({
      model,
      contents: formattedContents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
    timeoutMs,
    `Gemini ${model} init`
  );

  const iterator = (streamResponse as any)[Symbol.asyncIterator]();
  const first = await withTimeout<any>(iterator.next(), timeoutMs, `Gemini ${model} first chunk`);

  if (first.done && !first.value?.text) {
    throw new Error(`Gemini ${model} returned empty response`);
  }

  return {
    iterator,
    firstChunkText: first.value?.text || "",
  };
}

// Generic OpenAI-compatible streaming candidate (used for Vercel AI Gateway and Groq).
async function tryOpenAICompatCandidate(opts: {
  label: string; // "Gateway" | "Groq" (for logs/errors only)
  url: string;
  apiKey: string;
  model: string;
  fullSystemInstruction: string;
  formattedContents: any[];
  timeoutMs: number;
  maxTokens?: number;
}) {
  const { label, url, apiKey, model, fullSystemInstruction, formattedContents, timeoutMs } = opts;

  if (!apiKey || !apiKey.trim()) {
    throw new Error(`${label} API key not configured`);
  }

  const messages = [
    { role: "system", content: fullSystemInstruction },
    ...formattedContents.map((c: any) => ({
      role: c.role === "model" ? "assistant" : "user",
      content: c.parts?.[0]?.text || "",
    })),
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: opts.maxTokens ?? 2048,
        stream: true,
        messages,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`${label} HTTP ${res.status}: ${errText.slice(0, 150)}`);
  }

  if (!res.body) {
    throw new Error(`${label} returned empty response body`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  // A single network read can contain MANY SSE events. Every delta must be queued —
  // returning after the first one would silently drop the rest (garbled, missing words).
  const pending: string[] = [];
  let streamEnded = false;

  function consumeLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "data: [DONE]") return;
    if (!trimmed.startsWith("data:")) return;
    try {
      const parsed = JSON.parse(trimmed.slice(5).trim());
      // Only visible answer text ("content"); reasoning tokens are ignored.
      const delta = parsed.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta.length > 0) {
        pending.push(delta);
      }
    } catch {
      // Ignore malformed or partial json line
    }
  }

  async function readNextChunk(): Promise<{ done: boolean; text?: string }> {
    while (true) {
      if (pending.length > 0) {
        return { done: false, text: pending.shift() as string };
      }
      if (streamEnded) return { done: true };

      const { done, value } = await reader.read();
      if (done) {
        streamEnded = true;
        buffer += decoder.decode();
        if (buffer) {
          consumeLine(buffer);
          buffer = "";
        }
        continue;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) consumeLine(line);
    }
  }

  // Peek first visible chunk within timeout
  const first = await withTimeout<{ done: boolean; text?: string }>(
    readNextChunk(),
    timeoutMs,
    `${label} ${model} first chunk`
  );
  if (first.done && !first.text) {
    throw new Error(`${label} ${model} returned empty stream`);
  }

  const asyncIterator = {
    async next() {
      const r = await readNextChunk();
      return {
        done: r.done,
        value: { text: r.text },
      };
    },
  };

  return {
    iterator: asyncIterator,
    firstChunkText: first.text || "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, courseContext } = body;

    const geminiApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY ||
      "";
    const groqTutorApiKey = process.env.GROQ_API_KEY_TUTOR || "";
    const gatewayTutorApiKey = process.env.AI_GATEWAY_API_KEY_TUTOR || "";

    const fullSystemInstruction = `${STATIC_KNOWLEDGE_BLURB}\n\n${SYSTEM_INSTRUCTION}${
      courseContext ? `\n\nCurrent Student Course Context: ${courseContext}` : ""
    }`;

    // Convert chat history into contents format
    const formattedContents = (Array.isArray(messages) ? messages : []).map(
      (m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })
    );

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: "Hello AI Tutor, help me study today." }],
      });
    }

    let ai: GoogleGenAI | null = null;
    if (geminiApiKey) {
      ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }

    // Try candidates in the order defined in CANDIDATES above.
    let activeIterator: any = null;
    let firstChunkText = "";

    for (const candidate of CANDIDATES) {
      const timeoutMs = candidate.timeoutMs ?? PER_ATTEMPT_TIMEOUT_MS;
      try {
        if (candidate.provider === "gateway") {
          if (!gatewayTutorApiKey) {
            console.log("[AI Tutor] Skipping Gateway candidate (AI_GATEWAY_API_KEY_TUTOR not set)");
            continue;
          }
          const result = await tryOpenAICompatCandidate({
            label: "Gateway",
            url: GATEWAY_CHAT_URL,
            apiKey: gatewayTutorApiKey,
            model: candidate.model,
            fullSystemInstruction,
            formattedContents,
            timeoutMs,
            maxTokens: 4096, // headroom for reasoning tokens
          });
          activeIterator = result.iterator;
          firstChunkText = result.firstChunkText;
          console.log(`[AI Tutor] Succeeded with Gateway: ${candidate.model}`);
          break;
        } else if (candidate.provider === "gemini") {
          if (!ai) {
            console.warn(`[AI Tutor] Skipping Gemini ${candidate.model} (no GEMINI_API_KEY)`);
            continue;
          }
          const result = await tryGeminiCandidate(
            ai,
            candidate.model,
            fullSystemInstruction,
            formattedContents,
            timeoutMs
          );
          activeIterator = result.iterator;
          firstChunkText = result.firstChunkText;
          console.log(`[AI Tutor] Succeeded with Gemini: ${candidate.model}`);
          break;
        } else if (candidate.provider === "groq") {
          if (!groqTutorApiKey) {
            console.log("[AI Tutor] Skipping Groq candidate (GROQ_API_KEY_TUTOR not set)");
            continue;
          }
          const result = await tryOpenAICompatCandidate({
            label: "Groq",
            url: GROQ_CHAT_URL,
            apiKey: groqTutorApiKey,
            model: candidate.model,
            fullSystemInstruction,
            formattedContents,
            timeoutMs,
          });
          activeIterator = result.iterator;
          firstChunkText = result.firstChunkText;
          console.log(`[AI Tutor] Succeeded with Groq: ${candidate.model}`);
          break;
        }
      } catch (err: any) {
        console.warn(
          `[AI Tutor] ${candidate.provider} (${candidate.model}) failed (${err?.message || err}). Trying next option...`
        );
      }
    }

    // On total failure, return only a calm user-facing message — never raw JSON or API errors
    if (!activeIterator) {
      console.error("[AI Tutor] All providers/models failed.");
      return new Response(
        `data: ${JSON.stringify({
          type: "chunk",
          text: CALM_BUSY_MESSAGE,
        })}\n\ndata: ${JSON.stringify({
          type: "suggestions",
          suggestions: getContextualSuggestions(courseContext),
        })}\n\ndata: ${JSON.stringify({ type: "done" })}\n\n`,
        {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }
      );
    }

    // Create ReadableStream to forward chunks as SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let suggestionBuffer = "";
        let inSuggestionMode = false;
        let streamedAnyText = false;

        const sendEvent = (obj: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };

        const processChunkText = (text: string | undefined) => {
          if (!text) return;

          if (inSuggestionMode) {
            suggestionBuffer += text;
            return;
          }

          const markerIndex = text.indexOf(">>> SUGGESTION:");
          if (markerIndex !== -1) {
            inSuggestionMode = true;
            const preText = text.slice(0, markerIndex);
            if (preText) {
              streamedAnyText = true;
              sendEvent({ type: "chunk", text: preText });
            }
            suggestionBuffer += text.slice(markerIndex);
          } else {
            streamedAnyText = true;
            sendEvent({ type: "chunk", text });
          }
        };

        try {
          // Process initial chunk
          processChunkText(firstChunkText);

          // Process subsequent chunks
          while (true) {
            const next = await activeIterator.next();
            if (next.done) break;
            processChunkText(next.value?.text);
          }

          // Parse suggestions from suggestionBuffer
          let suggestions = parseSuggestions(suggestionBuffer);
          if (suggestions.length === 0) {
            suggestions = getContextualSuggestions(courseContext);
          }

          sendEvent({ type: "suggestions", suggestions });
          sendEvent({ type: "done" });
          controller.close();
        } catch (streamErr: any) {
          console.error("[AI Tutor Stream Chunk Error]", streamErr?.message || streamErr);
          if (!streamedAnyText) {
            sendEvent({ type: "chunk", text: CALM_BUSY_MESSAGE });
            sendEvent({
              type: "suggestions",
              suggestions: getContextualSuggestions(courseContext),
            });
          }
          sendEvent({ type: "done" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[AI Tutor Unexpected Handler Error]", error?.message || error);
    return new Response(
      `data: ${JSON.stringify({
        type: "chunk",
        text: CALM_BUSY_MESSAGE,
      })}\n\ndata: ${JSON.stringify({
        type: "suggestions",
        suggestions: DEFAULT_SUGGESTIONS,
      })}\n\ndata: ${JSON.stringify({ type: "done" })}\n\n`,
      {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  }
}
