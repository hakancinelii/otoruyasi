'use client';

import { useLanguage } from '../../context/LanguageContext';

export default function CollaborationPage() {
  const { t, language } = useLanguage();

  return (
    <main className="container" style={{ paddingTop: '60px', paddingBottom: '100px' }}>
      <header style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px' }}>
          🤝 {language === 'tr' ? 'İş Birliği & Reklam' : 'Collaboration & Advertising'}
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          {language === 'tr' 
            ? 'Oto Rüyası portalı ile otomobil tutkunlarına direkt ulaşın. Dijital dünyadaki prestijli yüzünüz olalım.'
            : 'Reach car enthusiasts directly through the Oto Rüyası portal. Let us be your prestigious face in the digital world.'}
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '80px' }}>
        {/* Ad Option 1 */}
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>📉</div>
          <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>{language === 'tr' ? 'Banner Reklamları' : 'Banner Advertising'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            {language === 'tr'
              ? 'Ana sayfa ve haber detay sayfalarında stratejik konumlarda yer alarak markanızı binlerce kişiye tanıtın.'
              : 'Promote your brand to thousands of people with strategic placements on the home and news pages.'}
          </p>
        </div>

        {/* Ad Option 2 */}
        <div className="card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--accent-color)' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🏎️</div>
          <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>{language === 'tr' ? 'İçerik Pazarlama' : 'Content Marketing'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            {language === 'tr'
              ? 'Markanıza özel hazırlanan inceleme videoları ve sponsorlu haberlerle hedef kitlenize güven verin.'
              : 'Build trust with your target audience through custom review videos and sponsored news articles.'}
          </p>
        </div>

        {/* Ad Option 3 */}
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>📈</div>
          <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>{language === 'tr' ? 'Dijital Dergi Sponsorluğu' : 'Digital Mag Sponsorship'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            {language === 'tr'
              ? 'Aylık dijital dergimizin kapak sponsoru olun veya özel sayılarda yerinizi ayırtın.'
              : 'Be the cover sponsor for our monthly digital magazine or reserve your spot in special editions.'}
          </p>
        </div>
      </div>

      <section style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '60px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>{language === 'tr' ? 'Hemen Bizimle İletişime Geçin' : 'Contact Us Today'}</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px' }}>Email</p>
            <a href="mailto:otoruyasi@gmail.com" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-color)' }}>otoruyasi@gmail.com</a>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px' }}>{language === 'tr' ? 'Telefon' : 'Phone'}</p>
            <p style={{ fontSize: '20px', fontWeight: 700 }}>+90 505 476 15 31</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textTransform: 'uppercase', marginBottom: '10px' }}>{language === 'tr' ? 'Adres' : 'Address'}</p>
            <p style={{ fontSize: '18px', fontWeight: 700, maxWidth: '300px', margin: '0 auto' }}>Zafer Mah. Fuzuli sok. No;9/14 Yenibosna/İstanbul</p>
          </div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <a href="mailto:isbirligi@otoruyasi.com" className="btn-primary" style={{ padding: '15px 50px', fontSize: '18px' }}>
            {language === 'tr' ? 'Teklif Alın' : 'Request Proposal'}
          </a>
        </div>
      </section>
    </main>
  );
}
