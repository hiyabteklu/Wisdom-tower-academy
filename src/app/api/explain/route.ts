import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createServiceClient } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

type ExplainBody = {
  questionId?: string;
  question?: string;
  choices?: string[];
  studentAnswer?: string;
  correctAnswer?: string;
  subject?: string;
  difficulty?: string;
};

const FALLBACK =
  "Explanation is temporarily unavailable. Review the correct option, compare it with your choice, and try a similar practice question to lock in the idea.";

/**
 * Groq free/developer models (llama-3.1-8b-instant is often Enterprise-only).
 * Override with AI_EXPLAIN_MODEL env if needed.
 */
const GROQ_MODELS = [
  process.env.AI_EXPLAIN_MODEL,
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter((m): m is string => Boolean(m && m.trim()));

const GATEWAY_MODEL = process.env.AI_EXPLAIN_MODEL || "openai/gpt-oss-20b";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function buildPrompt(input: {
  question: string;
  choices: string[];
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  difficulty: string;
}) {
  const choicesList = input.choices
    .map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`)
    .join("\n");
  return `You are a patient tutor for Ethiopian university / secondary students on Wisdom Tower Academy.

Subject: ${input.subject}
Difficulty: ${input.difficulty}

Question:
${input.question}

Choices:
${choicesList}

Student's answer: ${input.studentAnswer}
Correct answer: ${input.correctAnswer}

Write a concise educational explanation (max ~180 words):
- Explain why the correct answer is right.
- If the student was wrong, briefly say why their choice does not fit (no shame).
- Teach the underlying idea so they can solve similar questions.
- Do NOT only restate the answer. No markdown headings. Plain paragraphs only.`;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message.slice(0, 400);
  return String(e).slice(0, 400);
}

function isCardRequiredError(msg: string): boolean {
  return /credit card|customer_verification|add a card|unlock your free credits/i.test(msg);
}

async function groqChat(model: string, prompt: string, key: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Groq ${res.status} (${model}): ${raw.slice(0, 220)}`);
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Groq returned invalid JSON (${model})`);
  }

  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error(`Groq returned empty content (${model})`);
  return text;
}

/** Free path: Groq OpenAI-compatible API (tries several model ids). */
async function generateWithGroq(prompt: string): Promise<{ text: string; model: string }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const tried: string[] = [];
  let lastErr = "";

  for (const model of GROQ_MODELS) {
    if (tried.includes(model)) continue;
    tried.push(model);
    try {
      const text = await groqChat(model, prompt, key);
      return { text, model: `groq/${model}` };
    } catch (e) {
      lastErr = errorMessage(e);
      console.warn("[explain] Groq model failed:", lastErr);
    }
  }

  throw new Error(lastErr || "All Groq models failed");
}

/** Vercel AI Gateway (needs card on file to unlock free $5 credits). */
async function generateWithGateway(prompt: string): Promise<{ text: string; model: string }> {
  if (!process.env.AI_GATEWAY_API_KEY) {
    throw new Error("AI_GATEWAY_API_KEY not configured");
  }

  const { text } = await generateText({
    model: GATEWAY_MODEL,
    prompt,
    temperature: 0.4,
  });

  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("AI Gateway returned empty content");
  return { text: trimmed, model: GATEWAY_MODEL };
}

export async function POST(req: NextRequest) {
  let body: ExplainBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questionId = typeof body.questionId === "string" ? body.questionId.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const choices = Array.isArray(body.choices) ? body.choices.map(String) : [];
  const studentAnswer =
    typeof body.studentAnswer === "string" ? body.studentAnswer.trim() : "";
  const correctAnswer =
    typeof body.correctAnswer === "string" ? body.correctAnswer.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "General";
  const difficulty =
    typeof body.difficulty === "string" ? body.difficulty.trim() : "medium";

  if (!questionId || !question || choices.length < 2 || !studentAnswer || !correctAnswer) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: questionId, question, choices (≥2), studentAnswer, correctAnswer",
      },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const ip = clientIp(req);
  const rate = await checkRateLimit(supabase, `explain:${ip}`);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Try again later.",
        explanation: FALLBACK,
        cached: false,
        fallback: true,
        resetAt: rate.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rate.resetAt),
        },
      }
    );
  }

  // Cache hit
  if (supabase) {
    try {
      const { data: cached } = await supabase
        .from("question_explanations")
        .select("explanation")
        .eq("question_id", questionId)
        .maybeSingle();

      if (cached?.explanation) {
        return NextResponse.json({
          explanation: cached.explanation,
          cached: true,
          fallback: false,
        });
      }
    } catch (e) {
      console.warn("[explain] cache read failed:", e);
    }
  }

  const prompt = buildPrompt({
    question,
    choices,
    studentAnswer,
    correctAnswer,
    subject,
    difficulty,
  });

  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY);

  if (!hasGroq && !hasGateway) {
    console.error("[explain] no AI provider keys configured");
    return NextResponse.json({
      explanation: FALLBACK,
      cached: false,
      fallback: true,
      reason: "no_provider",
      detail: "Set GROQ_API_KEY (free) or AI_GATEWAY_API_KEY on Vercel",
    });
  }

  let lastError = "";

  // 1) Prefer Groq when available (works without Vercel card)
  if (hasGroq) {
    try {
      const result = await generateWithGroq(prompt);

      if (supabase) {
        try {
          await supabase.from("question_explanations").upsert({
            question_id: questionId,
            explanation: result.text,
            subject,
            difficulty,
            model: result.model,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("[explain] cache write failed:", e);
        }
      }

      return NextResponse.json({
        explanation: result.text,
        cached: false,
        fallback: false,
        model: result.model,
      });
    } catch (e) {
      lastError = errorMessage(e);
      console.error("[explain] Groq failed:", lastError);
    }
  }

  // 2) AI Gateway
  if (hasGateway) {
    try {
      const result = await generateWithGateway(prompt);

      if (supabase) {
        try {
          await supabase.from("question_explanations").upsert({
            question_id: questionId,
            explanation: result.text,
            subject,
            difficulty,
            model: result.model,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("[explain] cache write failed:", e);
        }
      }

      return NextResponse.json({
        explanation: result.text,
        cached: false,
        fallback: false,
        model: result.model,
      });
    } catch (e) {
      lastError = errorMessage(e);
      console.error("[explain] Gateway failed:", lastError);

      if (isCardRequiredError(lastError)) {
        return NextResponse.json({
          explanation: FALLBACK,
          cached: false,
          fallback: true,
          reason: "card_required",
          detail:
            "Vercel AI Gateway needs a card on file to unlock free credits. Groq is preferred when GROQ_API_KEY is set.",
        });
      }
    }
  }

  return NextResponse.json({
    explanation: FALLBACK,
    cached: false,
    fallback: true,
    reason: "ai_unavailable",
    detail: lastError || "All providers failed",
  });
}
