import { createHash } from "crypto";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_VERSION = "v1";
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "ru"]);
const translationCache = new Map<string, { translatedText: string; expiresAt: number }>();

function normalizeText(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function getCacheKey(text: string, targetLang: string) {
  return createHash("sha256")
    .update(`${targetLang}::${normalizeText(text)}::${CACHE_VERSION}`)
    .digest("hex");
}

function getCachedTranslation(cacheKey: string) {
  const cached = translationCache.get(cacheKey);

  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    translationCache.delete(cacheKey);
    return null;
  }

  return cached.translatedText;
}

function setCachedTranslation(cacheKey: string, translatedText: string) {
  translationCache.set(cacheKey, {
    translatedText,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function isValidText(text: unknown): text is string {
  return typeof text === "string" && text.trim().length > 0;
}

function isValidTargetLang(targetLang: unknown): targetLang is string {
  return typeof targetLang === "string" && SUPPORTED_LANGS.has(targetLang);
}

function isTextTooLong(text: string) {
  return text.length > 16000;
}

function jsonResponse(translatedText: string, error?: string) {
  return NextResponse.json(error ? { translatedText, error } : { translatedText });
}

function pruneExpiredCacheEntries() {
  const now = Date.now();

  for (const [key, value] of translationCache.entries()) {
    if (value.expiresAt <= now) {
      translationCache.delete(key);
    }
  }
}

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
        maxOutputTokens: 8192,
        topP: 1
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
      return jsonResponse(isValidText(text) ? text : "", "API key not configured");
    }

    if (!isValidText(text)) {
      return jsonResponse("");
    }

    if (!isValidTargetLang(targetLang)) {
      return jsonResponse(text);
    }

    if (targetLang === "tr") {
      return jsonResponse(text);
    }

    if (isTextTooLong(text)) {
      return jsonResponse(text, "Text too long for translation");
    }

    pruneExpiredCacheEntries();

    const cacheKey = getCacheKey(text, targetLang);
    const cachedTranslation = getCachedTranslation(cacheKey);

    if (cachedTranslation) {
      return jsonResponse(cachedTranslation);
    }

    const langNames: Record<string, string> = {
      en: "English",
      ru: "Russian",
      de: "German"
    };
    const target = langNames[targetLang] || targetLang;

    // Updated April 2026: Use current Gemini model names
    let translatedText: string | undefined;
    const models = ["gemini-2.5-flash", "gemini-2.5-pro"];

    for (const model of models) {
      try {
        translatedText = await callGeminiAPI(text, target, model);
        if (translatedText) break;
      } catch (e: any) {
        console.warn(`Model ${model} failed:`, e.message);
      }
    }

    if (translatedText) {
      setCachedTranslation(cacheKey, translatedText);
    }

    return jsonResponse(translatedText || text);
  } catch (error: any) {
    console.error("Translation error:", error.message || error);
    return jsonResponse(isValidText(body?.text) ? body.text : "");
  }
}
