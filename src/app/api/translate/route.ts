import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Hardcoding user's key for immediate stability
const API_KEY = "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      de: "German",
      tr: "Turkish"
    };

    const target = langNames[targetLang as keyof typeof langNames] || targetLang;

    // Direct translation prompt
    const prompt = `
      Translate the following automotive text into ${target}. 
      Keep HTML tags exactly. Brand names stay same. Only return translated text.
      TEXT: ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Translation API Error:", error.message || error);
    // Safe fallback using the body we captured
    return NextResponse.json({ translatedText: body?.text || "" });
  }
}
