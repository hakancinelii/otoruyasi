import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Using the key from the environment (added via CLI) or fallback
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";
const genAI = new GoogleGenerativeAI(API_KEY);

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

    // 1.5 Flash is the modern standard. Trying without 'models/' prefix as SDK does it.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Translate the following to ${target}. Return ONLY translation. HTML tags stay same. TEXT: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    // If result contains error (like 404), throw to catch block
    if (!translatedText || translatedText.includes("404 Not Found")) {
       throw new Error("Translation failed or model not found");
    }

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Final Retry Error:", error.message || error);
    // Silent fallback to original text to avoid site breakage
    return NextResponse.json({ 
       translatedText: body?.text || "",
       error: error.message
    });
  }
}
