import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

async function callExperienceAI(car1: string, car2: string, lang: string, model: string) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

  const langNames: Record<string, string> = {
    en: "English",
    ru: "Russian",
    de: "German",
    tr: "Turkish"
  };
  const target = langNames[lang] || "Turkish";

  const prompt = `
    Sen OTO RÜYASI Dijital Dergi'nin baş editörü ve profesyonel bir otomobil testi uzmanısın. 
    Şu iki aracı Türkiye pazarı dinamiklerini (ikinci el değeri, motor/yakıt seçenekleri, servis yaygınlığı) 
    göz önüne alarak profesyonelce karşılaştır: "${car1}" ve "${car2}".
    
    YAZI DİLİ: Lütfen tüm yanıtı ${target} dilinde oluştur.

    Bana aşağıdaki JSON formatında bir yanıt dön. Lütfen sadece geçerli bir JSON dön:

    {
      "car1": {
        "score": 0.0,
        "points": ["Artı/Eksi Madde 1", "Madde 2", "Madde 3", "Madde 4"]
      },
      "car2": {
        "score": 0.0,
        "points": ["Artı/Eksi Madde 1", "Madde 2", "Madde 3", "Madde 4"]
      },
      "analysis": "Buraya her iki aracı detaylıca kıyaslayan, yaklaşık 250 kelimelik, sürüş kalitesi, Türkiye pazarındaki durumu ve hangi kullanıcı kitlesine hangisinin uygun olduğunu anlatan akıcı ve uzman bir dil ile yazılmış analiz metni."
    }

    Puanlar 1-10 arasında olsun. Unutma, sen bir otomobil tutkunusun ve tarafsızsın. Tüm JSON içerisindeki metinler ${target} dilinde olmalıdır.
  `;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  
  if (!text) throw new Error("AI returned empty content");
  return JSON.parse(text);
}

export async function POST(req: Request) {
  try {
    const { car1, car2, targetLang = 'tr' } = await req.json();

    if (!car1 || !car2) {
      return NextResponse.json({ error: "İki araç da belirtilmeli." }, { status: 400 });
    }

    if (!API_KEY) {
       return NextResponse.json({ error: "Gemini API anahtarı ayarlanmamış." }, { status: 500 });
    }

    const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
    let result: any = null;

    for (const modelName of models) {
      try {
        result = await callExperienceAI(car1, car2, targetLang, modelName);
        if (result) break;
      } catch (e: any) {
        console.warn(`Comparison failed with model ${modelName}:`, e.message);
      }
    }

    if (!result) {
      throw new Error("Tüm yapay zeka modelleri başarısız oldu.");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Comparison API Error:", error.message || error);
    return NextResponse.json({ error: "Yapay zeka şu an meşgul, lütfen az sonra tekrar deneyiniz." }, { status: 500 });
  }
}
