import { NextRequest, NextResponse } from "next/server";

/**
 * Explain-with-AI endpoint.
 * Set OPENAI_API_KEY (or compatible) in Vercel env for live answers.
 * Without a key, returns a helpful offline scaffold so the UI still works.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = String(body.text || "").slice(0, 6000);
    const solution = body.solution ? String(body.solution).slice(0, 2000) : "";
    const mode = body.mode === "question" ? "question" : "notes";

    if (!text.trim()) {
      return NextResponse.json({ error: "Nothing to explain" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

    if (!apiKey) {
      const offline =
        mode === "question"
          ? `Study tip (offline mode):\n\n1. Restate the question in your own words.\n2. Eliminate wrong options.\n3. Check units and definitions.\n\n${
              solution ? `Official solution hint:\n${solution}` : "No premade solution stored."
            }\n\nAdd OPENAI_API_KEY in Vercel for full AI explanations.`
          : `Study tip (offline mode):\n\nKey ideas from this note:\n• Read headings first, then details.\n• Write one sentence summary per section.\n• Turn bold terms into flashcards.\n\nAdd OPENAI_API_KEY in Vercel for full AI explanations.\n\n--- Excerpt ---\n${text.slice(0, 800)}`;

      return NextResponse.json({ explanation: offline, offline: true });
    }

    const system =
      mode === "question"
        ? "You are a patient tutor for Ethiopian university and high-school students. Explain clearly, step by step, in simple English. If a solution is given, expand it without just copying."
        : "You are a study coach. Summarize notes, highlight key definitions, and suggest how to remember them. Keep it concise.";

    const userMsg =
      mode === "question"
        ? `Question:\n${text}\n\nPremade solution (if any):\n${solution || "(none)"}`
        : `Notes:\n${text}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "AI provider error", detail: err.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const explanation =
      data.choices?.[0]?.message?.content || "No response from model.";

    return NextResponse.json({ explanation });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
