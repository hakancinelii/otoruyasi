'use client';

import { useState } from 'react';
import Link from 'next/link';

// Popüler Türkiye Pazarı Araç Veritabanı
const CAR_DATABASE: Record<string, string[]> = {
  'Peugeot': ['208', '308', '2008', '3008', '408', '5008'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail'],
  'Toyota': ['Corolla', 'Yaris', 'C-HR', 'RAV4', 'Hilux'],
  'Renault': ['Clio', 'Megane', 'Taliant', 'Captur', 'Austral', 'Duster'],
  'Fiat': ['Egea', 'Egea Cross', '500', 'Panda'],
  'Hyundai': ['i10', 'i20', 'Bayon', 'Tucson', 'Kona'],
  'Honda': ['City', 'Civic', 'HR-V', 'CR-V'],
  'Chery': ['OMODA 5', 'Tiggo 7 Pro', 'Tiggo 8 Pro'],
  'Togg': ['T10X'],
  'Volkswagen': ['Polo', 'Golf', 'Taigo', 'T-Roc', 'Tiguan', 'Passat'],
  'Skoda': ['Fabia', 'Scala', 'Octavia', 'Kamiq', 'Karoq', 'Kodiaq'],
  'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga'],
  'Opel': ['Corsa', 'Astra', 'Crossland', 'Mokka', 'Grandland'],
};

interface CompareResult {
  car1: {
    score: number;
    points: string[];
  };
  car2: {
    score: number;
    points: string[];
  };
  analysis: string;
}

export default function KarsilastirmaPage() {
  const [car1Brand, setCar1Brand] = useState('');
  const [car1Model, setCar1Model] = useState('');
  const [car2Brand, setCar2Brand] = useState('');
  const [car2Model, setCar2Model] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompareResult | null>(null);

  const startComparison = async () => {
    if (!car1Brand || !car1Model || !car2Brand || !car2Model) {
      alert("Lütfen karşılaştırmak için iki aracı da tam olarak seçin.");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car1: `${car1Brand} ${car1Model}`,
          car2: `${car2Brand} ${car2Model}`
        })
      });

      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Yapay zeka yanıtı alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="hero-badge" style={{ background: '#E11D48', color: '#fff' }}>Yapay Zeka Destekli</span>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>Akıllı Araç Karşılaştırma</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Oto Rüyası veritabanı ve Yapay Zeka (AI) analizleriyle, iki aracı saniyeler içinde bütün detaylarıyla yüzleştir!
        </p>
      </div>

      {/* Seçim Ekranı */}
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {/* ARAÇ 1 */}
            <div style={{ flex: '1', minWidth: '300px', padding: '20px', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 15px', color: 'var(--accent-color)', textAlign: 'center' }}>1. Araç</h3>
              
              <select 
                value={car1Brand} 
                onChange={(e) => { setCar1Brand(e.target.value); setCar1Model(''); }}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px' }}
              >
                <option value="">Marka Seçin</option>
                {Object.keys(CAR_DATABASE).map(brand => <option key={`1-${brand}`} value={brand}>{brand}</option>)}
              </select>

              <select 
                value={car1Model} 
                onChange={(e) => setCar1Model(e.target.value)}
                disabled={!car1Brand}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px', opacity: !car1Brand ? 0.5 : 1 }}
              >
                <option value="">Model Seçin</option>
                {car1Brand && CAR_DATABASE[car1Brand].map(model => <option key={`1-${model}`} value={model}>{model}</option>)}
              </select>
            </div>

            {/* VS Ortası */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '20px', boxShadow: '0 0 20px rgba(252, 163, 17, 0.4)' }}>
                VS
              </div>
            </div>

            {/* ARAÇ 2 */}
            <div style={{ flex: '1', minWidth: '300px', padding: '20px', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 15px', color: 'var(--accent-color)', textAlign: 'center' }}>2. Araç</h3>
              
              <select 
                value={car2Brand} 
                onChange={(e) => { setCar2Brand(e.target.value); setCar2Model(''); }}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px' }}
              >
                <option value="">Marka Seçin</option>
                {Object.keys(CAR_DATABASE).map(brand => <option key={`2-${brand}`} value={brand}>{brand}</option>)}
              </select>

              <select 
                value={car2Model} 
                onChange={(e) => setCar2Model(e.target.value)}
                disabled={!car2Brand}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px', opacity: !car2Brand ? 0.5 : 1 }}
              >
                <option value="">Model Seçin</option>
                {car2Brand && CAR_DATABASE[car2Brand].map(model => <option key={`2-${model}`} value={model}>{model}</option>)}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={startComparison}
              disabled={isLoading || !car1Model || !car2Model}
              style={{ padding: '16px 40px', fontSize: '18px', width: '100%', maxWidth: '400px', opacity: (isLoading || !car1Model || !car2Model) ? 0.6 : 1, cursor: (isLoading || !car1Model || !car2Model) ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Yapay Zeka Analiz Ediyor...' : 'Kıyasıya Karşılaştır!'}
            </button>
          </div>

        </div>
      </div>

      {/* SONUÇ ALANI */}
      {results && (
        <div style={{ marginTop: '60px', transition: 'all 0.3s' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Yapay Zeka Analiz Sonucu</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
            <div className="card" style={{ flex: '1', minWidth: '300px', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 10px' }}>{car1Brand} {car1Model}</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-color)' }}>{results.car1.score}<span style={{ fontSize: '16px', color: 'var(--text-muted)'}}>/10</span></div>
              <p style={{ color: 'var(--text-muted)' }}>AI Puanı</p>
              
              <ul style={{ textAlign: 'left', marginTop: '20px', paddingLeft: '20px', listStyle: 'none' }}>
                {results.car1.points.map((p: string, i: number) => <li key={i} style={{ marginBottom: '8px' }}>• {p}</li>)}
              </ul>
            </div>
            
            <div className="card" style={{ flex: '1', minWidth: '300px', padding: '30px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 10px' }}>{car2Brand} {car2Model}</h3>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-color)' }}>{results.car2.score}<span style={{ fontSize: '16px', color: 'var(--text-muted)'}}>/10</span></div>
              <p style={{ color: 'var(--text-muted)' }}>AI Puanı</p>
              
              <ul style={{ textAlign: 'left', marginTop: '20px', paddingLeft: '20px', listStyle: 'none' }}>
                {results.car2.points.map((p: string, i: number) => <li key={i} style={{ marginBottom: '8px' }}>• {p}</li>)}
              </ul>
            </div>
          </div>
          
          {/* AI Uzman Yorumu */}
          <div className="card" style={{ marginTop: '30px', padding: '30px', textAlign: 'left', maxWidth: '920px', margin: '30px auto 0', border: '1px solid var(--accent-color)' }}>
              <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⚡ Yapay Zeka Uzman Görüşü
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-color)' }}>
                {results.analysis}
              </p>
          </div>
        </div>
      )}
    </main>
  );
}
