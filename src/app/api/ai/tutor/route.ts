import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

// Ordered list of fast, low-cost, widely available Gemini models (fastest first for instant responses)
const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite", // Blazing fast sub-second latency, minimal thinking
  "gemini-flash-latest",   // Fast fallback
  "gemini-3.8-flash",      // Robust final fallback
];

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
3. Errors & Safeguards:
   - NEVER expose internal server information, API keys, or raw system error codes. Never show raw API errors.
   - Keep answers structured, insightful, and easy to read.

Follow-up Suggestions:
At the very end of your response, after your main explanation, provide 2 or 3 short, relevant follow-up questions or prompts the student could ask next. Format each on its own line exactly like this:
>>> SUGGESTION: <short follow-up prompt>
>>> SUGGESTION: <short follow-up prompt>
Keep each suggestion under 8 words.`;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, courseContext } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      console.warn("[AI Tutor] GEMINI_API_KEY is not configured on the server.");
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

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

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

    // Try models in order (fastest Flash/lite models first)
    let activeStream: any = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const streamResponse = await ai.models.generateContentStream({
          model,
          contents: formattedContents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });
        activeStream = streamResponse;
        break;
      } catch (err: any) {
        console.warn(
          `[AI Tutor] Model "${model}" failed to initialize stream (${err?.message || err}). Trying next fallback...`
        );
      }
    }

    if (!activeStream) {
      console.error("[AI Tutor] All fallback models failed to start stream.");
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

        try {
          for await (const chunk of activeStream) {
            const text = chunk.text;
            if (!text) continue;

            if (inSuggestionMode) {
              suggestionBuffer += text;
              continue;
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

