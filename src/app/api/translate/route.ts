import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

async function callGeminiAPI(text: string, lang: string, model: string) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set in Vercel");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Translate the following text into ${lang}. Return ONLY the translated text. Preserve all HTML tags exactly. Do not add any explanation.\n\n${text}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
    const { text, targetLang } = body;

    if (!API_KEY) {
      console.error("GEMINI_API_KEY missing from environment");
      return NextResponse.json({ translatedText: text || "", error: "API key not configured" });
    }

    if (!text || !targetLang || targetLang === "tr") {
      return NextResponse.json({ translatedText: text || "" });
    }

    const langNames: Record<string, string> = {
      en: "English",
      ru: "Russian",
      de: "German"
    };
    const target = langNames[targetLang] || targetLang;

    // March 2026: Only gemini-2.x models are available.
    // gemini-1.5-flash and gemini-pro have been retired by Google.
    let translatedText: string | undefined;
    const models = ["gemini-2.0-flash", "gemini-2.5-flash"];

    for (const model of models) {
      try {
        translatedText = await callGeminiAPI(text, target, model);
        if (translatedText) break;
      } catch (e: any) {
        console.warn(`Model ${model} failed:`, e.message);
      }
    }

    return NextResponse.json({ translatedText: translatedText || text });
  } catch (error: any) {
    console.error("Translation error:", error.message || error);
    return NextResponse.json({ translatedText: body?.text || "" });
  }
}
