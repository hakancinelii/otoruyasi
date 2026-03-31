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
  const langNames: Record<string, string> = { tr: 'Türkçe', en: 'English', ru: 'Русский', de: 'Deutsch' };

  const menuItems = [
    { label: t('home'), href: '/' },
    { label: t('test_drives'), href: '/kategori/5' },
    { label: t('compare'), href: '/karsilastirma', color: 'var(--accent-color)', bold: true },
    { label: t('videos'), href: '/videolar', color: '#ff2d2d' },
    { label: t('instagram'), href: '/instagram' },
    { label: t('collaboration'), href: '/is-birligi' }
  ];

  const newsCategories = [
    {id: '5802', label: language === 'tr' ? 'Kampanyalar' : 'Campaigns' },
    {id: '7368', label: language === 'tr' ? 'Motor Sporları' : 'Motorsports' },
    {id: '12', label: language === 'tr' ? 'Röportajlar' : 'Interviews' },
    { id: '16714', label: language === 'tr' ? 'Elektrikli Araçlar' : 'Electric Vehicles' },
    { id: '4', label: language === 'tr' ? 'Tüm Haberler' : 'All News', accent: true }
  ];

  return (
    <header className={`header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="nav-left">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Oto Rüyası" className="logo-img" />
          </Link>
        </div>

        <nav className="desktop-only nav-links">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" style={{ color: item.color, fontWeight: item.bold ? 700 : 400 }}>{item.label}</Link>
          ))}
          <div className="nav-dropdown" onMouseEnter={() => setIsNewsOpen(true)} onMouseLeave={() => setIsNewsOpen(false)}>
            <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {t('news')} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
            </span>
            <div className={`dropdown-menu ${isNewsOpen ? 'show' : ''}`}>
              {newsCategories.map((cat) => (
                <Link key={cat.id} href={`/kategori/${cat.id}`} className="dropdown-item">{cat.label}</Link>
              ))}
            </div>
          </div>
          <Link href="/abonelik" className="nav-link">{t('subscription')}</Link>
        </nav>

        <div className="nav-right">
          <div className="desktop-only" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <SearchBar /> {user ? (
              <div className="nav-dropdown" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '800', fontSize: '11px' }}>{user.user_display_name ? user.user_display_name[0].toUpperCase() : 'U'}</div>
                   <span style={{ fontSize: '12px', fontWeight: 600 }}>{user.user_display_name}</span>
                </div>
                <div className={`dropdown-menu ${isUserOpen ? 'show' : ''}`} style={{ right: 0 }}>
                   <Link href="/profil" className="dropdown-item">👤 Profil</Link>
                   <button onClick={logout} className="dropdown-item" style={{ border: 'none', background: 'none', color: '#ff4d4d', cursor: 'pointer', width: '100%', textAlign: 'left' }}>🚪 Çıkış</button>
                </div>
              </div>) : (<Link href="/giris" className="btn-primary" style={{ padding: '8px 15px', background: 'var(--accent-color)', color: '#000', borderRadius: '6px', fontWeight: '700', fontSize: '12px' }}>{t('login')}</Link>
            )}
            <div className="lang-switcher" ref={langRef} style={{ position: 'relative' }}>
              <button className="lang-btn" onClick={() => setIsLangOpen(!isLangOpen)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                <span>{flags[language as string] || '🇹🇷'}</span><span style={{ fontSize: '11px', fontWeight: 700 }}>{String(language).toUpperCase()}</span>
              </button>
              {isLangOpen && (
                <div className="lang-dropdown-menu" style={{ position: 'absolute', top: '100%', right: 0, background: '#1c2128', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', zIndex: 1000, minWidth: '160px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginTop: '8px' }}>
                  {(['tr', 'en', 'ru', 'de'] as Language[]).map((l) => (
                    <button key={l} onClick={() => { setLanguage(l); setIsLangOpen(false); }} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', color: '#fff', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <span>{flags[l]}</span> <span>{langNames[l]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="theme-toggle" onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>
          <button className="mobile-menu-btn" onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR (DRAWER) */}
      <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
           <img src="/logo.png" alt="Logo" style={{ height: '30px' }} />
           <button className="close-btn" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>✕</button>
        </div>
        <div className="sidebar-content">
           <div style={{ marginBottom: '25px' }}><SearchBar /></div>
           <div className="sidebar-links">
             <div className="sidebar-label" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '15px' }}>{language === 'tr' ? 'MENÜ' : 'MENU'}</div>
             {menuItems.map((item) => (
               <Link key={item.href} href={item.href} className="sidebar-item" onClick={() => setIsOpen(false)} style={{ color: item.color || '#fff' }}>{item.label}</Link>
             ))}
             <div className="sidebar-divider" style={{ height: '1px', background: 'var(--border-color)', margin: '20px 0' }}></div>
             <div className="sidebar-label" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '15px' }}>{language === 'tr' ? 'KATEGORİLER' : 'CATEGORIES'}</div>
             {newsCategories.map((cat) => (
               <Link key={cat.id} href={`/kategori/${cat.id}`} className="sidebar-item secondary" onClick={() => setIsOpen(false)} style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{cat.label}</Link>
             ))}
           </div>
        </div>
        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="sidebar-label" style={{ marginBottom: '12px' }}>{language === 'tr' ? 'DİL VE TEMA' : 'LANGUAGE & THEME'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {(['tr', 'en', 'ru', 'de'] as Language[]).map(l => (
              <button key={l} onClick={() => { setLanguage(l); setIsOpen(false); }} className={`sidebar-lang-btn ${language === l ? 'active' : ''}`} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{flags[l]}</span> {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={toggleTheme} className="sidebar-theme-btn" style={{ width: '100%', marginTop: '15px', padding: '14px', background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '10px', fontWeight: '700' }}>
            {theme === 'light' ? '🌙 Gece Modu' : '☀️ Aydınlık Mod'}
          </button>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 10000 }}></div>}
    </header>
  );
}
