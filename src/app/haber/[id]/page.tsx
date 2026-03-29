'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HaberDetay({ params }: { params: { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRealPost() {
      try {
        const res = await fetch(`https://otoruyasi.com/wp-json/wp/v2/posts/${params.id}?_embed`);
        if (!res.ok) throw new Error('API yanıt vermedi.');
        const data = await res.json();
        setPost(data);
      } catch (error) {
        console.error('Hata:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRealPost();
  }, [params.id]);

  if (loading) {
    return (
      <article className="container" style={{ padding: '150px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '24px' }}>Gerçek Haber İçeriği Yükleniyor...</div>
      </article>
    );
  }

  if (!post) {
    return (
      <article className="container" style={{ padding: '150px 20px', textAlign: 'center', color: '#ff5722' }}>
        <div style={{ fontSize: '24px' }}>Haber Bulunamadı</div>
      </article>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getImageUrl = (p: any) => {
    return p._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };
  
  const imageUrl = getImageUrl(post);
  
  const content = post.content.rendered;
  const paragraphs = content.split('</p>');
  
  const isPremiumRequired = paragraphs.length > 2;
  const freeContent = isPremiumRequired ? paragraphs.slice(0, 2).join('</p>') + '</p>' : content;

  return (
    <article className="container" style={{ paddingBottom: '100px' }}>
      <header className="article-header">
        <div className="article-meta">
          {new Date(post.date).toLocaleDateString('tr-TR')} • OTO RÜYASI EDİTÖRÜ
        </div>
        <h1 className="article-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h1>
      </header>
      
      <img className="article-featured-img" src={imageUrl} alt={post.title.rendered} />
      
      <div className="article-content" dangerouslySetInnerHTML={{ __html: freeContent }}></div>

      {isPremiumRequired && (
        <div className="paywall-container">
          <div className="paywall-box">
            <h2 className="paywall-title">Bu İçerik OTO RÜYASI Premium Üyelerine Özeldir</h2>
            <p className="paywall-desc">Otomobil dünyasının kalbine inen özel dosya konularını, detaylı sürüş testlerini ve reklamsız dergi deneyimini yaşamak için Premium'a geçin veya abone girişi yapın.</p>
            <Link href="/abonelik" className="btn-premium">Premium Abone Ol</Link>
          </div>
        </div>
      )}
    </article>
  );
}
