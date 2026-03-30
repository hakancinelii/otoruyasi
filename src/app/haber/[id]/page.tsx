'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';

export default function HaberDetay({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function fetchRealPost() {
      try {
        const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts/${params.id}?_embed`);
        if (!res.ok) throw new Error('API yanıt vermedi.');
        const data = await res.json();
        setPost(data);
        
        // İlk yüklemede başlık ve içeriği ata (TR varsayılan)
        setTranslatedTitle(data.title.rendered);
        setTranslatedContent(data.content.rendered);

        if (language !== 'tr') {
          translateContent(data, language);
        }
      } catch (error) {
        console.error('Hata:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRealPost();
  }, [params.id]);

  useEffect(() => {
    if (post && language !== 'tr') {
      translateContent(post, language);
    } else if (post && language === 'tr') {
      setTranslatedTitle(post.title.rendered);
      setTranslatedContent(post.content.rendered);
    }
  }, [language]);

  const translateContent = async (data: any, lang: string) => {
    setIsTranslating(true);
    try {
      // Başlık Çevirisi
      const titleRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.title.rendered, targetLang: lang })
      });
      const titleData = await titleRes.json();
      if (titleData.translatedText) setTranslatedTitle(titleData.translatedText);

      // İçerik Çevirisi
      const contentRes = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.content.rendered, targetLang: lang })
      });
      const contentData = await contentRes.json();
      if (contentData.translatedText) setTranslatedContent(contentData.translatedText);
      
    } catch (e) {
      console.error("Çeviri hatası:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <article className="container" style={{ paddingTop: '40px', paddingBottom: '40px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ width: '60%', height: '36px', background: 'var(--border-color)', marginBottom: '20px', borderRadius: '8px' }}></div>
        <div style={{ width: '100%', height: '420px', background: 'var(--border-color)', borderRadius: '16px', marginBottom: '30px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ width: '100%', height: '200px', background: 'var(--border-color)', borderRadius: '8px' }}></div>
        <style jsx global>{`@keyframes pulse { 0%{opacity:.3} 50%{opacity:.6} 100%{opacity:.3} }`}</style>
      </article>
    );
  }

  if (!post) {
    return (
      <article className="container" style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>Haber bulunamadı.</div>
        <Link href="/" style={{ color: 'var(--accent-color)', marginTop: '16px', display: 'inline-block' }}>← {t('home')}</Link>
      </article>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (p: any) => {
    return p._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };
  
  const imageUrl = getImageUrl(post);
  
  return (
    <article className="container" style={{ padding: '60px 20px', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
          ← {t('home')}
        </Link>
        <h1 
          className="hero-title" 
          style={{ fontSize: 'clamp(24px, 5vw, 42px)', lineHeight: '1.2', color: 'var(--text-color)', marginBottom: '20px' }}
          dangerouslySetInnerHTML={{ __html: translatedTitle }}
        ></h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <span>{new Date(post.date).toLocaleDateString('tr-TR')}</span>
          <span>•</span>
          <span>Oto Rüyası Editoryal</span>
          {isTranslating && (
            <span style={{ color: 'var(--accent-color)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <div className="spinner-mini"></div> AI Translating...
            </span>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        <img src={imageUrl} alt={post.title.rendered} style={{ width: '100%', display: 'block' }} />
      </div>

      <div 
        className="haber-icerik" 
        style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--text-color)', opacity: isTranslating ? 0.5 : 1, transition: 'opacity 0.3s' }}
        dangerouslySetInnerHTML={{ __html: translatedContent }}
      />

      <style jsx global>{`
        .haber-icerik p { margin-bottom: 25px; }
        .haber-icerik img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; }
        .spinner-mini {
          width: 14px;
          height: 14px;
          border: 2px solid var(--accent-color);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </article>
  );
}
