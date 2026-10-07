import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, courseContext } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
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

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const reply = response.text || "I couldn't generate an answer. Please rephrase your question.";
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[AI Tutor API Error]", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An error occurred while communicating with Gemini API.",
      },
      { status: 500 }
    );
  }
}
