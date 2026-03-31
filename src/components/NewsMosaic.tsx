'use client';

import Link from 'next/link';

interface MosaicPost {
  id: number;
  title: { rendered: string };
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

interface NewsMosaicProps {
  posts: MosaicPost[];
  isTranslating: boolean;
  t: (key: string) => string;
}

export default function NewsMosaic({ posts, isTranslating, t }: NewsMosaicProps) {
  if (!posts || posts.length === 0) return null;

  // We need the first 4 posts for the mosaic
  const mosaicItems = posts.slice(0, 4);

  const getImageUrl = (post: MosaicPost) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <section className="mosaic-container">
      {/* 1. Large Main Item */}
      <Link href={`/haber/${mosaicItems[0].id}`} className="mosaic-item mosaic-item-large">
        <img className="mosaic-img" src={getImageUrl(mosaicItems[0])} alt={mosaicItems[0].title.rendered} />
        <div className="mosaic-overlay">
          <span className="mosaic-badge">{t('featured_news')} {isTranslating && '...'}</span>
          <h2 className="mosaic-title" dangerouslySetInnerHTML={{ __html: mosaicItems[0].title.rendered }}></h2>
        </div>
      </Link>

      {/* Right Side Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* 2. Medium Item */}
        {mosaicItems[1] && (
          <Link href={`/haber/${mosaicItems[1].id}`} className="mosaic-item mosaic-item-medium" style={{ flex: 1 }}>
            <img className="mosaic-img" src={getImageUrl(mosaicItems[1])} alt={mosaicItems[1].title.rendered} />
            <div className="mosaic-overlay">
              <span className="mosaic-badge" style={{ background: '#3498db', color: '#fff' }}>Haber</span>
              <h3 className="mosaic-title" dangerouslySetInnerHTML={{ __html: mosaicItems[1].title.rendered }}></h3>
            </div>
          </Link>
        )}

        {/* 3 & 4 Small Items Group */}
        <div className="mosaic-item-small-group" style={{ flex: 1 }}>
          {mosaicItems[2] && (
            <Link href={`/haber/${mosaicItems[2].id}`} className="mosaic-item">
              <img className="mosaic-img" src={getImageUrl(mosaicItems[2])} alt={mosaicItems[2].title.rendered} />
              <div className="mosaic-overlay">
                <h3 className="mosaic-title" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: mosaicItems[2].title.rendered }}></h3>
              </div>
            </Link>
          )}
          {mosaicItems[3] && (
            <Link href={`/haber/${mosaicItems[3].id}`} className="mosaic-item">
              <img className="mosaic-img" src={getImageUrl(mosaicItems[3])} alt={mosaicItems[3].title.rendered} />
              <div className="mosaic-overlay">
                <h3 className="mosaic-title" style={{ fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: mosaicItems[3].title.rendered }}></h3>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
