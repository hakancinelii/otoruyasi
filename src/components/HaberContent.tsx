'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function HaberContent({ id, initialPost }: { id: string, initialPost?: any }) {
  const [post, setPost] = useState<any>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const { language, t } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState(initialPost?.title?.rendered || '');
  const [translatedContent, setTranslatedContent] = useState(initialPost?.content?.rendered || '');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  // 4 hafta kontrolü
  const isRecent = post ? (Math.floor((new Date().getTime() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24)) <= 28) : false;

  useEffect(() => {
    if (!initialPost) {
      async function fetchRealPost() {
        try {
          const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts/${id}?_embed`);
          if (!res.ok) throw new Error('API yanıt vermedi.');
          const data = await res.json();
          setPost(data);

          const shouldTranslate = language !== 'tr' && Math.floor((new Date().getTime() - new Date(data.date).getTime()) / (1000 * 60 * 60 * 24)) <= 28;

          if (shouldTranslate) {
            translateContent(data, language);
          } else {
            setTranslatedTitle(data.title.rendered);
            setTranslatedContent(data.content.rendered);
            setTranslationError('');
          }
        } catch (error) {
          console.error('Hata:', error);
        } finally {
          setLoading(false);
        }
      }
      fetchRealPost();
    }
  }, [id]);

  useEffect(() => {
    if (post) {
      if (language !== 'tr' && isRecent) {
        translateContent(post, language);
      } else {
        setTranslatedTitle(post.title.rendered);
        setTranslatedContent(post.content.rendered);
        setTranslationError('');
      }
    }
  }, [language, post, isRecent]);

  const translateContent = async (data: any, lang: string) => {
    setTranslatedTitle('');
    setTranslatedContent('');
    setIsTranslating(true);
    setTranslationError('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `TITLE: ${data.title.rendered} \n\n CONTENT: ${data.content.rendered}`, 
          targetLang: lang 
        })
      });
      
      const resData = await res.json();
      
      if (resData.translatedText) {
        const fullText = resData.translatedText;
        const titleMatch = fullText.match(/TITLE:([\s\S]*?)CONTENT:/i);
        const contentMatch = fullText.match(/CONTENT:([\s\S]*)/i);
        
        if (titleMatch && contentMatch) {
          setTranslatedTitle(titleMatch[1].trim());
          setTranslatedContent(contentMatch[1].trim());
        } else {
          setTranslatedContent(fullText.replace(/TITLE:.*?\n/i, ''));
          setTranslatedTitle(data.title.rendered); 
        }
      } else {
        throw new Error("Çeviri başarısız.");
      }
    } catch (e: any) {
      setTranslationError(e.message || "Hata");
      setTranslatedTitle(data.title.rendered);
      setTranslatedContent(data.content.rendered);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>{t('loading')}...</div>;
  if (!post) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>{t('no_content')}</div>;

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';

  return (
    <article className="container" style={{ padding: '60px 20px', maxWidth: '860px', margin: '0 auto' }}>
      <Link href="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
        ← {t('home')}
      </Link>
      
      <h1 className="hero-title" style={{ fontSize: 'clamp(24px, 5vw, 42px)', marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: translatedTitle }}></h1>
      
      <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', marginBottom: '30px' }}>
        <span>{new Date(post.date).toLocaleDateString()}</span>
        {isTranslating && <span style={{ color: 'var(--accent-color)' }}>{language === 'tr' ? 'Çevriliyor...' : 'AI Translating...'}</span>}
      </div>

      <img src={imageUrl} alt={post.title.rendered} style={{ width: '100%', borderRadius: '24px', marginBottom: '40px' }} />

      <div className="haber-icerik" style={{ fontSize: '18px', lineHeight: '1.8', overflowX: 'auto', clear: 'both' }} dangerouslySetInnerHTML={{ __html: translatedContent }} />

      <style jsx global>{`
        .haber-icerik { clear: both; }
        .haber-icerik::after { content: ''; display: block; clear: both; }
        .haber-icerik p { margin-bottom: 25px; clear: both; }
        .haber-icerik img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; display: block; clear: both; float: none !important; }
        .haber-icerik figure { margin: 24px 0; clear: both; display: block; float: none !important; }
        .haber-icerik figure img { margin: 0; }
        .haber-icerik div, .haber-icerik section, .haber-icerik article { clear: both; }
        .haber-icerik br[clear] { clear: both; }
        .haber-icerik iframe { max-width: 100%; display: block; margin: 24px 0; clear: both; }
        .haber-icerik .alignleft,
        .haber-icerik .alignright,
        .haber-icerik [style*='float:left'],
        .haber-icerik [style*='float: left'],
        .haber-icerik [style*='float:right'],
        .haber-icerik [style*='float: right'] {
          float: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .haber-icerik table {
        .haber-icerik table {
          width: 100%;
          min-width: max-content;
          border-collapse: collapse;
          margin: 24px 0;
          font-size: 15px;
          line-height: 1.6;
        }
        .haber-icerik th,
        .haber-icerik td {
          border: 1px solid var(--border-color);
          padding: 12px 14px;
          text-align: left;
          vertical-align: top;
        }
        .haber-icerik thead th {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-color);
          font-weight: 700;
        }
        .haber-icerik tbody tr:nth-child(even) {
          background: rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </article>
  );
}
