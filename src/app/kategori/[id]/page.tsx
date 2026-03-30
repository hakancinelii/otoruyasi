'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GridSkeleton } from '../../../components/Skeleton';
import { useLanguage } from '../../../context/LanguageContext';

export default function KategoriPage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [translatedPosts, setTranslatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { t, language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const fetchCategoryData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts?categories=${params.id}&_embed&per_page=30&page=${pageNum}`);

      if (!res.ok) {
        if (res.status === 400) setHasMore(false);
        throw new Error(t('no_content'));
      }

      const data = await res.json();
      if (data.length < 30) setHasMore(false);

      if (isLoadMore) {
        const newPosts = [...posts, ...data];
        setPosts(newPosts);
        if (language !== 'tr') translateGridBatch(data, newPosts.length - data.length);
        else setTranslatedPosts(newPosts);
      } else {
        setPosts(data);
        if (language === 'tr') {
          setTranslatedPosts(data);
        } else {
          setTranslatedPosts([]); 
          translateGridBatch(data, 0);
        }
      }
    } catch (error) {
      console.error('Doğrudan bağlantı hatası:', error);
      if (isLoadMore) setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCategoryData(1);
  }, [params.id]);

  useEffect(() => {
    if (posts.length > 0) {
      if (language !== 'tr') {
        setTranslatedPosts([]); 
        translateGridBatch(posts, 0);
      } else {
        setTranslatedPosts(posts);
      }
    }
  }, [language]);

  const translateGridBatch = async (batch: any[], startIndex: number) => {
    if (batch.length === 0) return;
    setIsTranslating(true);
    const batchText = batch.map((p, i) => `[ITEM-${i}] TITLE: ${p.title.rendered} \n EXCERPT: ${p.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 100)}...`).join('\n\n');
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: batchText, targetLang: language })
      });
      const data = await res.json();
      if (data.translatedText) {
        const fullText = data.translatedText;
        const updatedTranslatedPosts = [...(translatedPosts.length === posts.length ? translatedPosts : [...posts])];
        
        batch.forEach((oldPost, i) => {
          const itemRegex = new RegExp(`\\[ITEM-${i}\\]\\s*TITLE:([\\s\\S]*?)(?=\\[ITEM-|EXCERPT:|\\n|$)`, 'i');
          const excerptRegex = new RegExp(`\\[ITEM-${i}\\][\\s\\S]*?EXCERPT:([\\s\\S]*?)(?=\\[ITEM-|\\n|$)`, 'i');
          
          const titleMatch = fullText.match(itemRegex);
          const excerptMatch = fullText.match(excerptRegex);
          
          const globalIndex = startIndex + i;
          if (updatedTranslatedPosts[globalIndex]) {
             updatedTranslatedPosts[globalIndex] = {
               ...updatedTranslatedPosts[globalIndex],
               title: { ...updatedTranslatedPosts[globalIndex].title, rendered: titleMatch ? titleMatch[1].trim() : oldPost.title.rendered },
               excerpt: { ...updatedTranslatedPosts[globalIndex].excerpt, rendered: excerptMatch ? excerptMatch[1].trim() : oldPost.excerpt.rendered }
             };
          }
        });
        setTranslatedPosts(updatedTranslatedPosts);
      }
    } catch (e) {
      console.error("Batch translate error:", e);
      if (translatedPosts.length === 0) setTranslatedPosts(batch);
    } finally {
      setIsTranslating(false);
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCategoryData(nextPage, true);
  };

  if (loading) {
    return (
      <main className="container">
        <div style={{ padding: '40px 0' }}>
          <div style={{ width: '200px', height: '32px', background: 'var(--border-color)', marginBottom: '30px', borderRadius: '8px' }}></div>
          <GridSkeleton count={8} />
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ marginBottom: '30px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 800 }}>{t('news')}</h1>
        {isTranslating && <span style={{ color: 'var(--accent-color)', fontSize: '14px' }}>AI Translating...</span>}
      </div>

      <section className="grid">
        {(translatedPosts.length > 0 ? translatedPosts : posts).map((post: any, i) => (
          <Link href={`/haber/${post.id}`} key={post.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', opacity: isTranslating && translatedPosts.length === 0 ? 0 : 1 }}>
            <div className="card-img-wrapper">
              <img className="card-img" src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200'} alt={post.title.rendered} />
            </div>
            <div className="card-content">
              <h3 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
              <p className="card-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 110) + '...' }}></p>
              <div className="card-footer">
                <span>{new Date(post.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{t('read_more')} &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '50px', paddingBottom: '30px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-primary"
            style={{ padding: '12px 30px', fontSize: '16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--accent-color)', cursor: loadingMore ? 'not-allowed' : 'pointer' }}
          >
            {loadingMore ? t('loading') : t('load_more')}
          </button>
        </div>
      )}
    </main>
  );
}
