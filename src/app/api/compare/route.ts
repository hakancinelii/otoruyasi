import { createHash } from "crypto";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "ru"]);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_VERSION = "v2";
const compareCache = new Map<string, { result: ComparePayload; expiresAt: number }>();

type ComparePayload = {
  car1: {
    score: number;
    points: string[];
  };
  car2: {
    score: number;
    points: string[];
  };
  analysis: string;
};

function normalizeCompareInput(car1: string, car2: string, targetLang: string) {
  return `${car1.trim()}::${car2.trim()}::${targetLang}`.replace(/\s+/g, " ");
}

function getCompareCacheKey(car1: string, car2: string, targetLang: string) {
  return createHash("sha256")
    .update(`${normalizeCompareInput(car1, car2, targetLang)}::${CACHE_VERSION}`)
    .digest("hex");
}

function pruneExpiredCompareCache() {
  const now = Date.now();

  for (const [key, value] of compareCache.entries()) {
    if (value.expiresAt <= now) {
      compareCache.delete(key);
    }
  }
}

function getCachedCompare(cacheKey: string) {
  const cached = compareCache.get(cacheKey);

  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    compareCache.delete(cacheKey);
    return null;
  }

  return cached.result;
}

function setCachedCompare(cacheKey: string, result: ComparePayload) {
  compareCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function isValidCarValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function jsonSuccess(result: ComparePayload) {
  return NextResponse.json(result);
}

function safeTargetLanguage(targetLang: unknown) {
  return typeof targetLang === "string" && SUPPORTED_LANGS.has(targetLang) ? targetLang : "tr";
}

function getTargetLanguageName(lang: string) {
  const langNames: Record<string, string> = {
    en: "English",
    ru: "Russian",
    de: "German",
    tr: "Turkish",
  };

  return langNames[lang] || "Turkish";
}

function getMissingCarsError() {
  return "İki araç da belirtilmeli.";
}

function getApiKeyMissingError() {
  return "Gemini API anahtarı ayarlanmamış.";
}

function getBusyError() {
  return "Yapay zeka şu an meşgul, lütfen az sonra tekrar deneyiniz.";
}

function getPromptTooLongError() {
  return "Karşılaştırma isteği çok uzun.";
}

function getAllModelsFailedError() {
  return "Tüm yapay zeka modelleri başarısız oldu.";
}

function isPromptTooLong(car1: string, car2: string) {
  return `${car1} ${car2}`.length > 200;
}

function validateCompareInputs(car1: unknown, car2: unknown) {
  if (!isValidCarValue(car1) || !isValidCarValue(car2)) {
    return jsonError(getMissingCarsError(), 400);
  }

  if (isPromptTooLong(car1, car2)) {
    return jsonError(getPromptTooLongError(), 400);
  }

  return null;
}

function extractScore(text: string, label: string) {
  const regex = new RegExp(`${label}\\s*score\\s*:\\s*(\\d+(?:[.,]\\d+)?)`, "i");
  const match = text.match(regex);
  if (!match) throw new Error(`Missing ${label} score`);
  return Number(match[1].replace(",", "."));
}

function extractPoints(text: string, label: string) {
  const regex = new RegExp(`${label}\\s*points\\s*:\\s*([\\s\\S]*?)(?=car[12]\\s*score:|analysis:|$)`, "i");
  const match = text.match(regex);
  if (!match) throw new Error(`Missing ${label} points`);

  const points = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*+]\s*/, "").trim())
    .filter(Boolean);

  if (!points.length) throw new Error(`Empty ${label} points`);
  return points;
}

function extractAnalysis(text: string) {
  const regex = /analysis\s*:\s*([\s\S]*)$/i;
  const match = text.match(regex);
  if (!match?.[1]?.trim()) throw new Error("Missing analysis");
  return match[1].trim();
}

function parseComparePayload(text: string): ComparePayload {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  if (cleaned.startsWith("{")) {
    try {
      const parsed = JSON.parse(cleaned) as ComparePayload;
      if (
        parsed?.car1 && typeof parsed.car1.score === "number" && Array.isArray(parsed.car1.points) &&
        parsed?.car2 && typeof parsed.car2.score === "number" && Array.isArray(parsed.car2.points) &&
        typeof parsed.analysis === "string"
      ) {
        return parsed;
      }
    } catch {
      // fall through to label-based parsing
    }
  }

  return {
    car1: {
      score: extractScore(cleaned, "car1"),
      points: extractPoints(cleaned, "car1"),
    },
    car2: {
      score: extractScore(cleaned, "car2"),
      points: extractPoints(cleaned, "car2"),
    },
    analysis: extractAnalysis(cleaned),
  };
}

function buildComparePrompt(car1: string, car2: string, target: string) {
  return `You are OTO RUYASI's chief automotive editor and an expert road test journalist.
Compare these two cars for the Turkish market: "${car1}" and "${car2}".
Write everything in ${target}.

IMPORTANT FORMAT RULES:
- Do NOT use markdown.
- Do NOT wrap the answer in code fences.
- Do NOT return JSON.
- Return plain text exactly in this structure:

car1 score: <number between 1 and 10>
car1 points:
- point 1
- point 2
- point 3
- point 4

car2 score: <number between 1 and 10>
car2 points:
- point 1
- point 2
- point 3
- point 4

analysis:
<single detailed analysis paragraph around 180-250 words>

Keep the structure exactly as requested.`;
}

async function callExperienceAI(car1: string, car2: string, lang: string, model: string) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set");

  const prompt = buildComparePrompt(car1, car2, getTargetLanguageName(lang));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        topP: 1,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `HTTP ${response.status}`;
    console.error("AI Error:", message);
    throw new Error(message);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error("AI returned empty content");
  }

  return parseComparePayload(text);
}

export async function POST(req: Request) {
  try {
    const { car1, car2, targetLang = "tr" } = await req.json();

    const validationError = validateCompareInputs(car1, car2);
    if (validationError) {
      return validationError;
    }

    if (!API_KEY) {
      return jsonError(getApiKeyMissingError(), 500);
    }

    const safeCar1 = car1.trim();
    const safeCar2 = car2.trim();
    const safeLang = safeTargetLanguage(targetLang);

    pruneExpiredCompareCache();

    const cacheKey = getCompareCacheKey(safeCar1, safeCar2, safeLang);
    const cached = getCachedCompare(cacheKey);
    if (cached) {
      return jsonSuccess(cached);
    }

    const models = ["gemini-2.5-flash", "gemini-2.5-pro"];
    let result: ComparePayload | null = null;

    for (const modelName of models) {
      try {
        result = await callExperienceAI(safeCar1, safeCar2, safeLang, modelName);
        if (result) break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Comparison failed with model ${modelName}:`, message);
      }
    }

    if (!result) {
      throw new Error(getAllModelsFailedError());
    }

    setCachedCompare(cacheKey, result);
    return jsonSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Comparison API Error:", message);
    return jsonError(getBusyError(), 500);
  }
}
