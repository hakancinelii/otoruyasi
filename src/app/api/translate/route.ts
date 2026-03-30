import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Text and targetLang required" }, { status: 400 });
    }

    if (targetLang === 'tr') {
       return NextResponse.json({ translatedText: text });
    }

    // No-Key MyMemory API (Limit of around 500-1000 characters per call for anon)
    const plainText = text.replace(/<[^>]+>/g, ' ').substring(0, 1000); 

    const langPairs: Record<string, string> = {
      en: 'tr|en',
      ru: 'tr|ru',
      de: 'tr|de'
    };

    const langPair = langPairs[targetLang as keyof typeof langPairs] || 'tr|en';

    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(plainText)}&langpair=${langPair}`;
    
    const res = await fetch(myMemoryUrl);
    const data = await res.json();

    const translatedText = data.responseData?.translatedText || text;

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("No-Key Translation Error:", error);
    return NextResponse.json({ translatedText: text }); // Fallback to original
  }
}
