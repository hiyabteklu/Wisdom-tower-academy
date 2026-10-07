import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Ordered list of fast, low-cost, widely available Gemini models
const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

const CALM_BUSY_MESSAGE =
  "The Wisdom Tower AI Tutor is currently experiencing high demand. Please wait a moment and try asking your question again.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, courseContext } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      console.warn("[AI Tutor] GEMINI_API_KEY is not configured on the server.");
      return NextResponse.json({
        reply:
          "The Wisdom Tower AI Tutor is currently unavailable. Please try again shortly.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Wisdom Tower Academy's elite AI Academic Tutor.
Your mission is to provide personalized, high-yield academic tutoring for Ethiopian students across all levels:
1. Secondary Curriculum (Grades 9, 10, 11, 12) - Natural and Social Science streams, Ethiopian national curriculum & matriculation preparation.
2. Freshman University Courses - Natural stream (Calculus, Physics, General Chemistry, C++ Programming, Emerging Tech, Logic, Psychology, Inclusiveness, English) and Social stream (Applied Math, Economics, Geography, History, Anthropology, Global Trends).
3. Senior Engineering Tracks - Electrical and Computer Engineering (ECE), signals, electronics, electromagnetics, computational methods.
4. National Standardized Exams - AAU GAT (Graduate Aptitude Test), UAT (Undergraduate Admission Test), COC (Certificate of Competency), and University Exit Exams.

Guidelines:
- Explain difficult concepts simply and intuitively with real-world examples.
- For math, physics, engineering, and chemistry, provide structured STEP-BY-STEP derivations and solutions.
- Format formulas clearly using clean notation or LaTeX/Markdown.
- When answering questions, highlight key takeaways, common exam pitfalls, and memory aids.
- Be encouraging, scholarly, patient, and precise.
${courseContext ? `\nCurrent Student Context: ${courseContext}` : ""}`;

    // Convert chat history into contents format
    const formattedContents = (Array.isArray(messages) ? messages : []).map(
      (m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })
    );

    // Fallback if no messages
    if (formattedContents.length === 0) {
      formattedContents.push({
        role: "user",
        parts: [{ text: "Hello AI Tutor, help me study today." }],
      });
    }

    let lastError: any = null;

    // Try models in order; stop at first successful reply
    for (const model of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          // Log which model succeeded on the server only
          console.log(`[AI Tutor] Succeeded with model: ${model}`);
          return NextResponse.json({ reply });
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const status = err?.status || err?.statusCode || "";
        console.warn(
          `[AI Tutor] Model "${model}" failed (${status || msg}). Trying next fallback...`
        );
      }
    }

    // If every model fails, return calm user-facing message only
    console.error("[AI Tutor] All fallback models failed:", lastError?.message || lastError);
    return NextResponse.json({
      reply: CALM_BUSY_MESSAGE,
    });
  } catch (error: any) {
    console.error("[AI Tutor Unexpected Error]", error);
    return NextResponse.json({
      reply: CALM_BUSY_MESSAGE,
    });
  }
}

