import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";

async function callGeminiAPI(text: string, lang: string, model: string, apiVersion: string = "v1beta") {
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

    if (!text || !targetLang || targetLang === 'tr') {
      return NextResponse.json({ translatedText: text || "" });
    }

    const langNames: Record<string, string> = {
      en: "English",
      ru: "Russian",
      de: "German"
    };
    const target = langNames[targetLang as keyof typeof langNames] || targetLang;

    // Strategy: Try the most modern Flash model first, then fallbacks.
    let translatedText;
    try {
      // 1. Try gemini-1.5-flash-latest (v1beta is safest for latest models)
      translatedText = await callGeminiAPI(text, target, "gemini-1.5-flash-latest", "v1beta");
    } catch (e1: any) {
      console.warn("Attempt 1 failed:", e1.message);
      try {
        // 2. Try standard gemini-1.5-flash (v1)
        translatedText = await callGeminiAPI(text, target, "gemini-1.5-flash", "v1");
      } catch (e2: any) {
        console.warn("Attempt 2 failed:", e2.message);
        try {
          // 3. Last resort: gemini-pro (v1beta)
          translatedText = await callGeminiAPI(text, target, "gemini-pro", "v1beta");
        } catch (e3: any) {
           console.error("Final Attempt failed:", e3.message);
           throw e3;
        }
      }
    }

    return NextResponse.json({ translatedText: translatedText || text });
  } catch (error: any) {
    console.error("All Gemini Models Failed:", error.message || error);
    return NextResponse.json({ 
      translatedText: body?.text || "",
      error: error.message
    });
  }
}
