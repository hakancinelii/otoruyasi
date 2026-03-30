import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Now reading from the Vercel Environment Variable we just added via CLI.
// Fallback key is still here for local safety.
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

    // We can specify the API version or better model string if needed.
    // Pro is generally more available than Flash for some regional keys.
    const model = genAI.getGenerativeModel({ 
       model: "gemini-pro"
    });

    const prompt = `Translate the following car news content into ${target}. 
    Keep HTML tags. Brand name "Oto Rüyası" must remain same. 
    Only return translated text.
    CONTENT:
    ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Critical Gemini/Vercel Error:", error.message || error);
    
    // In case of 404 on Pro, we silently return the original text so site doesn't break
    return NextResponse.json({ 
       translatedText: body?.text || "",
       error: error.message
    });
  }
}
