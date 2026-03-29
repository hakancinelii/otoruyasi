'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <div className="container nav-container">
        <Link href="/" className="logo" onClick={() => setIsOpen(false)}>OTO RÜYASI</Link>
        
        {/* Desktop Navigation */}
        <nav className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-search-wrapper">
            <SearchBar />
          </div>
          <Link href="/" className="nav-link" onClick={() => setIsOpen(false)}>Ana Sayfa</Link>
          <Link href="/kategori/5" className="nav-link" onClick={() => setIsOpen(false)}>Test Sürüşleri</Link>
          <Link href="/videolar" className="nav-link" onClick={() => setIsOpen(false)} style={{ color: '#ff2d2d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg> 
            Test Videoları
          </Link>
          <Link href="/kategori/16714" className="nav-link" onClick={() => setIsOpen(false)}>Elektrikli</Link>
          <Link href="/kategori/4" className="nav-link" onClick={() => setIsOpen(false)}>Haberler</Link>
          <Link href="/abonelik" className="nav-link" onClick={() => setIsOpen(false)}>Dergi Aboneliği</Link>
          <Link href="/giris" className="btn-primary" onClick={() => setIsOpen(false)}>Kayıt / Üye Girişi</Link>
        </nav>

        {/* Mobile Toggle Button */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {isOpen && <div className="mobile-overlay" onClick={() => setIsOpen(false)}></div>}
    </header>
  );
}
