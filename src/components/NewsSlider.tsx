'use client';
import Link from 'next/link';

export default function NewsSlider({ posts, t, title }: { posts: any[], t: any, title: string }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="container" style={{ marginBottom: '40px', marginTop: '20px' }}>
      <div className="category-header">
        <div className="category-title-badge" style={{ backgroundColor: 'var(--accent-color)' }}>{title}</div>
      </div>
      
      <div 
        className="news-slider-container" 
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '20px', 
          paddingBottom: '20px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', /* For Firefox */
          msOverflowStyle: 'none' /* For IE/Edge */
        }}
      >
        <style jsx>{`
          .news-slider-container::-webkit-scrollbar { display: none; }
          .slider-card {
            min-width: 280px;
            max-width: 280px;
            scroll-snap-align: start;
            flex-shrink: 0;
            background: var(--card-bg, #1a1a1a);
            border: 1px solid var(--border-color, #333);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s ease;
          }
          .slider-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent-color);
          }
          .slider-card img {
            transition: transform 0.5s ease;
          }
          .slider-card:hover img {
            transform: scale(1.05);
          }
        `}</style>
      
        {posts.map((post: any) => {
          const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
          
          return (
            <Link href={`/haber/${post.slug || post.id}`} key={post.id} className="slider-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ height: '160px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={imageUrl} 
                  alt={post.title.rendered} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', minHeight: '42px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h3>
                <div style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: 800 }}>{t('read_more')}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
