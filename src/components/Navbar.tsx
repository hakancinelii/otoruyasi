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
          <Link href="/instagram" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#E1306C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z"/><circle cx="16.806" cy="7.207" r="1.078"/><path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217zm-1.218 9.532a5.043 5.043 0 0 1-.311 1.688 2.987 2.987 0 0 1-1.712 1.711 4.985 4.985 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a4.96 4.96 0 0 1-1.669-.311 2.985 2.985 0 0 1-1.719-1.711 5.08 5.08 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654 0-2.437 0-2.686.053-3.655a5.038 5.038 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5.01 5.01 0 0 1 1.669-.311c.952-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a4.96 4.96 0 0 1 1.67.311 2.991 2.991 0 0 1 1.712 1.712 5.085 5.085 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655 0 2.436 0 2.698-.043 3.654h-.011z"/></svg>
            Instagram
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
          <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} title="Menüyü Aç">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}
    </header>
  );
}
