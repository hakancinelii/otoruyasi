import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GoogleAnalytics from '../components/GoogleAnalytics';
import AutoRefresh from '../components/AutoRefresh';

const inter = Inter({ subsets: ['latin'] });
const supportedLanguages = ['tr', 'en', 'ru', 'de'] as const;
type SupportedLanguage = typeof supportedLanguages[number];

function getInitialLanguage(): SupportedLanguage {
  const pathname = headers().get('x-pathname') || '';
  const pathLang = pathname.split('/')[1];
  const cookieLang = cookies().get('NEXT_LOCALE')?.value;
  const lang = pathLang || cookieLang;

  return supportedLanguages.includes(lang as SupportedLanguage) ? lang as SupportedLanguage : 'tr';
}

export const metadata: Metadata = {
  title: 'Oto Rüyası | Araç İncelemeleri, Otomobil Test Sürüşleri ve Yapay Zeka ile Araç Karşılaştırmaları',
  icons: {
    icon: '/favicon-otoruyasi.png',
    shortcut: '/favicon-otoruyasi.png',
    apple: '/favicon-otoruyasi.png',
  },
  description: 'En yeni otomobilleri keşfedin! Araç incelemeleri, test sürüşleri, güncel otomobil haberleri ve yapay zeka ile en doğru araç karşılaştırmaları Oto Rüyası\'nda sizi bekliyor.',
  keywords: 'oto rüyası, araç karşılaştırma, otomobil test sürüşü, araba incelemeleri, yapay zeka araç analizi, otomobil haberleri, AI car comparison',
  openGraph: {
    title: 'Oto Rüyası | Yapay Zeka Destekli Araç Karşılaştırma ve Test Sürüşleri',
    description: 'Türkiye\'nin en kapsamlı otomobil portalı. Yapay zeka ile araç karşılaştırma, detaylı test sürüşleri ve güncel otomobil haberleri.',
    url: 'https://otoruyasi.com',
    siteName: 'Oto Rüyası',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oto Rüyası | AI Araç Karşılaştırma & Test Sürüşleri',
    description: 'Yapay zeka destekli araç karşılaştırma, detaylı test sürüşleri ve otomobil haberleri.',
  },
  alternates: {
    canonical: 'https://otoruyasi.com',
    languages: {
      'tr-TR': 'https://otoruyasi.com',
      'en-US': 'https://otoruyasi.com/en',
      'de-DE': 'https://otoruyasi.com/de',
      'ru-RU': 'https://otoruyasi.com/ru',
      'x-default': 'https://otoruyasi.com',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLanguage = getInitialLanguage();

  return (
    <html lang={initialLanguage}>
      <body className={inter.className}>
        <GoogleAnalytics />
        <AutoRefresh />
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <Navbar />
            {children}
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
