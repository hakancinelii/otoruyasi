'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{ background: '#111315', padding: '60px 0', marginTop: '60px', borderTop: '1px solid var(--border-color)' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px' }}>
        <div style={{ maxWidth: '300px' }}>
          <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '20px', fontWeight: 800 }}>OTO RÜYASI</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {t('home') === 'Ana Sayfa' ? "Türkiye'nin lider otomobil platformu. Sektörün nabzını tutan test sürüşleri, haberler ve dijital dergi." : "Turkey's leading automobile platform. Test drives, news and digital magazine that keep the pulse of the industry."}
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px' }}>{t('categories')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="/kategori/5" style={{ color: 'inherit', textDecoration: 'none' }}>Oto Test</Link></li>
              <li><Link href="/kategori/16714" style={{ color: 'inherit', textDecoration: 'none' }}>Elektrikli Araçlar</Link></li>
              <li><Link href="/kategori/5801" style={{ color: 'inherit', textDecoration: 'none' }}>Kampanyalar</Link></li>
              <li><Link href="/kategori/7" style={{ color: 'inherit', textDecoration: 'none' }}>Otomobil Fiyatları</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px' }}>{t('quick_links')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{t('contact')}</Link></li>
              <li><Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{t('privacy')}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid var(--border-color)', marginTop: '40px', paddingTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        &copy; {new Date().getFullYear()} Oto Rüyası Dijital Yayıncılık. {t('all_rights_reserved')}
      </div>
    </footer>
  );
}
