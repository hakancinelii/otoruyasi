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

  const flags: Record<Language, string> = { tr: '🇹🇷', en: '🇬🇧', ru: '🇷🇺', de: '🇩🇪' };
  const langNames: Record<Language, string> = { tr: 'Türkçe', en: 'English', ru: 'Русский', de: 'Deutsch' };

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
      <div className="container nav-container">
        <div className="nav-left">
          <Link href="/">
            <img src="/logo.png" alt="Oto Rüyası" className="logo-img" />
          </Link>
        </div>

        {/* Desktop Links */}
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

        {/* Action Right */}
        <div className="nav-right">
          <div className="desktop-only" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <SearchBar />
            {user ? (
              <div className="nav-dropdown" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <div className="user-nav-btn">
                   <div className="user-avatar">{user.user_display_name[0]}</div>
                   <span className="username">{user.user_display_name}</span>
                </div>
                <div className={`dropdown-menu ${isUserOpen ? 'show' : ''}`} style={{ right: 0 }}>
                   <Link href="/profil" className="dropdown-item">👤 Profil</Link>
                   <button onClick={logout} className="dropdown-item logout-btn">🚪 Çıkış</button>
                </div>
              </div>
            ) : (
              <Link href="/giris" className="btn-primary">{t('login')}</Link>
            )}
            <div className="lang-switcher" ref={langRef}>
              <button className="lang-btn" onClick={() => setIsLangOpen(!isLangOpen)}>
                <span>{flags[language]}</span>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>{language.toUpperCase()}</span>
              </button>
              {isLangOpen && (
                <div className="lang-dropdown-menu">
                  {(['tr', 'en', 'ru', 'de'] as Language[]).map(l => (
                    <button key={l} onClick={() => { setLanguage(l); setIsLangOpen(false); }} className="lang-item">
                      <span>{flags[l]}</span> {langNames[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? '🌙' : '☀️'}</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y1="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* Sidebar Mobile - The one you liked */}
      <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" style={{ height: '30px' }} />
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-links">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-item" onClick={() => setIsOpen(false)}>{item.label}</Link>
            ))}
            <div className="sidebar-divider"></div>
            {newsCategories.map((cat) => (
              <Link key={cat.id} href={`/kategori/${cat.id}`} className="sidebar-item secondary" onClick={() => setIsOpen(false)}>{cat.label}</Link>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="sidebar-lang-grid">
               {(['tr', 'en', 'ru', 'de'] as Language[]).map(l => (
                 <button key={l} onClick={() => { setLanguage(l); setIsOpen(false); }} className={`sidebar-lang-btn ${language === l ? 'active' : ''}`}>
                   <span>{flags[l]}</span> {l.toUpperCase()}
                 </button>
               ))}
            </div>
            <button onClick={toggleTheme} className="sidebar-theme-btn">
              {theme === 'light' ? '🌙 Gece Modu' : '☀️ Aydınlık Mod'}
            </button>
          </div>
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </header>
  );
}
