'use client';

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
  if (!posts || posts.length === 0) return null;

  const mosaicItems = posts.slice(0, 4);

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
      {/* 1. Large Main Item (LEFT) */}
      <Link href={`/haber/${mosaicItems[0].id}`} className="mosaic-item mosaic-item-large">
        <img className="mosaic-img" src={getImageUrl(mosaicItems[0])} alt={mosaicItems[0].title.rendered} />
        <div className="mosaic-overlay">
          <span className="mosaic-badge">HABERLER {isTranslating && '...'}</span>
          <h2 className="mosaic-title" dangerouslySetInnerHTML={{ __html: mosaicItems[0].title.rendered }}></h2>
          <div className="mosaic-meta">
            <span>BY {getAuthorName(mosaicItems[0])}</span>
            <span>🕒 {formatDate(mosaicItems[0].date)}</span>
          </div>
        </div>
      </Link>

      {/* 2. Medium Item (TOP RIGHT) */}
      {mosaicItems[1] && (
        <Link href={`/haber/${mosaicItems[1].id}`} className="mosaic-item mosaic-item-medium">
          <img className="mosaic-img" src={getImageUrl(mosaicItems[1])} alt={mosaicItems[1].title.rendered} />
          <div className="mosaic-overlay">
            <span className="mosaic-badge">HABERLER</span>
            <h3 className="mosaic-title" dangerouslySetInnerHTML={{ __html: mosaicItems[1].title.rendered }}></h3>
          </div>
        </Link>
      )}

      {/* 3 & 4 Small Items Group (BOTTOM RIGHT) */}
      <div className="mosaic-item-small-group">
        {mosaicItems[2] && (
          <Link href={`/haber/${mosaicItems[2].id}`} className="mosaic-item mosaic-item-small">
            <img className="mosaic-img" src={getImageUrl(mosaicItems[2])} alt={mosaicItems[2].title.rendered} />
            <div className="mosaic-overlay" style={{ padding: '15px' }}>
              <span className="mosaic-badge" style={{ fontSize: '8px', padding: '2px 6px', marginBottom: '8px' }}>HABERLER</span>
              <h3 className="mosaic-title" title={mosaicItems[2].title.rendered} dangerouslySetInnerHTML={{ __html: mosaicItems[2].title.rendered }}></h3>
            </div>
          </Link>
        )}
        {mosaicItems[3] && (
          <Link href={`/haber/${mosaicItems[3].id}`} className="mosaic-item mosaic-item-small">
            <img className="mosaic-img" src={getImageUrl(mosaicItems[3])} alt={mosaicItems[3].title.rendered} />
            <div className="mosaic-overlay" style={{ padding: '15px' }}>
              <span className="mosaic-badge" style={{ fontSize: '8px', padding: '2px 6px', marginBottom: '8px' }}>HABERLER</span>
              <h3 className="mosaic-title" title={mosaicItems[3].title.rendered} dangerouslySetInnerHTML={{ __html: mosaicItems[3].title.rendered }}></h3>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
