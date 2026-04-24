import { createHash } from "crypto";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_VERSION = "v2";
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isTextTooLong(text: string) {
  return text.length > 60000;
}

function isHtmlLike(text: string) {
  return /<[^>]+>/.test(text);
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#8221;|&#8243;|&rdquo;/g, '"')
    .replace(/&#8220;|&#8242;|&ldquo;/g, '"')
    .replace(/&#8217;|&rsquo;|&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function splitHtmlIntoTranslationSegments(html: string) {
  const segments: Array<{ type: "html" | "text"; value: string }> = [];
  const regex = /(<[^>]+>)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: html.slice(lastIndex, match.index) });
    }

    segments.push({ type: "html", value: match[0] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < html.length) {
    segments.push({ type: "text", value: html.slice(lastIndex) });
  }

  return segments;
}

function splitLongText(text: string, maxChars = 5000) {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxChars) {
    const slice = remaining.slice(0, maxChars);
    const splitAt = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("\n"), slice.lastIndexOf(" "));
    const end = splitAt > maxChars * 0.6 ? splitAt + 1 : maxChars;
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end);
  }

  if (remaining.trim()) chunks.push(remaining);
  return chunks;
}

function jsonResponse(translatedText: string, error?: string) {
  return NextResponse.json(error ? { translatedText, error } : { translatedText });
}

function pruneExpiredCacheEntries() {
  const now = Date.now();

  translationCache.forEach((value, key) => {
    if (value.expiresAt <= now) {
      translationCache.delete(key);
    }
  });
}

async function callGeminiAPI(text: string, lang: string, model: string, preserveHtml = true) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set in Vercel");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const htmlInstruction = preserveHtml
    ? "3. Preserve ALL HTML tags (<a>, <p>, <img>, etc.) EXACTLY as they are.\n          4. If the text has a TITLE: and CONTENT: format, preserve those labels in the translation."
    : "3. Translate the text exactly as provided. Preserve whitespace where it matters.";

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
          ${htmlInstruction}

          TEXT TO TRANSLATE:
          \n\n${text}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 32768,
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
  let body: { text?: unknown; targetLang?: unknown } | null = null;
  try {
    body = await req.json();
    if (!body) {
      return jsonResponse("");
    }

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

    let translatedText: string | undefined;
    const models = ["gemini-2.5-flash", "gemini-2.5-pro"];

    if (isHtmlLike(text)) {
      const segments = splitHtmlIntoTranslationSegments(text);
      const translatedSegments: string[] = [];

      for (const segment of segments) {
        if (segment.type === "html" || !segment.value.trim()) {
          translatedSegments.push(segment.value);
          continue;
        }

        const chunks = splitLongText(decodeHtmlEntities(segment.value));
        const translatedChunks: string[] = [];

        for (const chunk of chunks) {
          let translatedChunk: string | undefined;

          for (const model of models) {
            try {
              translatedChunk = await callGeminiAPI(chunk, target, model, false);
              if (translatedChunk) break;
            } catch (error: unknown) {
              console.warn(`Model ${model} failed:`, getErrorMessage(error));
            }
          }

          if (!translatedChunk) {
            translatedChunks.length = 0;
            break;
          }

          translatedChunks.push(translatedChunk);
        }

        translatedSegments.push(translatedChunks.length ? translatedChunks.join(" ") : segment.value);
      }

      translatedText = translatedSegments.join("");
    } else {
      for (const model of models) {
        try {
          translatedText = await callGeminiAPI(text, target, model);
          if (translatedText) break;
        } catch (error: unknown) {
          console.warn(`Model ${model} failed:`, getErrorMessage(error));
        }
      }
    }

    if (translatedText) {
      setCachedTranslation(cacheKey, translatedText);
    }

    return jsonResponse(translatedText || text);
  } catch (error: unknown) {
    console.error("Translation error:", getErrorMessage(error));
    return jsonResponse(isValidText(body?.text) ? body.text : "");
  }
}
