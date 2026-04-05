import { createHash } from "crypto";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "ru"]);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_VERSION = "v3";
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
  summary: {
    winner: "car1" | "car2" | "tie";
    scoreDelta: number;
    shortVerdict: string;
  };
  analysisBlocks: {
    idealFor: string;
    dailyUse: string;
    comfortFeel: string;
    longTermOwnership: string;
    shortDecision: string;
  };
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

function getLabelAliases(label: "car1" | "car2") {
  return label === "car1"
    ? ["car1", "vehicle 1", "1. araç", "1. arac", "araç 1", "arac 1", "birinci araç", "birinci arac"]
    : ["car2", "vehicle 2", "2. araç", "2. arac", "araç 2", "arac 2", "ikinci araç", "ikinci arac"];
}

function buildAlternation(values: string[]) {
  return values.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
}

function normalizeRawResponse(text: string) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function extractScore(text: string, label: "car1" | "car2") {
  const labelPattern = buildAlternation(getLabelAliases(label));
  const scorePattern = buildAlternation(["score", "puan"]);
  const regex = new RegExp(`(?:${labelPattern})\\s*(?:${scorePattern})?\\s*:\\s*(\\d+(?:[.,]\\d+)?)`, "i");
  const match = text.match(regex);
  if (!match) throw new Error(`Missing ${label} score`);
  return Number(match[1].replace(",", "."));
}

function extractPoints(text: string, label: "car1" | "car2") {
  const labelPattern = buildAlternation(getLabelAliases(label));
  const pointsPattern = buildAlternation(["points", "puanlar", "maddeler", "öne çıkanlar", "one cikanlar"]);
  const nextLabelPattern = buildAlternation([...getLabelAliases("car1"), ...getLabelAliases("car2")]);
  const analysisPattern = buildAlternation(["analysis", "analiz", "yorum", "değerlendirme", "degerlendirme"]);
  const regex = new RegExp(`(?:${labelPattern})\\s*(?:${pointsPattern})?\\s*:\\s*([\\s\\S]*?)(?=(?:${nextLabelPattern})\\s*(?:score|puan)?\\s*:|(?:${analysisPattern})\\s*:|$)`, "i");
  const match = text.match(regex);
  if (!match) throw new Error(`Missing ${label} points`);

  const points = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•*+]\s*/, "").trim())
    .filter((line) => line.length > 2);

  if (!points.length) throw new Error(`Empty ${label} points`);
  return points;
}

function extractAnalysis(text: string) {
  const analysisPattern = buildAlternation(["analysis", "analiz", "yorum", "değerlendirme", "degerlendirme"]);
  const regex = new RegExp(`(?:${analysisPattern})\\s*:\\s*([\\s\\S]*)$`, "i");
  const match = text.match(regex);
  if (!match?.[1]?.trim()) throw new Error("Missing analysis");
  return match[1].trim();
}

function buildSummary(car1Name: string, car2Name: string, payload: { car1: { score: number }, car2: { score: number } }, targetLang: string) {
  const scoreDelta = Math.abs(payload.car1.score - payload.car2.score);
  const winner = payload.car1.score === payload.car2.score ? "tie" : payload.car1.score > payload.car2.score ? "car1" : "car2";

  if (winner === "tie") {
    return {
      winner,
      scoreDelta,
      shortVerdict: targetLang === "tr"
        ? `${car1Name} ve ${car2Name} birbirine çok yakın görünüyor; seçim kullanım önceliğine göre değişir.`
        : `${car1Name} and ${car2Name} are very close; the final pick depends on usage priorities.`,
    };
  }

  const winnerName = winner === "car1" ? car1Name : car2Name;
  const loserName = winner === "car1" ? car2Name : car1Name;

  return {
    winner,
    scoreDelta,
    shortVerdict: targetLang === "tr"
      ? `${winnerName}, ${loserName} karşısında daha güçlü genel denge sunuyor.`
      : `${winnerName} delivers a stronger overall balance against ${loserName}.`,
  };
}

function buildAnalysisBlocks(car1Name: string, car2Name: string, summary: ComparePayload["summary"], analysis: string, targetLang: string): ComparePayload["analysisBlocks"] {
  if (targetLang === "tr") {
    return {
      idealFor: summary.winner === "tie"
        ? `${car1Name} ve ${car2Name}, farklı kullanıcı tiplerine göre mantıklı seçenekler sunuyor.`
        : `${summary.winner === "car1" ? car1Name : car2Name}, kendi segmentinde daha net bir kullanıcı profiline hitap ediyor.`,
      dailyUse: `${car1Name} ve ${car2Name}, günlük kullanım beklentilerinde farklı güçlü taraflar gösteriyor; detayları AI analizine göre okumak karar kalitesini artırır.`,
      comfortFeel: `${summary.winner === "car1" ? car1Name : summary.winner === "car2" ? car2Name : `${car1Name} ile ${car2Name}`}, premium his ve konfor tarafında daha ikna edici bir toplam denge veriyor.`,
      longTermOwnership: `Uzun dönem sahiplikte bakım maliyeti, ikinci el algısı ve kullanım alışkanlığı seçimi doğrudan etkileyebilir.`,
      shortDecision: summary.shortVerdict || analysis,
    };
  }

  return {
    idealFor: summary.winner === "tie"
      ? `${car1Name} and ${car2Name} both make sense depending on the user profile.`
      : `${summary.winner === "car1" ? car1Name : car2Name} is better aligned with a clearer user profile in this matchup.`,
    dailyUse: `${car1Name} and ${car2Name} show different strengths in everyday driving, so the AI context matters for the final pick.`,
    comfortFeel: `${summary.winner === "car1" ? car1Name : summary.winner === "car2" ? car2Name : `${car1Name} and ${car2Name}`}, delivers the more convincing premium and comfort balance.`,
    longTermOwnership: `Long-term ownership can be shaped by running costs, resale perception and usage habits.`,
    shortDecision: summary.shortVerdict || analysis,
  };
}

function normalizeParsedPayload(payload: ComparePayload, car1Name: string, car2Name: string, targetLang: string): ComparePayload {
  const summary = buildSummary(car1Name, car2Name, payload, targetLang);
  return {
    car1: {
      score: Math.max(0, Math.min(10, payload.car1.score)),
      points: payload.car1.points.slice(0, 6),
    },
    car2: {
      score: Math.max(0, Math.min(10, payload.car2.score)),
      points: payload.car2.points.slice(0, 6),
    },
    analysis: payload.analysis,
    summary,
    analysisBlocks: buildAnalysisBlocks(car1Name, car2Name, summary, payload.analysis, targetLang),
  };
}

function coerceJsonPayload(parsed: any, car1Name: string, car2Name: string, targetLang: string): ComparePayload | null {
  const first = parsed?.car1 || parsed?.arac1 || parsed?.vehicle1;
  const second = parsed?.car2 || parsed?.arac2 || parsed?.vehicle2;
  const analysis = parsed?.analysis || parsed?.analiz || parsed?.yorum || parsed?.degerlendirme || parsed?.["değerlendirme"];

  if (!first || !second || typeof analysis !== "string") return null;

  const firstScore = typeof first.score === "number" ? first.score : first.puan;
  const secondScore = typeof second.score === "number" ? second.score : second.puan;
  const firstPoints = Array.isArray(first.points) ? first.points : first.puanlar;
  const secondPoints = Array.isArray(second.points) ? second.points : second.puanlar;

  if (typeof firstScore !== "number" || typeof secondScore !== "number") return null;
  if (!Array.isArray(firstPoints) || !Array.isArray(secondPoints)) return null;

  return normalizeParsedPayload({
    car1: {
      score: firstScore,
      points: firstPoints.map((point: unknown) => String(point)),
    },
    car2: {
      score: secondScore,
      points: secondPoints.map((point: unknown) => String(point)),
    },
    analysis,
    summary: {
      winner: "tie",
      scoreDelta: 0,
      shortVerdict: "",
    },
  }, car1Name, car2Name, targetLang);
}

function tryParseJsonPayload(cleaned: string, car1Name: string, car2Name: string, targetLang: string) {
  try {
    const parsed = JSON.parse(cleaned);
    return coerceJsonPayload(parsed, car1Name, car2Name, targetLang);
  } catch {
    return null;
  }
}

function splitLines(text: string) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

function fallbackExtractPoints(text: string, label: "car1" | "car2") {
  const lines = splitLines(text);
  const aliases = getLabelAliases(label);
  const startIndex = lines.findIndex((line) => aliases.some((alias) => line.toLowerCase().includes(alias.toLowerCase())));
  if (startIndex === -1) throw new Error(`Missing ${label} points`);

  const collected: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (getLabelAliases(label === "car1" ? "car2" : "car1").some((alias) => lower.includes(alias.toLowerCase()))) break;
    if (["analysis:", "analiz:", "yorum:", "değerlendirme:", "degerlendirme:"].some((token) => lower.startsWith(token))) break;
    if (/^\d+(?:[.,]\d+)?$/.test(line)) continue;
    const normalized = line.replace(/^[-•*+]\s*/, "").trim();
    if (normalized.length > 2) collected.push(normalized);
  }

  if (!collected.length) throw new Error(`Empty ${label} points`);
  return collected.slice(0, 6);
}

function parseComparePayload(text: string, car1Name: string, car2Name: string, targetLang: string): ComparePayload {
  const cleaned = normalizeRawResponse(text);

  const jsonPayload = tryParseJsonPayload(cleaned, car1Name, car2Name, targetLang);
  if (jsonPayload) {
    return jsonPayload;
  }

  try {
    return normalizeParsedPayload({
      car1: {
        score: extractScore(cleaned, "car1"),
        points: extractPoints(cleaned, "car1"),
      },
      car2: {
        score: extractScore(cleaned, "car2"),
        points: extractPoints(cleaned, "car2"),
      },
      analysis: extractAnalysis(cleaned),
      summary: {
        winner: "tie",
        scoreDelta: 0,
        shortVerdict: "",
      },
    }, car1Name, car2Name, targetLang);
  } catch {
    return normalizeParsedPayload({
      car1: {
        score: extractScore(cleaned, "car1"),
        points: fallbackExtractPoints(cleaned, "car1"),
      },
      car2: {
        score: extractScore(cleaned, "car2"),
        points: fallbackExtractPoints(cleaned, "car2"),
      },
      analysis: extractAnalysis(cleaned),
      summary: {
        winner: "tie",
        scoreDelta: 0,
        shortVerdict: "",
      },
    }, car1Name, car2Name, targetLang);
  }
}

function buildOutputLabels(target: string) {
  if (target === "Turkish") {
    return {
      car1Score: "1. araç puan",
      car1Points: "1. araç puanlar",
      car2Score: "2. araç puan",
      car2Points: "2. araç puanlar",
      analysis: "analiz",
    };
  }

  return {
    car1Score: "car1 score",
    car1Points: "car1 points",
    car2Score: "car2 score",
    car2Points: "car2 points",
    analysis: "analysis",
  };
}

function buildComparePrompt(car1: string, car2: string, target: string) {
  const labels = buildOutputLabels(target);
  return `You are OTO RUYASI's chief automotive editor and an expert road test journalist.
Compare these two cars for the Turkish market: "${car1}" and "${car2}".
Write everything in ${target}.

IMPORTANT FORMAT RULES:
- Do NOT use markdown.
- Do NOT wrap the answer in code fences.
- Do NOT return JSON.
- Return plain text exactly in this structure and keep the labels exactly as written below:

${labels.car1Score}: <number between 1 and 10>
${labels.car1Points}:
- point 1
- point 2
- point 3
- point 4

${labels.car2Score}: <number between 1 and 10>
${labels.car2Points}:
- point 1
- point 2
- point 3
- point 4

${labels.analysis}:
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

  return parseComparePayload(text, car1, car2, lang);
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
