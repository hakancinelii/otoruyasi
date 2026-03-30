import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Text and targetLang are required." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not set." }, { status: 500 });
    }

    const langNames: Record<string, string> = {
      tr: "Turkish",
      en: "English",
      ru: "Russian",
      de: "German"
    };

    const target = langNames[targetLang] || targetLang;

    const prompt = `
      Translate the following HTML/Text content into ${target}. 
      Keep all HTML tags exactly as they are. 
      Do not change brand names like "Oto Rüyası". 
      Provide only the translated content.
      
      Content to translate:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation Error:", error);
    return NextResponse.json({ error: "Translation failed." }, { status: 500 });
  }
}
