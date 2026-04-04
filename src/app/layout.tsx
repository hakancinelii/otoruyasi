import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GoogleAnalytics from '../components/GoogleAnalytics';
import AutoRefresh from '../components/AutoRefresh';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oto Rüyası | Araç İncelemeleri, Otomobil Test Sürüşleri ve Yapay Zeka ile Araç Karşılaştırmaları',
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
  return (
    <html lang="tr">
      <body className={inter.className}>
        <GoogleAnalytics />
        <AutoRefresh />
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            {children}
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
