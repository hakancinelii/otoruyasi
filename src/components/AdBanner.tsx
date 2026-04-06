'use client';
import { useEffect, useMemo, useState } from 'react';

type AdBannerProps = {
  slots?: string[];
  layout?: 'stack' | 'grid';
  maxWidth?: number;
};

type AdPost = {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  meta?: Record<string, string>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
};

const AD_CATEGORY_ID = 20723;

function decodeHtml(html: string) {
  return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

function getSlotValue(post: AdPost) {
  const metaSlot = post.meta?.slot || post.meta?.reklam_slot || post.meta?.ad_slot;
  if (typeof metaSlot === 'string' && metaSlot.trim()) return metaSlot.trim();

  const rawContent = decodeHtml(post.content.rendered || '');
  const match = rawContent.match(/data-slot=["']([^"']+)["']/i) || rawContent.match(/slot:\s*([a-z0-9_\-]+)/i);
  return match?.[1]?.trim() || '';
}

function getAdLink(rawContent: string) {
  const urls = rawContent.match(/https?:\/\/[^\s<"']+/g) || [];
  for (const url of urls) {
    if (!url.includes('trackimp') && !url.includes('impression') && !url.includes('.gif')) {
      return url;
    }
  }
  return '#';
}

function AdItem({ post, maxWidth }: { post: AdPost; maxWidth: number }) {
  const rawContent = decodeHtml(post.content.rendered || '');
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  if (imageUrl) {
    const link = getAdLink(rawContent);
    return (
      <div style={{ display: 'inline-block', position: 'relative', width: '100%', maxWidth }}>
        <span style={{ position: 'absolute', top: '-15px', right: '0', background: 'var(--card-bg)', padding: '2px 8px', fontSize: '10px', color: 'var(--text-muted)', borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>Reklam</span>
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          <img src={imageUrl} alt={post.title.rendered} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
        </a>
        <div dangerouslySetInnerHTML={{ __html: rawContent }} style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }} />
      </div>
    );
  }

  if (rawContent) {
    return (
      <div style={{ display: 'inline-block', position: 'relative', width: '100%', maxWidth }}>
        <span style={{ position: 'absolute', top: '-15px', right: '0', background: 'var(--card-bg)', padding: '2px 8px', fontSize: '10px', color: 'var(--text-muted)', borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>Reklam</span>
        <div dangerouslySetInnerHTML={{ __html: rawContent }} />
      </div>
    );
  }

  return null;
}

export default function AdBanner({ slots = ['home_top_primary'], layout = 'stack', maxWidth = 1000 }: AdBannerProps) {
  const [adPosts, setAdPosts] = useState<AdPost[]>([]);

  useEffect(() => {
    fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts?categories=${AD_CATEGORY_ID}&per_page=12&_embed`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdPosts(data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const filteredAds = useMemo(() => {
    return slots
      .map((slot) => adPosts.find((post) => getSlotValue(post) === slot))
      .filter(Boolean) as AdPost[];
  }, [adPosts, slots]);

  if (!filteredAds.length) return null;

  const wrapperStyle = layout === 'grid'
    ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }
    : { display: 'flex', flexDirection: 'column' as const, gap: '20px', alignItems: 'center' };

  return (
    <div className="container ad-banner-wrapper" style={{ textAlign: 'center', margin: '40px auto 20px auto' }}>
      <div style={wrapperStyle}>
        {filteredAds.map((post) => (
          <AdItem key={post.id} post={post} maxWidth={maxWidth} />
        ))}
      </div>
    </div>
  );
}
