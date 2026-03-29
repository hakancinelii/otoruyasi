'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KategoriPage({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchCategoryData = async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts?categories=${params.id}&_embed&per_page=30&page=${pageNum}`);
      
      if (!res.ok) {
        if (res.status === 400) setHasMore(false);
        throw new Error('API yanıt vermedi veya içerik kalmadı.');
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
    fetchCategoryData(1);
  }, [params.id]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCategoryData(nextPage, true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (post: any) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '150px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Kategori Haberleri Çekiliyor...</div>
          <p>Lütfen bekleyin, veritabanına doğrudan bağlanılıyor.</p>
        </div>
      </main>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '150px 20px', color: '#ff5722' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Bu Kategoride Haber Bulunamadı</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ marginBottom: '30px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 800 }}>Kategori İçerikleri</h1>
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
                <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>İncele &rarr;</span>
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
            style={{ padding: '12px 30px', fontSize: '16px', background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', cursor: loadingMore ? 'not-allowed' : 'pointer' }}
          >
            {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Göster'}
          </button>
        </div>
      )}
    </main>
  );
}
