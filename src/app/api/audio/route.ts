import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

const API_KEY = process.env.GEMINI_API_KEY;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_VERSION = 'v1';
const SUPPORTED_LANGS = new Set(['tr', 'en', 'de', 'ru']);
const SUPPORTED_VOICES = new Set(['female', 'male']);
const audioScriptCache = new Map<string, { script: string; expiresAt: number }>();

function normalizeText(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function getCacheKey(text: string, targetLang: string, voice: string) {
  return createHash('sha256')
    .update(`${targetLang}::${voice}::${normalizeText(text)}::${CACHE_VERSION}`)
    .digest('hex');
}

function getCachedScript(cacheKey: string) {
  const cached = audioScriptCache.get(cacheKey);

  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    audioScriptCache.delete(cacheKey);
    return null;
  }

  return cached.script;
}

function setCachedScript(cacheKey: string, script: string) {
  audioScriptCache.set(cacheKey, {
    script,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function pruneExpiredCacheEntries() {
  const now = Date.now();

  for (const [key, value] of audioScriptCache.entries()) {
    if (value.expiresAt <= now) {
      audioScriptCache.delete(key);
    }
  }
}

function isValidText(text: unknown): text is string {
  return typeof text === 'string' && text.trim().length > 0;
}

function isValidTargetLang(targetLang: unknown): targetLang is string {
  return typeof targetLang === 'string' && SUPPORTED_LANGS.has(targetLang);
}

function isValidVoice(voice: unknown): voice is string {
  return typeof voice === 'string' && SUPPORTED_VOICES.has(voice);
}

function isTextTooLong(text: string) {
  return text.length > 16000;
}

function jsonResponse(script: string, error?: string) {
  return NextResponse.json(error ? { script, error } : { script });
}

async function callGeminiAPI(text: string, lang: string, voice: string, model: string) {
  if (!API_KEY) throw new Error('GEMINI_API_KEY is not set in Vercel');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  const voiceTone = voice === 'female' ? 'a calm, natural female voice' : 'a calm, natural male voice';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an audio script editor for a news website. Rewrite the following article into a clean spoken-news script in ${lang}.
CRITICAL INSTRUCTIONS:
1. Return ONLY the final spoken script. No notes.
2. Remove HTML remnants, URLs, tracking, ad text, navigation labels and unrelated artifacts.
3. Keep the meaning faithful, but make the flow natural for ${voiceTone}.
4. Keep the article headline at the beginning, then continue with the article body.
5. Do not invent facts. Do not summarize aggressively.
6. The output should sound natural when read aloud.

ARTICLE:
${text}`,
        }],
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        topP: 1,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const script = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!script) throw new Error('AI returned empty content');
  return script;
}

export async function POST(req: Request) {
  let body: { text?: unknown; targetLang?: unknown; voice?: unknown } | null = null;

  try {
    body = await req.json();
    const { text, targetLang = 'tr', voice = 'female' } = body;

    if (!API_KEY) {
      console.error('GEMINI_API_KEY missing from environment');
      return jsonResponse(isValidText(text) ? text : '', 'API key not configured');
    }

    if (!isValidText(text)) {
      return jsonResponse('', 'No article text');
    }

    if (!isValidTargetLang(targetLang)) {
      return jsonResponse(text, 'Unsupported language');
    }

    if (!isValidVoice(voice)) {
      return jsonResponse(text, 'Unsupported voice');
    }

    if (isTextTooLong(text)) {
      return jsonResponse(text, 'Text too long for audio script');
    }

    pruneExpiredCacheEntries();

    const cacheKey = getCacheKey(text, targetLang, voice);
    const cachedScript = getCachedScript(cacheKey);

    if (cachedScript) {
      return jsonResponse(cachedScript);
    }

    const langNames: Record<string, string> = {
      tr: 'Turkish',
      en: 'English',
      de: 'German',
      ru: 'Russian',
    };

    let script: string | undefined;
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro'];

    for (const model of models) {
      try {
        script = await callGeminiAPI(text, langNames[targetLang], voice, model);
        if (script) break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Audio model ${model} failed:`, message);
      }
    }

    if (script) {
      setCachedScript(cacheKey, script);
    }

    return jsonResponse(script || text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Audio script error:', message);
    return jsonResponse(isValidText(body?.text) ? body.text : '', 'Audio generation failed');
  }
}
