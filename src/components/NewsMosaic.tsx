'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MosaicPost {
  id: number;
  title: { rendered: string };
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'author'?: Array<{ name: string }>;
  };
}

interface NewsMosaicProps {
  posts: MosaicPost[];
  isTranslating: boolean;
  t: any;
}

export default function NewsMosaic({ posts, isTranslating, t }: NewsMosaicProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // We need at least 4 items. Ideally 7 (4 for slider, 3 for static right side)
  if (!posts || posts.length === 0) return null;

  const sliderItems = posts.slice(0, 4); // For the big left section
  const staticItems = posts.slice(4, 7); // For the right side sections (1 medium, 2 small)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderItems.length]);


  const getImageUrl = (post: MosaicPost) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  const getAuthorName = (post: MosaicPost) => {
    return post._embedded?.['author']?.[0]?.name || 'ADMIN';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <section className="mosaic-container">
      {/* 1. Large Main Item (LEFT) - NOW A SLIDER */}
      <div className="mosaic-item mosaic-item-large" style={{ position: 'relative', overflow: 'hidden' }}>
        {sliderItems.map((post, index) => (
          <div key={post.id} style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            zIndex: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none'
          }}>
            <Link href={`/haber/${post.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
              <img className="mosaic-img" src={getImageUrl(post)} alt={post.title.rendered} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="mosaic-overlay">
                <span className="mosaic-badge">HABERLER {isTranslating && '...'}</span>
                <h2 className="mosaic-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h2>
                <div className="mosaic-meta">
                  <span>BY {getAuthorName(post)}</span>
                  <span>🕒 {formatDate(post.date)}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
        {/* Navigation Indicators inside the left slider */}
        <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', gap: '8px', zIndex: 10 }}>
          {sliderItems.map((_, idx) => (
            <button 
              key={idx} 
              onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
              style={{ 
                width: idx === currentIndex ? '30px' : '10px', 
                height: '8px', 
                borderRadius: '4px', 
                background: idx === currentIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.5)', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} 
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Medium Item (TOP RIGHT) */}
      {staticItems[0] ? (
        <Link href={`/haber/${staticItems[0].id}`} className="mosaic-item mosaic-item-medium">
          <img className="mosaic-img" src={getImageUrl(staticItems[0])} alt={staticItems[0].title.rendered} />
          <div className="mosaic-overlay">
            <span className="mosaic-badge">HABERLER</span>
            <h3 className="mosaic-title" dangerouslySetInnerHTML={{ __html: staticItems[0].title.rendered }}></h3>
          </div>
        </Link>
      ) : (
        <div className="mosaic-item mosaic-item-medium" style={{ background: '#111' }}></div>
      )}

      {/* 3 & 4 Small Items Group (BOTTOM RIGHT) */}
      <div className="mosaic-item-small-group">
        {staticItems[1] ? (
          <Link href={`/haber/${staticItems[1].id}`} className="mosaic-item mosaic-item-small">
            <img className="mosaic-img" src={getImageUrl(staticItems[1])} alt={staticItems[1].title.rendered} />
            <div className="mosaic-overlay" style={{ padding: '15px' }}>
              <span className="mosaic-badge" style={{ fontSize: '8px', padding: '2px 6px', margin: '0 0 8px 0' }}>HABERLER</span>
              <h3 className="mosaic-title" style={{ fontSize: '13px' }} title={staticItems[1].title.rendered} dangerouslySetInnerHTML={{ __html: staticItems[1].title.rendered }}></h3>
            </div>
          </Link>
        ) : (
          <div className="mosaic-item mosaic-item-small" style={{ background: '#111' }}></div>
        )}

        {staticItems[2] ? (
          <Link href={`/haber/${staticItems[2].id}`} className="mosaic-item mosaic-item-small">
            <img className="mosaic-img" src={getImageUrl(staticItems[2])} alt={staticItems[2].title.rendered} />
            <div className="mosaic-overlay" style={{ padding: '15px' }}>
              <span className="mosaic-badge" style={{ fontSize: '8px', padding: '2px 6px', margin: '0 0 8px 0' }}>HABERLER</span>
              <h3 className="mosaic-title" style={{ fontSize: '13px' }} title={staticItems[2].title.rendered} dangerouslySetInnerHTML={{ __html: staticItems[2].title.rendered }}></h3>
            </div>
          </Link>
        ) : (
          <div className="mosaic-item mosaic-item-small" style={{ background: '#111' }}></div>
        )}
      </div>
    </section>
  );
}
