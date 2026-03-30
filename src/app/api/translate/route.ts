import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// We prioritize the environment variable from Vercel dash.
// If missing, we fallback to the user's provided key.
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
    const { text, targetLang } = body;

    // Safety checks
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

    // Using a more standard model string and error catching
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a professional automotive translator for Oto Rüyası magazine.
      Translate the following into ${target}. 
      Return ONLY the translation. Keep HTML tags.
      CONTENT:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Critical Error:", error.message || error);
    
    // If the error contains '404', maybe retry with just 'gemini-pro' as a last resort
    // but for now, we fallback to original text to keep site functional
    return NextResponse.json({ 
      translatedText: body?.text || "",
      error: error.message
    });
  }
}
