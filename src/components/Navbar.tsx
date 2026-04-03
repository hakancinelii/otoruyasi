'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 150) setIsVisible(false);
      else setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const flags: Record<string, string> = { tr: '🇹🇷', en: '🇬🇧', ru: '🇷🇺', de: '🇩🇪' };
  const langNames: Record<string, string> = { tr: 'TR', en: 'EN', ru: 'RU', de: 'DE' };

  const menuItems = [
    { label: t('home'), href: '/' },
    { label: t('test_drives'), href: '/kategori/5' },
    { label: t('compare'), href: '/karsilastirma', color: 'var(--accent-color)', bold: true },
    { label: t('videos'), href: '/videolar' },
    { label: t('instagram'), href: '/instagram' },
    { label: t('collaboration'), href: '/is-birligi' }
  ];

  const newsCategories = [
    { id: '5802', label: language === 'tr' ? 'Kampanyalar' : 'Campaigns' },
    { id: '7368', label: language === 'tr' ? 'Motor Sporları' : 'Motorsports' },
    { id: '12', label: language === 'tr' ? 'Röportajlar' : 'Interviews' },
    { id: '16714', label: language === 'tr' ? 'Elektrikli Araçlar' : 'Electric Vehicles' },
    { id: '4', label: language === 'tr' ? 'Tüm Haberler' : 'All News', accent: true }
  ];

  return (
    <header className={`header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="container nav-container">
        {/* LOGO - Shifted fully to the left inside the CSS-defined flexbox */}
        <div className="nav-left">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Oto Rüyası" className="logo-img" />
          </Link>
        </div>

        {/* DESKTOP MENU - Middle portion */}
        <nav className="desktop-only nav-links">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" style={{ color: item.color, fontWeight: item.bold ? 700 : 400 }}>{item.label}</Link>
          ))}
          <div className="nav-dropdown" onMouseEnter={() => setIsNewsOpen(true)} onMouseLeave={() => setIsNewsOpen(false)}>
            <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t('news')} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
            </span>
            <div className={`dropdown-menu ${isNewsOpen ? 'show' : ''}`}>
              {newsCategories.map((cat) => (
                <Link key={cat.id} href={`/kategori/${cat.id}`} className="dropdown-item">{cat.label}</Link>
              ))}
            </div>
          </div>
          {/* <Link href="/abonelik" className="nav-link">{t('subscription')}</Link> HIDDEN */}
        </nav>

        {/* ACTION RIGHT - Anchored to the right side */}
        <div className="nav-right">
          <div className="desktop-only" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <SearchBar />

            {/* HIDDEN AUTH SYSTEM
            {user ? (
              <div className="nav-dropdown" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                ...
              </div>
            ) : (
              <Link href="/giris" className="btn-primary" style={{ padding: '8px 14px', background: 'var(--accent-color)', color: '#000', borderRadius: '6px', fontWeight: '700', fontSize: '11px' }}>{t('login')}</Link>
            )}
            */}

            <div className="lang-switcher" ref={langRef} style={{ position: 'relative' }}>
              <button className="lang-btn" onClick={() => setIsLangOpen(!isLangOpen)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '6px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', color: '#fff', cursor: 'pointer' }}>
                <span>{flags[language]}</span>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>{language.toUpperCase()}</span>
              </button>
              {isLangOpen && (
                <div className="lang-dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, background: '#1c2128', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', zIndex: 1000, minWidth: '140px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginTop: '8px' }}>
                  {(['tr', 'en', 'ru', 'de'] as Language[]).map(l => (
                    <button key={l} onClick={() => { setLanguage(l); setIsLangOpen(false); }} style={{ display: 'flex', gap: '10px', padding: '10px 15px', color: '#fff', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                      <span>{flags[l]}</span> <span style={{ fontSize: '12px' }}>{flags[l] === '🇹🇷' ? 'Türkçe' : flags[l] === '🇬🇧' ? 'English' : flags[l] === '🇷🇺' ? 'Русский' : 'Deutsch'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="theme-toggle" onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', padding: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR (Drawer stays as requested) */}
      <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '30px' }} />
          <button className="close-btn" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-color)', fontSize: '24px' }}>✕</button>
        </div>
        <div className="sidebar-content" style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <SearchBar />
          </div>
          <div className="sidebar-links">
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '15px' }}>MENÜ</div>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'block', padding: '12px 0', fontSize: '16px', fontWeight: 700, color: item.color || 'var(--text-color)', textDecoration: 'none', borderBottom: '1px solid var(--border-color)' }} onClick={() => setIsOpen(false)}>{item.label}</Link>
            ))}
            <div style={{ height: '1px', background: 'var(--border-color)', margin: '20px 0' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '15px' }}>KATEGORİLER</div>
            {newsCategories.map((cat) => (
              <Link key={cat.id} href={`/kategori/${cat.id}`} style={{ display: 'block', padding: '10px 0', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }} onClick={() => setIsOpen(false)}>{cat.label}</Link>
            ))}
          </div>
        </div>
        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {(['tr', 'en', 'ru', 'de'] as Language[]).map(l => (
              <button key={l} onClick={() => { setLanguage(l); setIsOpen(false); }} style={{ padding: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{flags[l]}</span> {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={toggleTheme} style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'var(--card-bg)', color: 'var(--text-color)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 700 }}>
            {theme === 'light' ? '🌙 Gece Modu' : '☀️ Açık Mod'}
          </button>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </header>
  );
}
