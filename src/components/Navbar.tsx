'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Aşağı kayıyorsan ve başlık yüksekliğini geçtiysen gizle
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      }
      // Yukarı kayıyorsan (herhangi bir miktar) hemen göster
      else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const flags: Record<Language, string> = {
    tr: '🇹🇷',
    en: '🇬🇧',
    ru: '🇷🇺',
    de: '🇩🇪'
  };

  return (
    <header className={`header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="container nav-container">
        <div className="nav-left">
          <Link href="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="Oto Rüyası Logo"
              className="logo-img"
              style={{ maxHeight: '90px', padding: '5px' }}
            />
          </Link>
        </div>

        {/* Desktop & Mobile Navigation */}
        <nav className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-only" style={{ marginBottom: '20px', width: '100%' }}>
            <SearchBar />
          </div>
          <Link href="/" className="nav-link" onClick={() => setIsOpen(false)}>{t('home')}</Link>
          <Link href="/kategori/5" className="nav-link" onClick={() => setIsOpen(false)}>{t('test_drives')}</Link>
          <Link href="/karsilastirma" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: 'var(--accent-color)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
            {t('compare')}
          </Link>
          <Link href="/videolar" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#ff2d2d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
            {t('videos')}
          </Link>
          <Link href="/instagram" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#E1306C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z" /><circle cx="16.806" cy="7.207" r="1.078" /><path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.952-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.085 5.085 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z" /></svg>
            {t('instagram')}
          </Link>

          <div
            className="nav-dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onClick={(e) => {
              const newState = !isDropdownOpen;
              setIsDropdownOpen(newState);
              if (newState && window.innerWidth <= 1024) {
                const target = e.currentTarget;
                setTimeout(() => {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
              }
            }}
          >
            <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t('news')}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </span>

            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <Link href="/kategori/5801" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Kampanyalar' : (language === 'en' ? 'Campaigns' : (language === 'de' ? 'Kampagnen' : 'Акции'))}</Link>
              <Link href="/kategori/3" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Motor Sporları' : (language === 'en' ? 'Motorsports' : (language === 'de' ? 'Motorsport' : 'Мотоспорт'))}</Link>
              <Link href="/kategori/12" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Röportajlar' : (language === 'en' ? 'Interviews' : (language === 'de' ? 'Interviews' : 'Интервью'))}</Link>
              <Link href="/kategori/7368" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Ticari Araçlar' : (language === 'en' ? 'Commercial Vehicles' : (language === 'de' ? 'Nutzfahrzeuge' : 'Коммерческий транспорт'))}</Link>
              <Link href="/kategori/16714" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Elektrikli Araçlar' : (language === 'en' ? 'Electric Vehicles' : (language === 'de' ? 'Elektrofahrzeuge' : 'Электромобили'))}</Link>
              <Link href="/kategori/5802" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Konsept' : (language === 'en' ? 'Concept' : (language === 'de' ? 'Konzept' : 'Концепт'))}</Link>
              <Link href="/kategori/7369" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Motobike' : (language === 'en' ? 'Motobike' : (language === 'de' ? 'Motobike' : 'Мотоциклы'))}</Link>
              <Link href="/kategori/3356" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Teknoloji' : (language === 'en' ? 'Technology' : (language === 'de' ? 'Technologie' : 'Технологии'))}</Link>
              <Link href="/arama?q=lastik" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Lastik' : (language === 'en' ? 'Tire' : (language === 'de' ? 'Reifen' : 'Шины'))}</Link>
              <Link href="/arama?q=akaryakıt" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Akaryakıt' : (language === 'en' ? 'Fuel' : (language === 'de' ? 'Kraftstoff' : 'Топливо'))}</Link>
              <Link href="/kategori/18326" className="dropdown-item" onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Lansman' : (language === 'en' ? 'Launch' : (language === 'de' ? 'Vorstellung' : 'Ланч'))}</Link>
              <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0', opacity: 0.5 }} />
              <Link href="/kategori/4" className="dropdown-item" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }} onClick={() => setIsOpen(false)}>{language === 'tr' ? 'Tüm Haberler' : (language === 'en' ? 'All News' : (language === 'de' ? 'Alle Nachrichten' : 'Все новости'))}</Link>
            </div>
          </div>

          <Link href="/abonelik" className="nav-link" onClick={() => setIsOpen(false)}>{t('subscription')}</Link>

          {/* Mobile Only Login/Logout */}
          <div className="mobile-only" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', width: '100%' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="nav-link" style={{ textTransform: 'none', color: 'var(--accent-color)' }}>{user.user_display_name}</span>
                <button onClick={logout} className="nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{t('logout')}</button>
              </div>
            ) : (
              <Link href="/giris" className="btn-primary" onClick={() => setIsOpen(false)} style={{ textAlign: 'center' }}>{t('login')}</Link>
            )}

            {/* Mobile Language Switcher */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' }}>
              {(['tr', 'en', 'ru', 'de'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{ background: 'none', border: language === lang ? '1px solid var(--accent-color)' : 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '24px' }}
                >
                  {flags[lang]}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="nav-right">
          <div className="desktop-only" style={{ gap: '15px', alignItems: 'center' }}>
            <SearchBar />
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="nav-link desktop-only" style={{ textTransform: 'none', color: 'var(--accent-color)' }}>{user.user_display_name}</span>
                <button
                  onClick={logout}
                  className="nav-link"
                  style={{ background: 'none', border: '1px solid var(--border-color)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link href="/giris" className="btn-primary" onClick={() => setIsOpen(false)}>{t('login')}</Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Desktop Language Switcher */}
            <div className="desktop-only" style={{ gap: '5px', marginRight: '10px' }}>
              {(['tr', 'en', 'ru', 'de'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', fontSize: '18px', opacity: language === lang ? 1 : 0.4, transition: 'opacity 0.2s' }}
                  title={lang.toUpperCase()}
                >
                  {flags[lang]}
                </button>
              ))}
            </div>

            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" style={{ color: theme === 'light' ? '#f1c40f' : '#ffffff', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" /></svg>
            </button>

            {/* Mobile Toggle Button */}
            <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} title="Menüyü Aç">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}
    </header>
  );
}
