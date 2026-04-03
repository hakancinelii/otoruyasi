'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GridSkeleton, HeroSkeleton } from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import NewsMosaic from '../components/NewsMosaic';
import AdBanner from '../components/AdBanner';
import CategorySection from '../components/CategorySection';
import BreakingNews from '../components/BreakingNews';
import NewsSlider from '../components/NewsSlider';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [translatedPosts, setTranslatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { language, t } = useLanguage();

  const [isTranslatingMosaic, setIsTranslatingMosaic] = useState(false);
  const [isTranslatingGrid, setIsTranslatingGrid] = useState(false);

  const fetchRealData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);

      const limit = isLoadMore ? 30 : 31;
      const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts?_embed&per_page=${limit}&page=${pageNum}`);

      if (!res.ok) {
        if (res.status === 400) setHasMore(false);
        throw new Error(t('no_content'));
      }

      const data = await res.json();
      if (data.length < limit) setHasMore(false);

      if (isLoadMore) {
        setPosts(prevPosts => {
          const newPosts = [...prevPosts, ...data];
          if (language !== 'tr') {
            translateBatch(data, newPosts.length - data.length);
          } else {
            setTranslatedPosts(newPosts);
          }
          return newPosts;
        });
      } else {
        setPosts(data);
        if (language === 'tr') {
          setTranslatedPosts(data);
        } else {
          setTranslatedPosts([]);
          translateBatch(data.slice(0, 4), 0, true);
          translateBatch(data.slice(4), 4, false);
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
        translateBatch(posts.slice(0, 4), 0, true);
        translateBatch(posts.slice(4), 4, false);
      } else {
        setTranslatedPosts(posts);
      }
    }
  }, [language]);

  const translateBatch = async (batch: any[], startIndex: number, isMosaic = false) => {
    if (batch.length === 0) return;
    if (isMosaic) setIsTranslatingMosaic(true); else setIsTranslatingGrid(true);

    // Toplu çeviri havuzu
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

        setTranslatedPosts(prev => {
          const updated = [...(prev.length === posts.length ? prev : [...posts])];
          batch.forEach((oldPost, i) => {
            // More robust regex: Case insensitive, handles extra spaces, handles optional quotes
            const itemRegex = new RegExp(`\\[ITEM[-_\\s]?${i}\\]\\s*(?:TITLE|Title):([\\s\\S]*?)(?=\\[ITEM-|\\n|$)`, 'i');
            const titleMatch = fullText.match(itemRegex);
            const globalIndex = startIndex + i;
            if (updated[globalIndex]) {
              updated[globalIndex] = {
                ...updated[globalIndex],
                title: {
                  ...updated[globalIndex].title,
                  rendered: titleMatch ? titleMatch[1].replace(/\"/g, '').trim() : oldPost.title.rendered
                }
              };
            }
          });
          return updated;
        });
      }
    } catch (e) {
      console.error("Batch translate error:", e);
    } finally {
      if (isMosaic) setIsTranslatingMosaic(false); else setIsTranslatingGrid(false);
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

  const currentData = translatedPosts.length > 0 ? translatedPosts : posts;
  const mosaicPosts = currentData.slice(0, 7); // 4 for slider, 3 for static right
  const sliderPosts = currentData.slice(7, 17); // 10 posts for horizontal slider
  const gridPosts = currentData.slice(17); // rest for bottom grid

  const getImageUrl = (post: any) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <main className="container" style={{ paddingBottom: '100px' }}>

      {/* Mosaic/Hero Section */}
      <NewsMosaic
        posts={mosaicPosts}
        isTranslating={isTranslatingMosaic}
        t={t}
      />

      <AdBanner />

      {/* Breaking News Ticker Section */}
      <BreakingNews language={language} t={t} />

      {/* Horizontal News Slider Section */}
      <NewsSlider posts={sliderPosts} title={language === 'tr' ? 'Haberler' : 'News'} t={t} />

      {/* Featured Categories Titles */}
      <CategorySection
        categoryId="16714"
        title={language === 'tr' ? 'Elektrikli Araçlar' : 'Electric Vehicles'}
        language={language}
        t={t}
      />

      <CategorySection
        categoryId="5"
        title={language === 'tr' ? 'Test Sürüşleri' : 'Test Drives'}
        language={language}
        t={t}
      />

      <CategorySection
        categoryId="7368"
        title={language === 'tr' ? 'Motor Sporları' : 'Motorsports'}
        language={language}
        t={t}
      />

      <CategorySection
        categoryId="12"
        title={language === 'tr' ? 'Röportajlar' : 'Interviews'}
        language={language}
        t={t}
      />

      <CategorySection
        categoryId="9"
        title={language === 'tr' ? 'Teknoloji' : 'Technology'}
        language={language}
        t={t}
      />

      <CategorySection
        categoryId="3"
        title={language === 'tr' ? 'Gündem' : 'Agenda'}
        language={language}
        t={t}
      />

      <CategorySection
        categoryId="5802"
        title={language === 'tr' ? 'Kampanyalar' : 'Campaigns'}
        language={language}
        t={t}
      />

      {/* Last News Grid */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '100px' }}>
        <h2 style={{ fontSize: '32px', margin: 0, fontWeight: 800 }}>{t('last_news')}</h2>
        {(isTranslatingGrid || isTranslatingMosaic) && <span style={{ color: 'var(--accent-color)', fontSize: '14px' }}>AI {t('translating')}...</span>}
      </div>

      <section className="grid">
        {gridPosts.map((post: any) => {
          return (
            <Link href={`/haber/${post.id}`} key={post.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s' }}>
              <div className="card-img-wrapper">
                <img className="card-img" src={getImageUrl(post)} alt={post.title.rendered} />
              </div>
              <div className="card-content">
                <h3 className="card-title" style={{ fontSize: '18px', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
                <p className="card-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 110) + '...' }}></p>
                <div className="card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
                  <span>{new Date(post.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{t('read_more')}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Pagination Load More */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-primary"
            style={{ padding: '16px 50px', fontSize: '18px', fontWeight: 800, background: 'var(--accent-color)', color: '#000', cursor: loadingMore ? 'not-allowed' : 'pointer', border: 'none', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            {loadingMore ? t('loading') : t('load_more')}
          </button>
        </div>
      )}
    </main>
  );
}
