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

  const flags: Record<Language, string> = {
    tr: '🇹🇷',
    en: '🇬🇧',
    ru: '🇷🇺',
    de: '🇩🇪'
  };

  const langNames: Record<Language, string> = {
    tr: 'Türkçe',
    en: 'English',
    ru: 'Русский',
    de: 'Deutsch'
  };

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
    {id: '7', label: language === 'tr' ? 'Ticari Araçlar' : 'Commercial Vehicles' },
    {id: '30', label: language === 'tr' ? 'Hafif Ticari' : 'Light Commercial' },
    {id: '16714', label: language === 'tr' ? 'Elektrikli Araçlar' : 'Electric Vehicles' },
    { id: '10', label: language === 'tr' ? 'Konsept' : 'Concept' },
    { id: '11', label: language === 'tr' ? 'Motobike' : 'Motobike' },
    { id: '9', label: language === 'tr' ? 'Teknoloji' : 'Technology' },
    { id: '13', label: language === 'tr' ? 'Lastik' : 'Tires' },
    { id: '14', label: language === 'tr' ? 'Akaryakıt' : 'Fuel' },
    { id: '15', label: language === 'tr' ? 'Lansman' : 'Launch' },
    { id: '3', label: language === 'tr' ? 'Gündem' : 'Agenda' },
    { id: '4', label: language === 'tr' ? 'Tüm Haberler' : 'All News', accent: true }
  ];

  // Shared language dropdown renderer
  const renderLangDropdown = (isMobile: boolean) => (
    <div className={`lang-dropdown-menu ${isMobile ? 'lang-dropdown-mobile' : ''}`}>
      {(['tr', 'en', 'ru', 'de'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => { setLanguage(lang); setIsLangOpen(false); if (isMobile) setIsOpen(false); }}
          className={`lang-item ${language === lang ? 'active' : ''}`}
        >
          <span style={{ fontSize: '20px' }}>{flags[lang]}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{langNames[lang]}</span>
            <span style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase' }}>{lang}</span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <header className={`header ${isVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="container nav-container">
        <div className="nav-left">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Oto Rüyası" className="logo-img" />
          </Link>
        </div>

        <div className="nav-main-wrapper">
          <nav className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
            <div className="mobile-only" style={{ marginBottom: '20px', width: '100%' }}>
              <SearchBar />
            </div>
            
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="nav-link" 
                onClick={() => setIsOpen(false)}
                style={{ color: item.color, fontWeight: item.bold ? 700 : 400 }}
              >
                {item.label}
              </Link>
            ))}
            
            <div 
              className="nav-dropdown" 
              onMouseEnter={() => setIsNewsOpen(true)} 
              onMouseLeave={() => setIsNewsOpen(false)}
            >
              <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('news')}
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </span>
              <div className={`dropdown-menu ${isNewsOpen ? 'show' : ''}`}>
                 {newsCategories.map((cat) => (
                   <Link 
                     key={cat.id} 
                     href={`/kategori/${cat.id}`} 
                     className="dropdown-item" 
                     onClick={() => setIsOpen(false)}
                     style={{ color: cat.accent ? 'var(--accent-color)' : 'inherit' }}
                   >
                     {cat.label}
                   </Link>
                 ))}
              </div>
            </div>
            
            <Link href="/abonelik" className="nav-link" onClick={() => setIsOpen(false)}>{t('subscription')}</Link>
          </nav>
        </div>

        <div className="nav-right">
          <div className="desktop-only" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <SearchBar />
            
            {user ? (
              <div className="nav-dropdown" onMouseEnter={() => setIsUserOpen(true)} onMouseLeave={() => setIsUserOpen(false)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-color)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px' }}>
                    {user.user_display_name ? user.user_display_name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.user_display_name || user.user_nicename}</span>
                  {user.isPremium && <span style={{ fontSize: '10px', padding: '2px 6px', background: 'linear-gradient(45deg, #FFD700, #FFA500)', color: '#000', borderRadius: '4px', fontWeight: '800' }}>⭐ PREMIUM</span>}
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div className={`dropdown-menu ${isUserOpen ? 'show' : ''}`} style={{ minWidth: '180px', right: 0 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>{user.user_email}</div>
                  <Link href="/profil" className="dropdown-item">{language === 'tr' ? '👤 Profilim' : '👤 My Profile'}</Link>
                  <Link href="/abonelik" className="dropdown-item">{user.isPremium ? (language === 'tr' ? '🛡️ Abonelik Yönetimi' : '🛡️ Manage Sub') : (language === 'tr' ? '✨ Premium\'a Geç' : '✨ Go Premium')}</Link>
                  <button onClick={logout} className="dropdown-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#ff4d4d' }}>{language === 'tr' ? '🚪 Çıkış Yap' : '🚪 Logout'}</button>
                </div>
              </div>
            ) : (
              <Link href="/giris" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>{t('login')}</Link>
            )}
            
            <div className="lang-switcher" ref={langRef} style={{ position: 'relative' }}>
              <button 
                className="lang-btn" 
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <span style={{ fontSize: '18px' }}>{flags[language]}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{language}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" style={{ transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              
              {isLangOpen && renderLangDropdown(false)}
            </div>

            <button className="theme-toggle" onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme === 'light' ? '#f1c40f' : '#fff' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" /></svg>
            </button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
