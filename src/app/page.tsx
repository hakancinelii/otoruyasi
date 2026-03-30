'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GridSkeleton, HeroSkeleton } from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [translatedPosts, setTranslatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { language, t } = useLanguage();

  const [heroTitle, setHeroTitle] = useState('');
  const [heroExcerpt, setHeroExcerpt] = useState('');
  const [isTranslatingHero, setIsTranslatingHero] = useState(false);
  const [isTranslatingGrid, setIsTranslatingGrid] = useState(false);

  const fetchRealData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);

      const limit = isLoadMore ? 30 : 31;
      const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts?_embed&per_page=${limit}&page=${pageNum}`);

      if (!res.ok) {
        if (res.status === 400) setHasMore(false);
        throw new Error(t('no_content'));
      }

      const data = await res.json();
      if (data.length < limit) setHasMore(false);

      if (isLoadMore) {
        const newPosts = [...posts, ...data];
        setPosts(newPosts);
        if (language !== 'tr') {
          translateGridBatch(data, newPosts.length - data.length);
        } else {
          setTranslatedPosts(newPosts);
        }
      } else {
        setPosts(data);
        if (language === 'tr') {
          setTranslatedPosts(data);
          setHeroTitle(data[0].title.rendered);
          setHeroExcerpt(data[0].excerpt.rendered);
        } else {
          // Dil zaten farklıysa içerikleri temizle ve çeviri başlat
          setHeroTitle('');
          setHeroExcerpt('');
          setTranslatedPosts([]); 
          translateHero(data[0], language);
          translateGridBatch(data.slice(1), 1);
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
    fetchRealData(page);
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      if (language !== 'tr') {
        translateHero(posts[0], language);
        translateGridBatch(posts.slice(1), 1);
      } else {
        setHeroTitle(posts[0].title.rendered);
        setHeroExcerpt(posts[0].excerpt.rendered);
        setTranslatedPosts(posts);
      }
    }
  }, [language]);

  const translateHero = async (post: any, lang: string) => {
    setIsTranslatingHero(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `TITLE: ${post.title.rendered} \n\n EXCERPT: ${post.excerpt.rendered}`,
          targetLang: lang
        })
      });
      const data = await res.json();
      if (data.translatedText) {
        const fullText = data.translatedText;
        const titleMatch = fullText.match(/TITLE:([\s\S]*?)EXCERPT:/i);
        const excerptMatch = fullText.match(/EXCERPT:([\s\S]*)/i);
        
        if (titleMatch && excerptMatch) {
          setHeroTitle(titleMatch[1].trim());
          setHeroExcerpt(excerptMatch[1].trim());
        } else {
          setHeroTitle(fullText.substring(0, 100));
          setHeroExcerpt(fullText.substring(100, 300));
        }
      }
    } catch (e) {
      console.error(e);
      setHeroTitle(post.title.rendered);
      setHeroExcerpt(post.excerpt.rendered);
    } finally {
      setIsTranslatingHero(false);
    }
  }

  const translateGridBatch = async (batch: any[], startIndex: number) => {
    if (batch.length === 0) return;
    setIsTranslatingGrid(true);
    
    // Toplu çeviri için veriyi hazırla
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
      if (translatedPosts.length === 0) setTranslatedPosts(posts); // Hata durumunda orijinalleri bas
    } finally {
      setIsTranslatingGrid(false);
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRealData(nextPage, true);
  };

  if (loading) {
    return (
      <main className="container">
        <HeroSkeleton />
        <GridSkeleton count={6} />
      </main>
    );
  }

  const heroPost = posts[0];
  const displayPosts = (translatedPosts.length > 0 ? translatedPosts : posts).slice(1);

  const getImageUrl = (post: any) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <main className="container">
      {/* Hero Section */}
      <Link href={`/haber/${heroPost.id}`} className="hero" style={{ display: 'block', textDecoration: 'none' }}>
        <img className="hero-img" src={getImageUrl(heroPost)} alt={heroPost.title.rendered} />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">{t('featured_news')} {isTranslatingHero && '...'}</span>
          {isTranslatingHero && !heroTitle ? (
            <div style={{ width: '80%', height: '40px', background: 'rgba(255,255,255,0.1)', marginBottom: '15px' }}></div>
          ) : (
            <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: heroTitle || heroPost.title.rendered }}></h1>
          )}
          <p className="hero-excerpt" dangerouslySetInnerHTML={{ __html: (heroExcerpt || heroPost.excerpt.rendered).replace(/<[^>]+>/g, '').substring(0, 180) + '...' }}></p>
        </div>
      </Link>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
        <h2 style={{ fontSize: '28px', margin: 0 }}>{t('last_news')}</h2>
        {isTranslatingGrid && <span style={{ color: 'var(--accent-color)', fontSize: '14px' }}>AI Translating...</span>}
      </div>

      {/* Grid Posts */}
      <section className="grid">
        {displayPosts.map((post: any) => {
          return (
            <Link href={`/haber/${post.id}`} key={post.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', opacity: isTranslatingGrid ? 0.7 : 1 }}>
              <div className="card-img-wrapper">
                <img className="card-img" src={getImageUrl(post)} alt={post.title.rendered} />
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
          );
        })}
      </section>

      {/* Pagination Load More */}
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
