'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../globals.css';

export default function Abonelik() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribeClick = (plan: string) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Creem API Simülasyonu
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <main className="container" style={{ padding: '80px 20px', textAlign: 'center', position: 'relative' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', background: 'linear-gradient(90deg, var(--text-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Otomobil Tutkusunu Bir Üst Seviyeye Taşıyın.</h1>

      {!isSuccess ? (
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 60px' }}>
          Sektörün nabzını tutan özel incelemeler, VIP test sürüşleri ve aylık e-dergiye reklamsız bir şekilde sonsuz erişim.
        </p>
      ) : (
        <div style={{ padding: '40px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', borderRadius: '16px', maxWidth: '600px', margin: '0 auto 60px' }}>
          <h2 style={{ color: '#2ecc71', fontSize: '28px', marginBottom: '16px' }}>Tebrikler, Hoş Geldiniz!</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-color)' }}>Creem ödemeniz başarıyla alındı. Artık bir "OTO RÜYASI {selectedPlan}" üyesisiniz. Yönlendiriliyorsunuz...</p>
          <div style={{ marginTop: '24px' }}>
            <Link href="/" className="btn-primary" style={{ background: '#2ecc71', color: '#fff' }}>Haberleri Okumaya Başla</Link>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div style={{ display: isSuccess ? 'none' : 'flex', justifyItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>

        {/* Aylık Plan */}
        <div className="card" style={{ width: '350px', padding: '40px', borderRadius: '24px', position: 'relative' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--text-muted)', marginBottom: '10px' }}>Aylık Dijital</h2>
          <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-color)' }}>99₺<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/ay</span></div>
          <p style={{ color: 'var(--text-muted)', margin: '20px 0', minHeight: '60px' }}>Esnek abonelik, her an iptal edilebilir e-dergi erişimi.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', textAlign: 'left', lineHeight: '2.5' }}>
            <li>✓ Sınırsız Haber Okuma</li><li>✓ 0 Reklam Görüntüleme</li><li>✓ Aylık PDF Dergi İndirme</li>
          </ul>
          <button onClick={() => handleSubscribeClick('Aylık Dijital')} className="btn-primary" style={{ width: '100%', padding: '16px', background: '#30363d', color: '#fff' }}>Aylık Abone Ol</button>
        </div>

        {/* Yıllık Plan */}
        <div className="card" style={{ width: '350px', padding: '40px', borderRadius: '24px', borderColor: 'var(--accent-color)', zIndex: 1, position: 'relative', boxShadow: '0 20px 50px rgba(252,163,17,0.15)', transform: 'scale(1.05)' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '50px', background: 'var(--accent-color)', color: '#000', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>EN ÇOK TERCİH EDİLEN</div>
          <h2 style={{ fontSize: '24px', color: 'var(--accent-color)', marginBottom: '10px' }}>VIP Yıllık</h2>
          <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-color)' }}>890₺<span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/yıl</span></div>
          <p style={{ color: 'var(--text-muted)', margin: '20px 0', minHeight: '60px' }}>2 ay bizden hediye. Gerçek bir otomobil tutkunu için nihai ve prestijli paket.</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', textAlign: 'left', lineHeight: '2.5' }}>
            <li style={{ color: 'var(--text-color)' }}>✓ Sınırsız Haber & Arşiv Erişimi</li><li style={{ color: 'var(--text-color)' }}>✓ 0 Reklam Kesintisi</li><li style={{ color: 'var(--text-color)' }}>✓ VIP Lansman Duyuruları</li><li style={{ color: 'var(--text-color)' }}>✓ OTO RÜYASI Club Avantajları</li>
          </ul>
          <button onClick={() => handleSubscribeClick('VIP Yıllık')} className="btn-primary" style={{ width: '100%', padding: '16px', background: 'linear-gradient(45deg, var(--accent-color), #ff5722)', color: '#fff', fontSize: '16px' }}>Yıllık Abone Ol</button>
        </div>
      </div>

      <p style={{ marginTop: '80px', color: 'var(--text-muted)', fontSize: '14px', display: isSuccess ? 'none' : 'block' }}>
        Ödemeler 256-bit SSL ve Creem güvencesi altındadır. Kredi kartı tahsilatlarında banka prosedürleri geçerlidir. <br />
        <a href="#" style={{ textDecoration: 'underline' }}>Kurumsal (Şirket) Üyelikleri İçin İletişime Geçin</a>
      </p>

      {/* Creem Checkout Modal Overlay Mockup */}
      {showCheckout && !isSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%', maxWidth: '450px', padding: '40px', position: 'relative' }}>
            <button onClick={() => setShowCheckout(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '24px' }}>Creem Güvenli Ödeme</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>{selectedPlan} paketi abonelik ödemesi.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Kart Numarası</label>
                <input type="text" placeholder="5555 4444 3333 2222" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0d1117', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>SKT</label>
                  <input type="text" placeholder="12/28" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0d1117', border: '1px solid var(--border-color)', color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>CVC</label>
                  <input type="text" placeholder="999" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#0d1117', border: '1px solid var(--border-color)', color: '#fff' }} />
                </div>
              </div>

              <button onClick={handlePayment} disabled={isProcessing} style={{ width: '100%', padding: '16px', background: 'var(--accent-color)', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 800, marginTop: '16px', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                {isProcessing ? 'Ödeme İşleniyor...' : `Güvenli Olarak Öde (${selectedPlan === 'VIP Yıllık' ? '890₺' : '99₺'})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
