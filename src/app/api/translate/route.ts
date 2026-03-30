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
          text: `You are a professional translator. Translate the following text into ${lang}. 
          CRITICAL INSTRUCTIONS:
          1. TRANSLATE the ENTIRE text. DO NOT SUMMARIZE. DO NOT SKIP ANY PARAGRAPHS.
          2. Return ONLY the translated text. No intros or outros.
          3. Preserve ALL HTML tags (<a>, <p>, <img>, etc.) EXACTLY as they are.
          4. If the text has a TITLE: and CONTENT: format, preserve those labels in the translation.
          
          TEXT TO TRANSLATE:
          \n\n${text}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
  if (!translated) throw new Error("AI returned empty content");
  return translated;
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

    // Use "-latest" aliases to ensure we always use the current stable version
    // This prevents "no longer available to new users" errors.
    let translatedText: string | undefined;
    const models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-pro-latest"];

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
