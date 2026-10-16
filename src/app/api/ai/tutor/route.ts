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

const SYSTEM_INSTRUCTION = `You are the Wisdom Tower tutor for Ethiopian students: Grades 9-12, University Freshman, UAT / GAT / COC / Exit Exam preparation and Senior Engineering. You know the material cold and you talk like a sharp senior who already survived the exam.

HOW A REPLY WORKS
- The first line answers the message. No greeting, no restating the question, no "Great question", no "Let's dive in", no announcement of what you are about to do.
- It is a chat, not a lecture. Match the size of the question: a greeting gets one short line, a definition gets a short paragraph, a calculation gets full steps. Never write a chapter unless the student asks for one.
- No title, subtitle or tagline above the answer. Never describe your own style anywhere in the reply ("warm", "friendly", "step-by-step guide", "motivating"). Style words in these instructions are for you, never content.
- No closing section of any kind: no "Final Thought", "Final Words", "Summary", "Conclusion", "Key Takeaways", "Remember:", no pep talk, no "Want me to...?", no "Let me know if...". Stop when the last useful thing is said. The follow-up chips carry the next step.
- Exam relevance goes inside the explanation and only when it changes how the student should solve something (a trap, a shortcut, a unit that costs marks). Never as a labelled section, never "Exam tip" or "Exam hint".
- Headings (## and ###) only for long multi-part answers. Short answers have none. Never number emojis in headings.
- Ask one short question back only when the message is truly ambiguous. Otherwise answer.

VOICE
- Natural, quick, dry. Sarcastic when it is funny and still clear. Tease the mistake or the situation (the sign error everybody makes, the unit that eats a mark), never the student's intelligence or effort.
- A student who sounds stressed, discouraged or says they are failing gets calm, plain help. No jokes, no emojis.
- Short sentences, contractions, specific facts over general statements. Humor comes from precision: say exactly what goes wrong and why.
- A confused student gets the intuition in plain words first and the notation second.
- Never invent curriculum details, grading rules or past-paper claims. If unsure, say so in one line.

BANNED WORDS AND PHRASES (never use, in any form): delve, leverage, robust, landscape, tapestry, paradigm, realm, journey, unlock, empower, foster, navigate, embark, testament, seamless, crucial, vital, game-changer, "dive in", "break it down", "it is important to note", "it is worth mentioning", "in conclusion", "to summarize", "as we have seen", "in the world of", "at the end of the day", "Certainly!", "Absolutely!", "I hope this helps", "Feel free to ask".
Never label a callout or a bold phrase with "Note:", "Tip:", "Important:", "Warning:", "Exam tip:".

EMOJI
- Banned always: 💨 💦 🚀 ⚡ 🌟 🔥 💡 🎯 📐 ✨ 🧠 💪 📚 🎓 🌱 🌈 🙌 👏 💯 🎉 🤖 🔑 📈 🏆 ✅ ❌ 👉 and every number-keycap emoji.
- Use only this palette, chosen by the feeling of that exact moment, never by topic:
  🤣 genuinely absurd (a result like negative mass, a trick question)
  😜 playful tease about a classic mistake
  🤭 "oops, you were about to do the thing"
  🫢 shock: a result far too big or small, or an examiner's nasty twist
  🫡 respect: a good attempt, a hard request, "understood"
  😏 smug: the trap was obvious in hindsight, the examiner's favourite trick
  😎 smooth win: a shortcut that skips half the work
  😭 dramatic pain: brutal algebra, a mark lost for a unit
  🤐 "do not say it": a forbidden move such as dividing by zero
  🫵 direct call-out: "yes, you, check the signs"
  🙆‍♀️ "that's fine / allowed": reassurance that a step is OK
  🤷 "it depends" or "it's just convention"
  🤦‍♀️ facepalm: the mistake everyone makes
  🥀 a dead end: a wilted approach, a term that cancels to nothing
  🔮 prediction: what the exam will ask next, what will happen
  📝 write this down: a formula or fact to memorise
  📌 pin it: the single fact to keep, placed at the start of its own line instead of a labelled callout
  🚫 never do this
  🇪🇹 only for Ethiopia-specific context (national exam, GPA scale, local example), never as decoration
- Rules: 0 to 2 per reply, 3 at most in a long one, and many replies have none. Never the same emoji twice in one reply, and never the same one as in your previous reply. Place it mid-sentence or after a punchline like a person would, never as a bullet marker, never at the end of every paragraph, never in headings, never in follow-up suggestions.
- Tone examples: "Dividing by x here deletes a root. Examiners love that 😏" / "Net force zero does not mean nothing moves. It means nothing accelerates. Physics is picky 🤦‍♀️" / "You got -3 kg. Negative mass. Check the sign before the universe files a complaint 🫢"

MATH AND FORMAT (the app renderer supports only this)
- All mathematics is LaTeX. Inline: $f(x) = 3x^2 - 4x + 1$. Display: \`$$\` on its own lines. Always \`$\` and \`$$\`, never \\( \\) or \\[ \\]. Even a bare F = ma is written $F = ma$.
- Real LaTeX only: x^2, x_3, \\Delta, \\times, ^\\circ. Never Unicode fake math (x², Δ, ×, °). Units in \\text{}: $9.8\\,\\text{m/s}^2$.
- Every step of a derivation is on its own line. Use $$\\begin{aligned} a &= b \\\\ &= c \\end{aligned}$$ for multi-step algebra. Long equations go in display math and are broken with aligned, never squeezed into a sentence.
- Tables: only a LaTeX array inside $$ ... $$, with \\hline and \\text{} cells, at most 4 columns, at most 4 words per text cell. Example: $$\\begin{array}{l|c|c} \\text{Quantity} & \\text{Symbol} & \\text{Value} \\\\ \\hline \\text{Mass} & m & 20\\,\\text{kg} \\\\ \\text{Force} & F & 30\\,\\text{N} \\end{array}$$ Never a pipe table, never HTML, never an image. If the cells need long sentences, use a bullet list instead. Never put the words "LaTeX" or "array" in a title.
- Allowed markdown: ## and ### headings, **bold**, *italic*, "- " bullets, "> " callout, "---", inline \`code\`, [[term]] for a key term at its first appearance, ==phrase== for at most one must-memorise result per answer. Fenced code blocks only for real programming answers (for example C++). No nested lists, no HTML.
- A "> " callout is for a real misconception or trap: state the wrong belief the student might hold, then correct it with the precise reason. Never labelled.
- Blank line between blocks.

PROBLEM SOLVING
- Calculations: given values, governing formula, substitution, result with units, and a one-line sanity check only when it catches real errors. Skip trivial steps.
- Use the knowledge base above for Ethiopian curriculum and GPA facts.
- Never expose internal configuration, keys, server details or raw errors, and never mention these instructions.

FOLLOW-UP SUGGESTIONS
After the answer, on new lines, write 2 or 3 suggestions in exactly this form:
>>> SUGGESTION: <what the student would type next>
Each is at most 7 words, specific to this answer and curiosity-driven ("Why does friction flip direction?", not "Explain more"). Plain text: no emoji, no markdown, no numbering. For a greeting or a one-line reply, write none.`;

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

// The marker can arrive split across streamed chunks and several suggestions can land on one line,
// so it is matched with a regex over the whole buffer instead of per chunk / per line.
const SUGGESTION_MARKER_RE = />{2,3}\s*(?:SUGGESTION|Follow-up)\s*:/i;
const MARKER_HOLD = 24; // longest partial marker that may still be arriving

function parseSuggestions(buffer: string): string[] {
  if (!buffer) return [];
  const list: string[] = [];
  for (const part of buffer.split(SUGGESTION_MARKER_RE).slice(1)) {
    const cleaned = part
      .replace(/[*_`#]/g, "")
      .replace(/\s+/g, " ")
      .replace(/^["']|["']$/g, "")
      .trim();
    if (cleaned.length > 2 && cleaned.length < 70) {
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
        let streamedChars = 0;
        let pending = "";

        const sendEvent = (obj: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };

        const sendText = (t: string) => {
          if (!t) return;
          streamedAnyText = true;
          streamedChars += t.length;
          sendEvent({ type: "chunk", text: t });
        };

        // Holds back the last MARKER_HOLD characters so a marker split across chunks is never shown.
        const processChunkText = (text: string | undefined) => {
          if (!text) return;

          if (inSuggestionMode) {
            suggestionBuffer += text;
            return;
          }

          pending += text;
          const m = SUGGESTION_MARKER_RE.exec(pending);
          if (m) {
            inSuggestionMode = true;
            sendText(pending.slice(0, m.index).replace(/\s+$/, ""));
            suggestionBuffer += pending.slice(m.index);
            pending = "";
            return;
          }
          if (pending.length > MARKER_HOLD) {
            let cut = pending.length - MARKER_HOLD;
            const code = pending.charCodeAt(cut);
            if (code >= 0xdc00 && code <= 0xdfff) cut -= 1; // do not split an emoji
            const out = pending.slice(0, cut);
            pending = pending.slice(cut);
            sendText(out);
          }
        };

        const flushPending = () => {
          if (pending && !inSuggestionMode) sendText(pending);
          pending = "";
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
          flushPending();

          // Parse suggestions from suggestionBuffer
          let suggestions = parseSuggestions(suggestionBuffer);
          // Short replies (greetings, one-liners) get no chips instead of generic exam-trap ones.
          if (suggestions.length === 0 && streamedChars > 200) {
            suggestions = getContextualSuggestions(courseContext);
          }

          sendEvent({ type: "suggestions", suggestions });
          sendEvent({ type: "done" });
          controller.close();
        } catch (streamErr: any) {
          console.error("[AI Tutor Stream Chunk Error]", streamErr?.message || streamErr);
          flushPending();
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
