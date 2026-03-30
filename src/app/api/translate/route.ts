import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";

async function callGeminiAPI(text: string, lang: string, model: string) {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Translate the following automotive text into ${lang}. Only return translated text. Keep HTML tags. Marka isimlərini dəyişmə. CONTENT: ${text}`
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Gemini API Error");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
    const { text, targetLang } = body;

    if (!text || !targetLang || targetLang === 'tr') {
      return NextResponse.json({ translatedText: text || "" });
    }

    const langNames: Record<string, string> = {
      en: "English",
      ru: "Russian",
      de: "German"
    };
    const target = langNames[targetLang as keyof typeof langNames] || targetLang;

    // We use a safe retry mechanism with Native REST API to bypass SDK 404s
    let translatedText;
    try {
      // First try 1.5 Flash
      translatedText = await callGeminiAPI(text, target, "gemini-1.5-flash");
    } catch (e: any) {
      console.warn("Gemini 1.5 Flash failed, trying gemini-pro...", e.message);
      // Fallback to gemini-pro
      translatedText = await callGeminiAPI(text, target, "gemini-pro");
    }

    return NextResponse.json({ translatedText: translatedText || text });
  } catch (error: any) {
    console.error("Final Translation Fallback:", error.message || error);
    return NextResponse.json({ translatedText: body?.text || "" });
  }
}
