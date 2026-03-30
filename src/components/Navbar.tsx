'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const { user, logout } = useAuth();

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

  return (
    <header className="header">
      <div className="container nav-container">
        <Link href="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo.png"
            alt="Oto Rüyası Logo"
            className="logo-img"
          />
        </Link>

        {/* Desktop & Mobile Navigation */}
        <nav className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-search-wrapper">
            <SearchBar />
          </div>
          <Link href="/" className="nav-link" onClick={() => setIsOpen(false)}>Ana Sayfa</Link>
          <Link href="/kategori/5" className="nav-link" onClick={() => setIsOpen(false)}>Test Sürüşleri</Link>
          <Link href="/videolar" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#ff2d2d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
            Test Videoları
          </Link>

          <div
            className="nav-dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Haberler
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </span>

            <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <Link href="/kategori/5801" className="dropdown-item" onClick={() => setIsOpen(false)}>Kampanyalar</Link>
              <Link href="/kategori/3" className="dropdown-item" onClick={() => setIsOpen(false)}>Motor Sporları</Link>
              <Link href="/kategori/12" className="dropdown-item" onClick={() => setIsOpen(false)}>Röportajlar</Link>
              <Link href="/kategori/7368" className="dropdown-item" onClick={() => setIsOpen(false)}>Ticari Araçlar</Link>
              <Link href="/kategori/16714" className="dropdown-item" onClick={() => setIsOpen(false)}>Elektrikli Araçlar</Link>
              <Link href="/kategori/5802" className="dropdown-item" onClick={() => setIsOpen(false)}>Konsept</Link>
              <Link href="/kategori/7369" className="dropdown-item" onClick={() => setIsOpen(false)}>Motobike</Link>
              <Link href="/kategori/3356" className="dropdown-item" onClick={() => setIsOpen(false)}>Teknoloji</Link>
              <Link href="/arama?q=lastik" className="dropdown-item" onClick={() => setIsOpen(false)}>Lastik</Link>
              <Link href="/arama?q=akaryakıt" className="dropdown-item" onClick={() => setIsOpen(false)}>Akaryakıt</Link>
              <Link href="/kategori/18326" className="dropdown-item" onClick={() => setIsOpen(false)}>Lansman</Link>
              <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0', opacity: 0.5 }} />
              <Link href="/kategori/4" className="dropdown-item" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }} onClick={() => setIsOpen(false)}>Tüm Haberler</Link>
            </div>
          </div>

          <Link href="/abonelik" className="nav-link" onClick={() => setIsOpen(false)}>Dergi Aboneliği</Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="nav-link" style={{ textTransform: 'none', color: 'var(--accent-color)' }}>{user.user_display_name}</span>
              <button
                onClick={logout}
                className="nav-link"
                style={{ background: 'none', border: '1px solid var(--border-color)', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Çıkış
              </button>
            </div>
          ) : (
            <Link href="/giris" className="btn-primary" onClick={() => setIsOpen(false)}>Kayıt / Üye Girişi</Link>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme" style={{ color: theme === 'light' ? '#f1c40f' : '#ffffff', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" /></svg>
          </button>

          {/* Mobile Toggle Button */}
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            <span style={{ background: 'var(--text-color)' }}></span>
            <span style={{ background: 'var(--text-color)' }}></span>
            <span style={{ background: 'var(--text-color)' }}></span>
          </button>
        </div>
      </div>
      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}
    </header>
  );
}
