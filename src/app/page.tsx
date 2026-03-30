'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GridSkeleton, HeroSkeleton } from '../components/Skeleton';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRealData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      
      const limit = isLoadMore ? 30 : 31; // İlk sayfada hero alanı için 1 fazlalık çekiliyor
      const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts?_embed&per_page=${limit}&page=${pageNum}`);
      
      if (!res.ok) {
        if (res.status === 400) setHasMore(false);
        throw new Error('API yanıt vermedi veya içerik kalmadı.');
      }
      
      const data = await res.json();
      
      if (data.length < limit) setHasMore(false);

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
    fetchRealData(1);
  }, []);

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

  if (!posts || posts.length === 0) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '20px', fontWeight: 600 }}>Maalesef şu an içeriklere ulaşılamıyor.</div>
        </div>
      </main>
    );
  }

  const heroPost = posts[0];
  const gridPosts = posts.slice(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          <span className="hero-badge">Öne Çıkan Haber</span>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: heroPost.title.rendered }}></h1>
          <p className="hero-excerpt" dangerouslySetInnerHTML={{ __html: heroPost.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 150) + '...' }}></p>
        </div>
      </Link>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
        <h2 style={{ fontSize: '28px', margin: 0 }}>Son Haberler</h2>
      </div>

      {/* Grid Posts */}
      <section className="grid">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {gridPosts.map((post: any) => {
          return (
          <Link href={`/haber/${post.id}`} key={post.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="card-img-wrapper">
              <img className="card-img" src={getImageUrl(post)} alt={post.title.rendered} />
            </div>
            <div className="card-content">
              <h3 className="card-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
              <p className="card-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 110) + '...' }}></p>
              <div className="card-footer">
                <span>{new Date(post.date).toLocaleDateString('tr-TR')}</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>İncele &rarr;</span>
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
            style={{ padding: '12px 30px', fontSize: '16px', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', cursor: loadingMore ? 'not-allowed' : 'pointer' }}
          >
            {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Göster'}
          </button>
        </div>
      )}
    </main>
  );
}
