'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GridSkeleton } from '../../components/Skeleton';
import { useLanguage } from '../../context/LanguageContext';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useLanguage();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchSearchResults = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else {
        setLoading(true);
      }

      const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&_embed&per_page=30&page=${pageNum}`);
      
      if (!res.ok) {
        if (res.status === 400) setHasMore(false);
        throw new Error(t('no_content'));
      }
      
      const data = await res.json();
      
      if (data.length < 30) setHasMore(false);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...data]);
      } else {
        setPosts(data);
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
    if (query) {
      setPage(1);
      setHasMore(true);
      setPosts([]);
      fetchSearchResults(1);
    } else {
      setLoading(false);
      setHasMore(false);
      setPosts([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSearchResults(nextPage, true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (post: any) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  if (loading) {
    return <GridSkeleton count={6} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>&quot;{query}&quot; {t('no_content')}</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '30px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 800 }}>&quot;{query}&quot; {t('search_results')}</h1>
      </div>

      <section className="grid">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {posts.map((post: any) => (
          <Link href={`/haber/${post.id}`} key={post.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="card-img-wrapper">
              <img className="card-img" src={getImageUrl(post)} alt={post.title.rendered} />
            </div>
            <div className="card-content">
              <h3 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
              <p className="card-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 110) + '...' }}></p>
              <div className="card-footer">
                <span>{new Date(post.date).toLocaleDateString('tr-TR')}</span>
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
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="container">
      <Suspense fallback={<div style={{ paddingTop: '80px' }}><GridSkeleton count={6} /></div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
