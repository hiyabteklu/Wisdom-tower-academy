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

/** Cheap default that works on AI Gateway free credits; override with AI_EXPLAIN_MODEL */
const DEFAULT_MODEL = "meta/llama-3.1-8b";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function buildPrompt(
  body: Required<
    Pick<
      ExplainBody,
      | "question"
      | "choices"
      | "studentAnswer"
      | "correctAnswer"
      | "subject"
      | "difficulty"
    >
  >
) {
  const choicesList = body.choices
    .map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`)
    .join("\n");
  return `You are a patient tutor for Ethiopian university / secondary students on Wisdom Tower Academy.

Subject: ${body.subject}
Difficulty: ${body.difficulty}

Question:
${body.question}

Choices:
${choicesList}

Student's answer: ${body.studentAnswer}
Correct answer: ${body.correctAnswer}

Write a concise educational explanation (max ~180 words):
- Explain why the correct answer is right.
- If the student was wrong, briefly say why their choice does not fit (no shame).
- Teach the underlying idea so they can solve similar questions.
- Do NOT only restate the answer. No markdown headings. Plain paragraphs only.`;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message.slice(0, 300);
  return String(e).slice(0, 300);
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

  // 1) Cache hit
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

  // 2) Generate with AI Gateway (credentials stay server-side)
  const model = process.env.AI_EXPLAIN_MODEL || DEFAULT_MODEL;

  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error("[explain] AI_GATEWAY_API_KEY missing in runtime env");
    return NextResponse.json({
      explanation: FALLBACK,
      cached: false,
      fallback: true,
      reason: "AI_GATEWAY_API_KEY not configured",
    });
  }

  try {
    const { text } = await generateText({
      model,
      prompt: buildPrompt({
        question,
        choices,
        studentAnswer,
        correctAnswer,
        subject,
        difficulty,
      }),
      temperature: 0.4,
    });

    const explanation = (text || "").trim() || FALLBACK;

    if (supabase && explanation !== FALLBACK) {
      try {
        await supabase.from("question_explanations").upsert({
          question_id: questionId,
          explanation,
          subject,
          difficulty,
          model,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("[explain] cache write failed:", e);
      }
    }

    return NextResponse.json({
      explanation,
      cached: false,
      fallback: explanation === FALLBACK,
      model,
    });
  } catch (e) {
    const msg = errorMessage(e);
    console.error("[explain] AI error:", msg, e);
    return NextResponse.json({
      explanation: FALLBACK,
      cached: false,
      fallback: true,
      reason: "ai_unavailable",
      detail: msg,
      model,
    });
  }
}
