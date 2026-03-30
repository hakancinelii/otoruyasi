import { NextResponse } from "next/server";

// Kayıt gerektirmeyen MyMemory API (Günlük anonim limitli)
// Metni her 800 karakterde bir bölerek uzun yazıları çevirir
async function translateFullText(text: string, langPair: string) {
  if (!text) return "";
  
  // Metni taglerden arındır (MyMemory HTML etiketlerini bazen bozabilir)
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Parçalara böl (Max 800 karakter)
  const chunks = cleanText.match(/.{1,800}(\s|$)/g) || [cleanText];
  let result = "";

  console.log(`Translate request: ${chunks.length} chunks for ${langPair}`);

  for (const chunk of chunks) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langPair}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      
      if (data.responseData?.translatedText) {
        result += data.responseData.translatedText + " ";
      } else {
        result += chunk + " ";
      }
      
      // Çok kısa bekleme (opsiyonel, API kısıtı için)
      if (chunks.length > 1) await new Promise(r => setTimeout(r, 100));
    } catch (e) {
      console.error("Chunk translation error:", e);
      result += chunk + " ";
    }
  }

  return result.trim();
}

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang || targetLang === 'tr') {
      return NextResponse.json({ translatedText: text });
    }

    const langPairs: Record<string, string> = {
      en: 'tr|en',
      ru: 'tr|ru',
      de: 'tr|de'
    };

    const langPair = langPairs[targetLang] || 'tr|en';

    // Uzun metinleri parçalayarak çevir (Hiçbir anahtar gerektirmez)
    const translatedText = await translateFullText(text, langPair);

    return NextResponse.json({ translatedText });
  } catch (error: any) {
    console.error("Main translation error:", error);
    return NextResponse.json({ translatedText: text });
  }
}
