'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

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
  'Cupra': ['Formentor', 'Leon', 'Born'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'BMW': ['1 Serisi', '2 Serisi', '3 Serisi', '5 Serisi', 'X1', 'X3', 'X5'],
  'Mercedes-Benz': ['A-Serisi', 'C-Serisi', 'E-Serisi', 'GLA', 'GLC', 'GLE'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
  'Volvo': ['S60', 'S90', 'XC40', 'XC60', 'XC90'],
  'MG': ['ZS', 'HS', 'MG4', 'Marvel R'],
  'BYD': ['Atto 3', 'Seal', 'Dolphin'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X']
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
  const { language, t } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompareResult | null>(null);

  const startComparison = async () => {
    if (!car1Brand || !car1Model || !car2Brand || !car2Model) {
      alert(language === 'tr' ? "Lütfen iki aracı da seçin." : "Please select both vehicles.");
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
          car2: `${car2Brand} ${car2Model}`,
          targetLang: language
        })
      });

      if (!response.ok) throw new Error("API hatası");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert(t('no_content'));
    } finally {
      setIsLoading(false);
    }
  };

  // Dil değiştiğinde eğer sonuç varsa tekrar karşılaştırmak daha sağlıklı (çünkü çeviri doğrudan AI'dan geliyor artık)
  useEffect(() => {
    if (results && (car1Model && car2Model)) {
      startComparison();
    }
  }, [language]);

  return (
    <main className="container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="hero-badge" style={{ background: '#E11D48', color: '#fff' }}>{t('ai_powered')}</span>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>{t('smart_compare_title')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          {t('smart_compare_desc')}
        </p>
      </div>

      {/* Seçim Ekranı */}
      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px, 5vw, 40px)', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
            {/* ARAÇ 1 */}
            <div style={{ padding: '24px', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ margin: '0 0 15px', color: 'var(--accent-color)', textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>1. {language === 'tr' ? 'Araç' : 'Vehicle'}</h3>
              
              <select 
                value={car1Brand} 
                onChange={(e) => { setCar1Brand(e.target.value); setCar1Model(''); }}
                style={{ width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px', outline: 'none' }}
              >
                <option value="">{t('select_brand')}</option>
                {Object.keys(CAR_DATABASE).sort().map(brand => <option key={`1-${brand}`} value={brand}>{brand}</option>)}
              </select>

              <select 
                value={car1Model} 
                onChange={(e) => setCar1Model(e.target.value)}
                disabled={!car1Brand}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px', outline: 'none', opacity: !car1Brand ? 0.5 : 1 }}
              >
                <option value="">{t('select_model')}</option>
                {car1Brand && CAR_DATABASE[car1Brand].map(model => <option key={`1-${model}`} value={model}>{model}</option>)}
              </select>
            </div>

            {/* VS Ortası */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#000', fontSize: '24px', boxShadow: '0 0 30px rgba(252, 163, 17, 0.5)', zIndex: 2 }}>
                VS
              </div>
            </div>

            {/* ARAÇ 2 */}
            <div style={{ padding: '24px', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ margin: '0 0 15px', color: 'var(--accent-color)', textAlign: 'center', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. {language === 'tr' ? 'Araç' : 'Vehicle'}</h3>
              
              <select 
                value={car2Brand} 
                onChange={(e) => { setCar2Brand(e.target.value); setCar2Model(''); }}
                style={{ width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px', outline: 'none' }}
              >
                <option value="">{t('select_brand')}</option>
                {Object.keys(CAR_DATABASE).sort().map(brand => <option key={`2-${brand}`} value={brand}>{brand}</option>)}
              </select>

              <select 
                value={car2Model} 
                onChange={(e) => setCar2Model(e.target.value)}
                disabled={!car2Brand}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '16px', outline: 'none', opacity: !car2Brand ? 0.5 : 1 }}
              >
                <option value="">{t('select_model')}</option>
                {car2Brand && CAR_DATABASE[car2Brand].map(model => <option key={`2-${model}`} value={model}>{model}</option>)}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={startComparison}
              disabled={isLoading || !car1Model || !car2Model}
              style={{ padding: '18px 40px', fontSize: '18px', width: '100%', maxWidth: '400px', opacity: (isLoading || !car1Model || !car2Model) ? 0.6 : 1, cursor: (isLoading || !car1Model || !car2Model) ? 'not-allowed' : 'pointer', fontWeight: '800' }}
            >
              {isLoading ? (
                 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div className="spinner-mini"></div> {t('ai_is_analyzing')}
                 </span>
              ) : t('compare_btn')}
            </button>
          </div>

        </div>
      </div>

      {/* SONUÇ ALANI */}
      {results && (
        <div style={{ marginTop: '60px', animation: 'fadeIn 0.6s ease' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '32px', fontWeight: 800 }}>{t('ai_result_title')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
            
            <div className="card" style={{ flex: '1', minWidth: '320px', padding: '40px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '14px', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>1. {language === 'tr' ? 'Seçenek' : 'Choice'}</div>
              <h3 style={{ fontSize: '28px', margin: '0 0 15px', fontWeight: 800 }}>{car1Brand} {car1Model}</h3>
              <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text-color)', marginBottom: '5px' }}>{results.car1.score}<span style={{ fontSize: '20px', color: 'var(--text-muted)'}}>/10</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('ai_score')}</p>
              
              <ul style={{ textAlign: 'left', marginTop: '30px', paddingLeft: '0', listStyle: 'none' }}>
                {results.car1.points.map((p: string, i: number) => (
                   <li key={i} style={{ marginBottom: '12px', display: 'flex', gap: '10px', fontSize: '15px', lineHeight: '1.4' }}>
                      <span style={{ color: p.includes('+') || !p.includes('-') ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>•</span> 
                      {p}
                   </li>
                ))}
              </ul>
            </div>
            
            <div className="card" style={{ flex: '1', minWidth: '320px', padding: '40px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '14px', color: 'var(--accent-color)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>2. {language === 'tr' ? 'Seçenek' : 'Choice'}</div>
              <h3 style={{ fontSize: '28px', margin: '0 0 15px', fontWeight: 800 }}>{car2Brand} {car2Model}</h3>
              <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text-color)', marginBottom: '5px' }}>{results.car2.score}<span style={{ fontSize: '20px', color: 'var(--text-muted)'}}>/10</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('ai_score')}</p>
              
              <ul style={{ textAlign: 'left', marginTop: '30px', paddingLeft: '0', listStyle: 'none' }}>
                {results.car2.points.map((p: string, i: number) => (
                   <li key={i} style={{ marginBottom: '12px', display: 'flex', gap: '10px', fontSize: '15px', lineHeight: '1.4' }}>
                      <span style={{ color: p.includes('+') || !p.includes('-') ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>•</span> 
                      {p}
                   </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* AI Uzman Yorumu */}
          <div className="card" style={{ marginTop: '40px', padding: '40px', textAlign: 'left', maxWidth: '1000px', margin: '40px auto 0', border: '2px solid var(--accent-color)', background: 'rgba(252, 163, 17, 0.03)', borderRadius: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚡</div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
                  {t('ai_vision')}
                </h3>
              </div>
              <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--text-color)' }}>
                {results.analysis}
              </p>
              <div style={{ marginTop: '30px', padding: '15px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                 {language === 'tr' ? 'Bu analiz OTO RÜYASI AI tarafından en güncel veriler ışığında üretilmiştir.' : 'This analysis was generated by OTO RÜYASI AI with the latest data.'}
              </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .spinner-mini {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0,0,0,0.1);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
