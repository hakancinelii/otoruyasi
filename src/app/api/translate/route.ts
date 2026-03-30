import { NextResponse } from "next/server";

// CRITICAL SECURITY UPDATE:
// We removed all hardcoded keys to avoid Google's "Leaked Key" automatic disabling.
// You MUST add GEMINI_API_KEY to your Vercel Dashboard Environment Variables.
const API_KEY = process.env.GEMINI_API_KEY;

async function callGeminiAPI(text: string, lang: string, model: string, apiVersion: string = "v1beta") {
  if (!API_KEY) throw new Error("API_KEY_MISSING");

  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Translate the following automotive text into ${lang}. Only return translated text. Keep HTML tags. CONTENT: ${text}`
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Gemini ${model} Error`);
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
      console.error("Vercel'de GEMINI_API_KEY eksik!");
      return NextResponse.json({ translatedText: text || "", error: "API Key is missing in Vercel. Please add GEMINI_API_KEY first." });
    }

    if (!text || !targetLang || targetLang === 'tr') {
      return NextResponse.json({ translatedText: text || "" });
    }

    const langNames: Record<string, string> = {
      en: "English",
      ru: "Russian",
      de: "German"
    };
    const target = langNames[targetLang as keyof typeof langNames] || targetLang;

    let translatedText;
    try {
      // First try 1.5 Flash (Modern standard)
      translatedText = await callGeminiAPI(text, target, "gemini-1.5-flash", "v1beta");
    } catch (e: any) {
      console.warn("Retrying with fallback model due to:", e.message);
      // Fallback
      translatedText = await callGeminiAPI(text, target, "gemini-pro", "v1beta");
    }

    return NextResponse.json({ translatedText: translatedText || text });
  } catch (error: any) {
    console.error("All Gemini Models Failed:", error.message || error);
    return NextResponse.json({ 
      translatedText: body?.text || "",
      error: error.message === "API_KEY_MISSING" ? "Vercel üzerinde GEMINI_API_KEY tanımlanmamış!" : error.message
    });
  }
}
