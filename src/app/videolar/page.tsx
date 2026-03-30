'use client';

import { useState, useEffect } from 'react';
import VideoList from '../../components/VideoList';
import { useLanguage } from '../context/LanguageContext';

type Video = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
};

export default function VideolarPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    async function fetchVideos() {
      try {
        // RSS Parser can't be used easily on client due to CORS,
        // so we'll fetch from a small proxy or just hardcode some for now
        // if we want to stay within client. 
        // Better: Fetch them via an API route. 
        const res = await fetch('/api/videos');
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error('Video fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <main className="container">
        <div style={{ padding: '80px 0', textAlign: 'center' }}>{t('loading')}</div>
      </main>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>{t('no_content')}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ marginBottom: '40px', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '36px', margin: 0, fontWeight: 800 }}>
          {language === 'tr' ? 'Oto Rüyası Test Videoları' : 'Oto Rüyası Test Videos'}
        </h1>
        <a href="https://www.youtube.com/@hakkgunerkan9576" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#ff0000', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          {language === 'tr' ? 'Kanalımıza Abone Olun' : 'Subscribe to our Channel'}
        </a>
      </div>

      <VideoList videos={videos} />
    </main>
  );
}
