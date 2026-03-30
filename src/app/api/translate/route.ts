import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Hardcoding user's key as requested for quick fix, 
// though environment variables are better for security.
const API_KEY = "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang || targetLang === 'tr') {
      return NextResponse.json({ translatedText: text });
    }

    const langNames: Record<string, string> = {
      en: "English",
      ru: "Russian",
      de: "German",
      tr: "Turkish"
    };

    const target = langNames[targetLang as keyof typeof langNames] || targetLang;

    const prompt = `
      You are a professional automotive translator. 
      Translate the following content into ${target}. 
      
      RULES:
      1. Keep all HTML tags exactly as they are.
      2. Do not change brand names like "Oto Rüyası", car models or company names like "OSD".
      3. Maintain the professional tone of a high-end digital magazine.
      4. Provide ONLY the translated result without any commentary or markdown blocks.
      
      CONTENT TO TRANSLATE:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    // Silent fallback to avoid ugly UI messages
    return NextResponse.json({ translatedText: text });
  }
}
