import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Fallback to avoid crash if env is missing
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Text and targetLang are required." }, { status: 400 });
    }

    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
      return NextResponse.json({ error: "Gemini API key is not set. Please add GEMINI_API_KEY to your Vercel Environment Variables." }, { status: 500 });
    }

    const langNames: Record<string, string> = {
      tr: "Turkish",
      en: "English",
      ru: "Russian",
      de: "German"
    };

    const target = langNames[targetLang as keyof typeof langNames] || targetLang;

    const prompt = `
      You are a professional translator for an automotive magazine.
      Translate the following content into ${target}. 
      
      STRICT RULES:
      1. Keep all HTML tags exactly as they are. 
      2. Do not change brand names like "Oto Rüyası", "OSD", "TEB", or car model names.
      3. Use the exactly same labels/tags (e.g. TITLE:, CONTENT:, [ITEM-0]) provided in the input.
      4. Provide ONLY the translated text, no introductions, no explanations, no markdown code blocks.
      
      CONTENT TO TRANSLATE:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    if (!translatedText) {
       throw new Error("AI returned empty response");
    }

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Translation API Error:", error.message || error);
    return NextResponse.json({ error: error.message || "Translation failed." }, { status: 500 });
  }
}
