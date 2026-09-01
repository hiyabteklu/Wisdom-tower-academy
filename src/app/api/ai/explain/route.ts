import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const FALLBACK = "Wisdom Tower AI is currently unavailable.";

const PER_ATTEMPT_MS = 7000;

const GROQ_MODELS = [
  process.env.AI_EXPLAIN_MODEL,
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b",
].filter((m): m is string => Boolean(m && m.trim()));

const GATEWAY_MODEL = process.env.AI_GATEWAY_MODEL || "openai/gpt-4o-mini";

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function errMsg(e: unknown) {
  return e instanceof Error ? e.message.slice(0, 300) : String(e).slice(0, 300);
}

async function groqOnce(model: string, system: string, user: string, key: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 700,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Groq ${res.status}: ${raw.slice(0, 180)}`);
  const data = JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error("Groq empty");
  return { text, model: `groq/${model}` };
}

async function tryGroq(system: string, user: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing");
  let last = "";
  for (const model of GROQ_MODELS) {
    try {
      return await withTimeout(groqOnce(model, system, user, key), PER_ATTEMPT_MS, model);
    } catch (e) {
      last = errMsg(e);
      console.warn("[ai/explain] groq fail", model, last);
    }
  }
  throw new Error(last || "Groq failed");
}

async function tryGateway(system: string, user: string) {
  if (!process.env.AI_GATEWAY_API_KEY) throw new Error("AI_GATEWAY_API_KEY missing");
  const { text } = await withTimeout(
    generateText({
      model: GATEWAY_MODEL,
      system,
      prompt: user,
      temperature: 0.35,
    }),
    PER_ATTEMPT_MS,
    "gateway"
  );
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Gateway empty");
  return { text: trimmed, model: `gateway/${GATEWAY_MODEL}` };
}

/** Race every available provider; first success wins (fail-fast). */
async function raceProviders(system: string, user: string) {
  const jobs: Promise<{ text: string; model: string }>[] = [];
  if (process.env.GROQ_API_KEY) jobs.push(tryGroq(system, user));
  if (process.env.AI_GATEWAY_API_KEY) jobs.push(tryGateway(system, user));
  if (!jobs.length) throw new Error("No AI keys configured");
  return Promise.any(jobs);
}

function buildMessages(body: Record<string, unknown>) {
  const mode = String(body.mode || "notes");
  const text = String(body.text || body.question || "").slice(0, 8000);
  const solution = body.solution ? String(body.solution).slice(0, 3000) : "";
  const choices = Array.isArray(body.choices) ? body.choices.map(String) : [];
  const studentAnswer = body.studentAnswer ? String(body.studentAnswer) : "";
  const correctAnswer = body.correctAnswer ? String(body.correctAnswer) : "";

  if (mode === "summarize" || mode === "notes") {
    return {
      system:
        "You are a study coach for Ethiopian university students. Summarize the notes in clear English. Use short paragraphs and bullet points. Highlight only terms that appear in the notes. No invented glossary. Max ~220 words.",
      user: `Summarize these study notes for revision:\n\n${text}`,
    };
  }

  if (mode === "question") {
    const choiceLines = choices
      .map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`)
      .join("\n");
    return {
      system:
        "You are a patient tutor. Explain why the correct option is right and why common wrong options fail. Plain paragraphs, max ~180 words. Use LaTeX as \\(...\\) when needed.",
      user: `Question:\n${text}\n\nChoices:\n${choiceLines || "(none)"}\n\nStudent answer: ${studentAnswer || "(not answered)"}\nCorrect answer: ${correctAnswer || solution || "(see solution)"}\n\nOfficial solution:\n${solution || "(none)"}`,
    };
  }

  return {
    system: "You are a helpful tutor. Be concise and clear.",
    user: text,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { system, user } = buildMessages(body);
    if (!String(body.text || body.question || "").trim()) {
      return NextResponse.json({ error: "Nothing to explain" }, { status: 400 });
    }

    try {
      const result = await raceProviders(system, user);
      return NextResponse.json({
        explanation: result.text,
        model: result.model,
        fallback: false,
      });
    } catch (e) {
      console.error("[ai/explain] all providers failed", errMsg(e));
      return NextResponse.json({
        explanation: FALLBACK,
        fallback: true,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
