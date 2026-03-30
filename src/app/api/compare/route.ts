import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { car1, car2 } = await req.json();

    if (!car1 || !car2) {
      return NextResponse.json({ error: "İki araç da belirtilmeli." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json({ error: "Gemini API anahtarı ayarlanmamış." }, { status: 500 });
    }

    const prompt = `
      Sen bir profesyonel otomobil testi uzmanısın. Şu iki aracı karşılaştır: "${car1}" ve "${car2}".
      Bana aşağıdaki formatta bir JSON yanıt dön:

      {
        "car1": {
          "score": 0.0,
          "points": ["Artı/Eksi Madde 1", "Madde 2", "Madde 3"]
        },
        "car2": {
          "score": 0.0,
          "points": ["Artı/Eksi Madde 1", "Madde 2", "Madde 3"]
        },
        "analysis": "Buraya her iki aracı detaylıca kıyaslayan, yaklaşık 200 kelimelik, sürüş kalitesi, Türkiye pazarındaki ikinci el değeri, yakıt ekonomisi ve teknolojik özelliklerini içeren akıcı bir inceleme metni yaz."
      }

      Puanlar 1-10 arasında olsun. Yanıt kesinlikle sadece JSON formatında olsun.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Temizleme: bazen Gemini yanıtı ```json ... ``` içinde döner.
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Yapay zeka yanıt veremedi." }, { status: 500 });
  }
}
