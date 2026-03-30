import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Using ONLY the environment variable for security and dashboard compliance.
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
    const { text, targetLang } = body;

    if (!API_KEY) {
      console.error("GEMINI_API_KEY is missing in Environment Variables!");
      return NextResponse.json({ translatedText: text || "" });
    }

    if (!text || !targetLang || targetLang === 'tr') {
      return NextResponse.json({ translatedText: text || "" });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    // Explicit model string for 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Translate to ${targetLang}: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Critical Error:", error.message || error);
    return NextResponse.json({ 
      translatedText: body?.text || "",
      error: error.message 
    });
  }
}
