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
          
          if (language === 'tr') {
            setTranslatedTitle(data.title.rendered);
            setTranslatedContent(data.content.rendered);
          } else {
            translateContent(data, language);
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
      if (language !== 'tr') {
        translateContent(post, language);
      } else {
        setTranslatedTitle(post.title.rendered);
        setTranslatedContent(post.content.rendered);
        setTranslationError('');
      }
    }
  }, [language, post]);

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

      <div className="haber-icerik" style={{ fontSize: '18px', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: translatedContent }} />
      
      <style jsx global>{`
        .haber-icerik p { margin-bottom: 25px; }
        .haber-icerik img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; }
      `}</style>
    </article>
  );
}
