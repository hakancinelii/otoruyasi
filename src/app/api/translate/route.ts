import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = "AIzaSyAxg5oVFAlO1EoKmsZqnrv46zXeIOvqlTI";
const genAI = new GoogleGenerativeAI(API_KEY);
// Switching to 'gemini-pro' for better stability and to avoid 404 on some accounts
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    const prompt = `
      Translate the following automotive text into ${target}. 
      Only return translated text. Do not add any explanation. 
      Keep HTML tags and brand names same.
      TEXT: ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Gemini Error:", error.message || error);
    return NextResponse.json({ translatedText: body?.text || "" });
  }
}
