'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../globals.css';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Abonelik() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribeClick = (plan: string) => {
    if (!user) {
      router.push('/giris');
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: selectedPlan,
          userId: user.user_email, // Veya gerçek bir WP User ID
          email: user.user_email 
        })
      });

      const data = await response.json();

      if (data.success) {
        // Creem'e yönlendirme yapabiliriz veya modalı kapatıp başarılı diyebiliriz
        // Bu demo/başlangıç için simüle ediyoruz ama API tetiklenmiş oldu
        setTimeout(() => {
          setIsProcessing(false);
          setIsSuccess(true);
          // Gerçekte burada premium statüsü veritabanında güncellenmeli
        }, 2000);
      } else {
        alert(language === 'tr' ? 'Ödeme başlatılamadı: ' + data.error : 'Payment failed: ' + data.error);
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('Payment Error:', e);
      setIsProcessing(false);
      alert(language === 'tr' ? 'Sistem hatası.' : 'System error.');
    }
  };

  return (
    <main className="container" style={{ padding: '80px 20px', textAlign: 'center', position: 'relative' }}>
      
      {!isSuccess ? (
        <>
          <h1 style={{ fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 800, marginBottom: '20px', background: 'linear-gradient(90deg, var(--text-color), var(--accent-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            {t('subscription_title')}
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 60px', lineHeight: 1.6 }}>
            {t('subscription_desc')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Monthly Plan */}
            <div className="card" style={{ width: '100%', maxWidth: '380px', padding: '48px 40px', borderRadius: '28px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', transition: 'transform 0.3s' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('monthly_plan')}</h2>
              <div style={{ fontSize: '56px', fontWeight: 900, color: 'var(--text-color)', marginBottom: '20px' }}>99₺<span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text-muted)' }}>/{language === 'tr' ? 'ay' : 'mo'}</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', textAlign: 'left', lineHeight: '2.8', fontSize: '15px' }}>
                <li>✨ {language === 'tr' ? 'Sınırsız Haber Okuma' : 'Unlimited News Reading'}</li>
                <li>✨ {language === 'tr' ? '0 Reklam Görüntüleme' : 'Ad-free Experience'}</li>
                <li>✨ {language === 'tr' ? 'Aylık PDF Dergi İndirme' : 'Monthly PDF Downloads'}</li>
                <li>✨ {language === 'tr' ? 'Özel Bülten Aboneliği' : 'Expert Newsletter'}</li>
              </ul>
              <button 
                onClick={() => handleSubscribeClick(t('monthly_plan'))} 
                className="btn-outline" 
                style={{ width: '100%', padding: '18px', borderRadius: '14px', fontWeight: 700, fontSize: '16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-color)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                {t('subscribe_now')}
              </button>
            </div>

            {/* Annual Plan (Featured) */}
            <div className="card annual-card" style={{ width: '100%', maxWidth: '400px', padding: '52px 40px', borderRadius: '32px', position: 'relative', border: '2px solid var(--accent-color)', background: 'rgba(252, 163, 17, 0.03)', boxShadow: '0 30px 60px rgba(252,163,17,0.15)', transform: 'translateY(-10px)' }}>
              <div style={{ position: 'absolute', top: '-18px', right: '50%', transform: 'translateX(50%)', background: 'var(--accent-color)', color: '#000', padding: '8px 24px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', boxShadow: '0 10px 20px rgba(252,163,17,0.3)' }}>{t('best_value')}</div>
              <h2 style={{ fontSize: '20px', color: 'var(--accent-color)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t('annual_plan')}</h2>
              <div style={{ fontSize: '64px', fontWeight: 900, color: 'var(--text-color)', marginBottom: '20px' }}>890₺<span style={{ fontSize: '22px', fontWeight: 500, color: 'var(--text-muted)' }}>/{language === 'tr' ? 'yıl' : 'yr'}</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', textAlign: 'left', lineHeight: '2.8', fontSize: '15px' }}>
                <li style={{ color: 'var(--text-color)', fontWeight: 600 }}>🔥 {language === 'tr' ? '2 Ay Ücretsiz!' : '2 Months Free!'}</li>
                <li>✅ {language === 'tr' ? 'Tüm Arşiv Erişimi' : 'Full Archive Access'}</li>
                <li>✅ {language === 'tr' ? 'VIP Lansman Duyuruları' : 'VIP Launch Alerts'}</li>
                <li>✅ {language === 'tr' ? 'OTO RÜYASI Club Avantajları' : 'OTO RÜYASI Club Perks'}</li>
                <li>✅ {language === 'tr' ? 'İmzalı Dijital Dergi Kopyası' : 'Special Digital Copy'}</li>
              </ul>
              <button 
                onClick={() => handleSubscribeClick(t('annual_plan'))} 
                className="btn-primary" 
                style={{ width: '100%', padding: '20px', borderRadius: '16px', color: '#000', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 15px 30px rgba(252,163,17,0.4)' }}
              >
                {t('subscribe_now')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ padding: '60px 40px', background: 'rgba(46, 204, 113, 0.05)', border: '1px solid #2ecc71', borderRadius: '30px', maxWidth: '650px', margin: '60px auto', animation: 'fadeIn 0.6s ease' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', boxShadow: '0 10px 20px rgba(46,204,113,0.3)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ color: '#2ecc71', fontSize: '36px', marginBottom: '16px', fontWeight: 800 }}>{t('congrats')}</h2>
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{t('success_desc')}</p>
          <div style={{ marginTop: '40px' }}>
            <Link href="/" className="btn-primary" style={{ padding: '18px 40px', background: '#2ecc71', color: '#fff', fontSize: '18px' }}>{t('home')}</Link>
          </div>
        </div>
      )}

      {/* Creem Checkout Modal Overlay */}
      {showCheckout && !isSuccess && (
        <div className="checkout-overlay">
          <div className="checkout-modal">
            <button onClick={() => setShowCheckout(false)} className="close-checkout">×</button>
            
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(252,163,17,0.1)', borderRadius: '20px', color: 'var(--accent-color)', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                 SECURE CHECKOUT BY CREEM
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 800 }}>{language === 'tr' ? 'Ödeme Bilgileri' : 'Payment Details'}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>{selectedPlan} • {selectedPlan === t('annual_plan') ? '890₺' : '99₺'}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label className="input-label">{language === 'tr' ? 'Kart Numarası' : 'Card Number'}</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="5555 4444 3333 2222" className="checkout-input" />
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="35" height="25" viewBox="0 0 500 314"><path d="M500 24C500 10.7 489.3 0 476 0H24C10.7 0 0 10.7 0 24V290C0 303.3 10.7 314 24 314H476C489.3 314 500 303.3 500 290V24Z" fill="#ff5f00"/><path d="M312 157C312 225.8 259 281.8 193.3 281.8C127.7 281.8 74.7 225.8 74.7 157C74.7 88.2 127.7 32.2 193.3 32.2C259 32.2 312 88.2 312 157Z" fill="#eb001b"/><path d="M425.3 157C425.3 225.8 372.3 281.8 306.7 281.8C241 281.8 188 225.8 188 157C188 88.2 241 32.2 306.7 32.2C372.3 32.2 425.3 88.2 425.3 157Z" fill="#f79e1b"/></svg>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="input-label">SKT</label>
                  <input type="text" placeholder="12 / 28" className="checkout-input" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="input-label">CVV</label>
                  <input type="text" placeholder="999" className="checkout-input" />
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-color)', marginTop: '10px' }}>
                 <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                   {language === 'tr' 
                     ? 'Ödemeniz Creem tarafından güvence altına alınır. Kart bilgileriniz sunucularımızda saklanmaz.' 
                     : 'Your payment is secured by Creem. Card details are not stored on our servers.'}
                 </p>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={isProcessing} 
                className={`checkout-submit ${isProcessing ? 'loading' : ''}`}
              >
                {isProcessing 
                  ? (language === 'tr' ? 'İşleminiz Yapılıyor...' : 'Processing...') 
                  : (language === 'tr' ? 'Ödemeyi Tamamla' : 'Complete Payment')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .checkout-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.4s ease;
        }
        .checkout-modal {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          width: 90%;
          max-width: 480px;
          padding: 48px;
          position: relative;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .close-checkout {
          position: absolute;
          top: 24px; right: 24px;
          background: none; border: none;
          color: var(--text-muted);
          font-size: 32px; cursor: pointer;
          transition: transform 0.2s;
        }
        .close-checkout:hover { transform: rotate(90deg); color: var(--accent-color); }
        .input-label { display: block; marginBottom: 8px; fontSize: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .checkout-input { width: 100%; padding: 16px; border-radius: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: #fff; font-size: 16px; transition: border-color 0.3s; }
        .checkout-input:focus { border-color: var(--accent-color); outline: none; background: rgba(0,0,0,0.3); }
        .checkout-submit {
          width: 100%; padding: 20px;
          background: var(--accent-color);
          color: #000; border: none;
          border-radius: 16px;
          font-weight: 800; font-size: 18px;
          margin-top: 10px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(252,163,17,0.3);
        }
        .checkout-submit:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(252,163,17,0.45); }
        .checkout-submit:active { transform: scale(0.98); }
        .checkout-submit.loading { background: #3c3c3c; color: #888; cursor: not-allowed; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </main>
  );
}
