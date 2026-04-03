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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(4, posts.length));
    }, 5000);
    return () => clearInterval(timer);
  }, [posts]);

  if (!posts || posts.length === 0) return null;

  const sliderItems = posts.slice(0, 4);

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
    <section className="hero-slider-container" style={{ position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden', height: '500px', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
      {sliderItems.map((post, index) => (
        <div key={post.id} style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: index === currentIndex ? 1 : 0,
          transform: index === currentIndex ? 'scale(1)' : 'scale(1.05)',
          transition: 'opacity 0.8s ease-in-out, transform 3s ease',
          zIndex: index === currentIndex ? 1 : 0,
          pointerEvents: index === currentIndex ? 'auto' : 'none'
        }}>
          <Link href={`/haber/${post.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img src={getImageUrl(post)} alt={post.title.rendered} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', padding: '80px 40px 40px 40px' }}>
              <span style={{ background: 'var(--accent-color)', color: '#000', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, marginBottom: '20px', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                HABERLER {isTranslating && '...'}
              </span>
              <h2 style={{ color: '#fff', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: '20px', lineHeight: '1.25', maxWidth: '850px', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h2>
              <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>👤 {getAuthorName(post)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🕒 {formatDate(post.date)}</span>
              </div>
            </div>
          </Link>
        </div>
      ))}

      {/* Navigation Indicators */}
      <div style={{ position: 'absolute', bottom: '30px', right: '40px', display: 'flex', gap: '10px', zIndex: 10 }}>
        {sliderItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '35px' : '15px',
              height: '8px',
              borderRadius: '4px',
              background: idx === currentIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
            }}
            aria-label={`Slayt ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
