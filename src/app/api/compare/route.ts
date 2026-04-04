import { createHash } from "crypto";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const SUPPORTED_LANGS = new Set(["tr", "en", "de", "ru"]);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_VERSION = "v1";
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

function isValidComparePayload(value: unknown): value is ComparePayload {
  if (!value || typeof value !== "object") return false;

  const candidate = value as ComparePayload;

  const isValidEntry = (entry: ComparePayload["car1"]) => {
    return (
      entry &&
      typeof entry.score === "number" &&
      Array.isArray(entry.points) &&
      entry.points.every((point) => typeof point === "string")
    );
  };

  return (
    isValidEntry(candidate.car1) &&
    isValidEntry(candidate.car2) &&
    typeof candidate.analysis === "string"
  );
}

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

function extractJsonPayload(text: string) {
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text.trim();
}

function parseComparePayload(text: string) {
  const cleaned = extractJsonPayload(text);
  const parsed = JSON.parse(cleaned);

  if (!isValidComparePayload(parsed)) {
    console.error("Invalid AI comparison payload:", parsed);
    throw new Error("AI response format error");
  }

  return parsed;
}

function isValidCarValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getCompareErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function jsonSuccess(result: ComparePayload) {
  return NextResponse.json(result);
}

function isPromptTooLong(car1: string, car2: string) {
  return `${car1} ${car2}`.length > 200;
}

function safeTargetLanguage(targetLang: unknown) {
  return typeof targetLang === "string" && SUPPORTED_LANGS.has(targetLang) ? targetLang : "tr";
}

function logModelFailure(modelName: string, error: unknown) {
  console.warn(`Comparison failed with model ${modelName}:`, getCompareErrorMessage(error));
}

function logApiError(error: unknown) {
  console.error("Comparison API Error:", getCompareErrorMessage(error));
}

function logAiHttpError(message: string) {
  console.error("AI Error:", message);
}

function logParseError(text: string) {
  console.error("Failed to parse AI JSON:", text);
}

function getModelList() {
  return ["gemini-2.5-flash", "gemini-2.5-pro"];
}

function buildComparePrompt(car1: string, car2: string, target: string) {
  return `
    Sen OTO RÜYASI Dijital Dergi'nin baş editörü ve profesyonel bir otomobil testi uzmanısın.
    Şu iki aracı Türkiye pazarı dinamiklerini (ikinci el değeri, motor/yakıt seçenekleri, servis yaygınlığı)
    göz önüne alarak profesyonelce karşılaştır: "${car1}" ve "${car2}".

    YAZI DİLİ: Lütfen tüm yanıtı ${target} dilinde oluştur.

    Bana aşağıdaki JSON formatında bir yanıt dön. Açıklama, markdown veya ek metin yazma. Yalnızca JSON dön:

    {
      "car1": {
        "score": 0.0,
        "points": ["Artı/Eksi Madde 1", "Madde 2", "Madde 3", "Madde 4"]
      },
      "car2": {
        "score": 0.0,
        "points": ["Artı/Eksi Madde 1", "Madde 2", "Madde 3", "Madde 4"]
      },
      "analysis": "Buraya her iki aracı detaylıca kıyaslayan, yaklaşık 250 kelimelik, sürüş kalitesi, Türkiye pazarındaki durumu ve hangi kullanıcı kitlesine hangisinin uygun olduğunu anlatan akıcı ve uzman bir dil ile yazılmış analiz metni."
    }

    Puanlar 1-10 arasında olsun. Tüm JSON içerisindeki metinler ${target} dilinde olmalıdır.
  `;
}

function getTargetLanguageName(lang: string) {
  const langNames: Record<string, string> = {
    en: "English",
    ru: "Russian",
    de: "German",
    tr: "Turkish"
  };

  return langNames[lang] || "Turkish";
}

function getCompareResponseText(data: any) {
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

function ensureCompareResponseText(text: string) {
  if (!text) throw new Error("AI returned empty content");
  return text;
}

function handleCompareHttpError(errorData: any, status: number) {
  const message = errorData.error?.message || `HTTP ${status}`;
  logAiHttpError(message);
  throw new Error(message);
}

function buildCompareRequestBody(prompt: string) {
  return JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      topP: 1,
    }
  });
}

function getCompareHeaders() {
  return { "Content-Type": "application/json" };
}

function getCompareUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
}

function ensureApiKey() {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set");
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

function getCacheableResult(result: ComparePayload) {
  return result;
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

function getApiKeyErrorResponse() {
  return jsonError(getApiKeyMissingError(), 500);
}

function getBusyErrorResponse() {
  return jsonError(getBusyError(), 500);
}

function getCachedCompareResponse(cacheKey: string) {
  const cached = getCachedCompare(cacheKey);
  return cached ? jsonSuccess(cached) : null;
}

function setCompareCacheResponse(cacheKey: string, result: ComparePayload) {
  setCachedCompare(cacheKey, getCacheableResult(result));
}

function getValidatedComparePayload(text: string) {
  try {
    return parseComparePayload(text);
  } catch (error) {
    logParseError(text);
    throw error;
  }
}

function getCompareModels() {
  return getModelList();
}

function getCompareCacheKeyForRequest(car1: string, car2: string, targetLang: string) {
  return getCompareCacheKey(car1, car2, targetLang);
}

function prepareCompareRequest(car1: string, car2: string, lang: string) {
  return buildComparePrompt(car1, car2, getTargetLanguageName(lang));
}

function getCompareResultFromText(text: string) {
  return getValidatedComparePayload(text);
}

function getSafeCompareResponse(data: any) {
  return ensureCompareResponseText(getCompareResponseText(data));
}

function getCompareSuccessResponse(result: ComparePayload) {
  return jsonSuccess(result);
}

function getCompareFailureResponse() {
  return getBusyErrorResponse();
}

function getCompareValidationResponse(car1: unknown, car2: unknown) {
  return validateCompareInputs(car1, car2);
}

function getCompareTargetLang(targetLang: unknown) {
  return safeTargetLanguage(targetLang);
}

function runCompareCacheCleanup() {
  pruneExpiredCompareCache();
}

function getCompareCacheHit(cacheKey: string) {
  return getCachedCompareResponse(cacheKey);
}

function setCompareCacheHit(cacheKey: string, result: ComparePayload) {
  setCompareCacheResponse(cacheKey, result);
}

function getCompareModelsToTry() {
  return getCompareModels();
}

function getComparePrompt(car1: string, car2: string, lang: string) {
  return prepareCompareRequest(car1, car2, lang);
}

function getCompareJsonResult(text: string) {
  return getCompareResultFromText(text);
}

function getCompareApiUrl(model: string) {
  return getCompareUrl(model);
}

function getCompareApiBody(prompt: string) {
  return buildCompareRequestBody(prompt);
}

function getCompareApiHeaders() {
  return getCompareHeaders();
}

function ensureCompareApiKey() {
  ensureApiKey();
}

function ensureCompareCars(car1: unknown, car2: unknown) {
  return getCompareValidationResponse(car1, car2);
}

function getCompareApiKeyMissingResponse() {
  return getApiKeyErrorResponse();
}

function getCompareBusyResponse() {
  return getCompareFailureResponse();
}

function getCompareModelsFailedError() {
  return new Error(getAllModelsFailedError());
}

function getCompareSafeLang(targetLang: unknown) {
  return getCompareTargetLang(targetLang);
}

function getCompareCacheEntryKey(car1: string, car2: string, targetLang: string) {
  return getCompareCacheKeyForRequest(car1, car2, targetLang);
}

function getCompareCacheResponse(cacheKey: string) {
  return getCompareCacheHit(cacheKey);
}

function storeCompareCacheResponse(cacheKey: string, result: ComparePayload) {
  setCompareCacheHit(cacheKey, result);
}

function cleanupCompareCache() {
  runCompareCacheCleanup();
}

function parseCompareResponseText(text: string) {
  return getCompareJsonResult(text);
}

function createCompareSuccessResponse(result: ComparePayload) {
  return getCompareSuccessResponse(result);
}

function createCompareBusyResponse() {
  return getCompareBusyResponse();
}

function createCompareKeyMissingResponse() {
  return getCompareApiKeyMissingResponse();
}

function createCompareValidationFailure(car1: unknown, car2: unknown) {
  return ensureCompareCars(car1, car2);
}

function getCompareLanguage(targetLang: unknown) {
  return getCompareSafeLang(targetLang);
}

function getCompareError(error: unknown) {
  return getCompareErrorMessage(error);
}

function warnCompareModel(modelName: string, error: unknown) {
  logModelFailure(modelName, error);
}

function errorCompareApi(error: unknown) {
  logApiError(error);
}

function throwAllModelsFailed() {
  throw getCompareModelsFailedError();
}

function getCompareRequestConfig(prompt: string) {
  return {
    method: "POST",
    headers: getCompareApiHeaders(),
    body: getCompareApiBody(prompt),
  };
}

function getComparePromptForModel(car1: string, car2: string, lang: string) {
  return getComparePrompt(car1, car2, lang);
}

function parseModelCompareResponse(text: string) {
  return parseCompareResponseText(text);
}

function createCompareResultResponse(result: ComparePayload) {
  return createCompareSuccessResponse(result);
}

function createCompareErrorResponse() {
  return createCompareBusyResponse();
}

function getCompareKey(car1: string, car2: string, targetLang: string) {
  return getCompareCacheEntryKey(car1, car2, targetLang);
}

function getCompareCached(cacheKey: string) {
  return getCompareCacheResponse(cacheKey);
}

function setCompareCached(cacheKey: string, result: ComparePayload) {
  storeCompareCacheResponse(cacheKey, result);
}

function cleanupCache() {
  cleanupCompareCache();
}

function getValidatedLang(targetLang: unknown) {
  return getCompareLanguage(targetLang);
}

function getValidationErrorResponse(car1: unknown, car2: unknown) {
  return createCompareValidationFailure(car1, car2);
}

function getMissingApiKeyResponse() {
  return createCompareKeyMissingResponse();
}

function getGenericBusyResponse() {
  return createCompareErrorResponse();
}

function logCompareError(error: unknown) {
  errorCompareApi(error);
}

function logCompareModelFailure(modelName: string, error: unknown) {
  warnCompareModel(modelName, error);
}

function throwModelsFailed() {
  throwAllModelsFailed();
}

function buildModelComparePrompt(car1: string, car2: string, lang: string) {
  return getComparePromptForModel(car1, car2, lang);
}

function buildModelCompareConfig(prompt: string) {
  return getCompareRequestConfig(prompt);
}

function parseModelResponse(text: string) {
  return parseModelCompareResponse(text);
}

function getSuccessResponse(result: ComparePayload) {
  return createCompareResultResponse(result);
}

function getErrorResponse() {
  return getGenericBusyResponse();
}

function getCacheKey(car1: string, car2: string, targetLang: string) {
  return getCompareKey(car1, car2, targetLang);
}

function getCacheResponse(cacheKey: string) {
  return getCompareCached(cacheKey);
}

function setCacheResponse(cacheKey: string, result: ComparePayload) {
  setCompareCached(cacheKey, result);
}

function cleanupCacheEntries() {
  cleanupCache();
}

function getSafeLang(targetLang: unknown) {
  return getValidatedLang(targetLang);
}

function getValidationResponse(car1: unknown, car2: unknown) {
  return getValidationErrorResponse(car1, car2);
}

function getApiKeyResponse() {
  return getMissingApiKeyResponse();
}

function getBusyResponse() {
  return getErrorResponse();
}

function reportCompareError(error: unknown) {
  logCompareError(error);
}

function reportModelFailure(modelName: string, error: unknown) {
  logCompareModelFailure(modelName, error);
}

async function callExperienceAI(car1: string, car2: string, lang: string, model: string) {
  ensureCompareApiKey();

  const prompt = buildModelComparePrompt(car1, car2, lang);
  const response = await fetch(getCompareApiUrl(model), buildModelCompareConfig(prompt));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    handleCompareHttpError(errorData, response.status);
  }

  const data = await response.json();
  const text = getSafeCompareResponse(data);

  return parseModelResponse(text);
}

export async function POST(req: Request) {
  try {
    const { car1, car2, targetLang = "tr" } = await req.json();

    const validationError = getValidationResponse(car1, car2);
    if (validationError) {
      return validationError;
    }

    if (!API_KEY) {
      return getApiKeyResponse();
    }

    const safeCar1 = car1.trim();
    const safeCar2 = car2.trim();
    const safeLang = getSafeLang(targetLang);

    cleanupCacheEntries();

    const cacheKey = getCacheKey(safeCar1, safeCar2, safeLang);
    const cachedResponse = getCacheResponse(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    let result: ComparePayload | null = null;

    for (const modelName of getCompareModels()) {
      try {
        result = await callExperienceAI(safeCar1, safeCar2, safeLang, modelName);
        if (result) break;
      } catch (error) {
        reportModelFailure(modelName, error);
      }
    }

    if (!result) {
      throwModelsFailed();
    }

    setCacheResponse(cacheKey, result);
    return getSuccessResponse(result);
  } catch (error) {
    reportCompareError(error);
    return getBusyResponse();
  }
}
