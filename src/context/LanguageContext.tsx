'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../i18n/translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.tr) => string;
  localizedPath: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGS: Language[] = ['tr', 'en', 'ru', 'de'];

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    // Priority 1: Detect language from URL path prefix (/en/, /de/, /ru/)
    const pathSegments = window.location.pathname.split('/');
    const urlLang = pathSegments[1] as Language;
    
    if (['en', 'de', 'ru'].includes(urlLang)) {
      setLanguageState(urlLang);
      localStorage.setItem('app_lang', urlLang);
      return;
    }

    // Priority 2: Check cookie (set by middleware)
    const cookieMatch = document.cookie.match(/NEXT_LOCALE=(\w+)/);
    if (cookieMatch && SUPPORTED_LANGS.includes(cookieMatch[1] as Language)) {
      setLanguageState(cookieMatch[1] as Language);
      localStorage.setItem('app_lang', cookieMatch[1]);
      return;
    }

    // Priority 3: Check localStorage
    const savedLang = localStorage.getItem('app_lang') as Language;
    if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
    // Also set cookie for middleware consistency
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=${60 * 60 * 24 * 365}`;

    // Navigate to the localized URL
    const currentPath = window.location.pathname;
    // Strip any existing lang prefix
    const cleanPath = currentPath.replace(/^\/(en|de|ru)/, '') || '/';
    
    if (lang === 'tr') {
      // Turkish = default, no prefix
      window.history.replaceState(null, '', cleanPath);
    } else {
      window.history.replaceState(null, '', `/${lang}${cleanPath}`);
    }
  };

  const t = (key: keyof typeof translations.tr) => {
    return translations[language][key] || translations.tr[key] || String(key);
  };

  // Helper: generates a localized path for <Link> components
  const localizedPath = (path: string): string => {
    if (language === 'tr') return path;
    return `/${language}${path}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localizedPath }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
