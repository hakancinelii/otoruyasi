'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryPost {
  id: number;
  title: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

interface CategorySectionProps {
  categoryId: string;
  title: string;
  language: string;
  t: any;
}

export default function CategorySection({ categoryId, title, language, t }: CategorySectionProps) {
  const [posts, setPosts] = useState<CategoryPost[]>([]);
  const [translatedPosts, setTranslatedPosts] = useState<CategoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts?categories=${categoryId}&_embed&per_page=4`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
          
          if (language === 'tr') {
            setTranslatedPosts(data);
            setLoading(false);
          } else {
            translateBatch(data);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, language]);

  const translateBatch = async (batch: any[]) => {
    if (batch.length === 0) return;
    setIsTranslating(true);
    const batchText = batch.map((p, i) => `[ITEM-${i}] TITLE: ${p.title.rendered}`).join('\n\n');
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: batchText, targetLang: language })
      });
      const data = await res.json();
      if (data.translatedText) {
        const fullText = data.translatedText;
        const updated = batch.map((oldPost, i) => {
          const itemRegex = new RegExp(`\\[ITEM-${i}\\]\\s*TITLE:([\\s\\S]*?)(?=\\[ITEM-|\\n|$)`, 'i');
          const titleMatch = fullText.match(itemRegex);
          return {
            ...oldPost,
            title: { ...oldPost.title, rendered: titleMatch ? titleMatch[1].trim() : oldPost.title.rendered }
          };
        });
        setTranslatedPosts(updated);
      }
    } catch (e) {
      console.error(e);
      setTranslatedPosts(batch);
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading || posts.length === 0) return null;

  return (
    <section className="category-section container">
      <div className="category-header">
        <div className="category-title-badge">
          {title}
        </div>
        <Link href={`/kategori/${categoryId}`} className="category-view-all">
          {t('all_news')} →
        </Link>
      </div>

      <div className="category-grid">
        {(translatedPosts.slice(0, 4)).map((post) => (
          <Link href={`/haber/${post.id}`} key={post.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="card-img-wrapper" style={{ height: '160px' }}>
              <img 
                className="card-img" 
                src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200'} 
                alt={post.title.rendered} 
              />
            </div>
            <div className="card-content" style={{ padding: '15px' }}>
              <h3 className="card-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, minHeight: '42px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--accent-color)', fontWeight: 800 }}>{t('read_more')}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
