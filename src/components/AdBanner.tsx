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

type AdCategory = {
  id: number;
  slug: string;
  name: string;
};

function decodeHtml(html: string) {
  return html
    .replace(/&#8221;|&#8243;|&rdquo;/g, '"')
    .replace(/&#8220;|&#8242;|&ldquo;/g, '"')
    .replace(/&#8217;|&rsquo;|&#039;/g, "'")
    .replace(/&#8216;|&lsquo;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

function stripParagraphBreaks(html: string) {
  return decodeHtml(html).replace(/<\/?p>/gi, ' ').replace(/<br\s*\/?>/gi, ' ');
}

function stripHtml(html: string) {
  return decodeHtml(html).replace(/<[^>]+>/g, ' ');
}

function normalizeSlot(value: string) {
  return value.trim().toLowerCase();
}

function getSlotValue(post: AdPost) {
  const metaSlot = post.meta?.slot || post.meta?.reklam_slot || post.meta?.ad_slot;
  if (typeof metaSlot === 'string' && metaSlot.trim()) {
    return normalizeSlot(metaSlot);
  }

  const rendered = post.content.rendered || '';
  const rawContent = stripParagraphBreaks(rendered);
  const plainText = stripHtml(rendered);

  const match =
    rawContent.match(/data-slot=["']([^"']+)["']/i) ||
    rawContent.match(/slot\s*[:=]\s*([a-z0-9_\-]+)/i) ||
    plainText.match(/slot\s*[:=]\s*([a-z0-9_\-]+)/i);

  return match?.[1] ? normalizeSlot(match[1]) : '';
}

function getAdLink(rawContent: string) {
  const decoded = decodeHtml(rawContent);
  const urls = decoded.match(/https?:\/\/[^\s<"']+/g) || [];

  const clickUrl = urls.find((url) => url.includes('trackclk'));
  if (clickUrl) return clickUrl;

  const directUrl = urls.find((url) => !url.includes('trackimp') && !url.includes('impression') && !url.includes('.gif'));
  if (directUrl) return directUrl;

  const anchorMatch = decoded.match(/href=["']([^"']+)["']/i);
  if (anchorMatch?.[1]) return anchorMatch[1];

  return '#';
}

function getTrackingMarkup(rawContent: string) {
  const decoded = decodeHtml(rawContent);
  const trackingImage = decoded.match(/<img[^>]+src=["'][^"']*trackimp[^"']*["'][^>]*>/i);
  return trackingImage?.[0] || '';
}

async function fetchAdCategoryId() {
  const res = await fetch('https://cms.otoruyasi.com/wp-json/wp/v2/categories?slug=reklamlar&per_page=1');
  if (!res.ok) return null;

  const data = (await res.json()) as AdCategory[];
  return data[0]?.id || null;
}

async function fetchAds() {
  const categoryId = await fetchAdCategoryId();
  if (!categoryId) {
    console.warn('Reklamlar kategorisi bulunamadı.');
    return [] as AdPost[];
  }

  const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts?categories=${categoryId}&per_page=20&_embed`);
  if (!res.ok) return [] as AdPost[];

  const data = await res.json();
  return Array.isArray(data) ? (data as AdPost[]) : [];
}

function AdItem({ post, maxWidth }: { post: AdPost; maxWidth: number }) {
  const rawContent = decodeHtml(post.content.rendered || '');
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const link = getAdLink(rawContent);
  const trackingMarkup = getTrackingMarkup(rawContent);

  if (imageUrl) {
    return (
      <div className="ad-item" style={{ maxWidth: `min(${maxWidth}px, 100%)` }}>
        <span className="ad-label">Reklam</span>
        <a href={link} target="_blank" rel="noopener noreferrer" className="ad-link">
          <img src={imageUrl} alt={post.title.rendered} className="ad-image" />
        </a>
        {trackingMarkup && <div dangerouslySetInnerHTML={{ __html: trackingMarkup }} className="ad-tracking" />}
      </div>
    );
  }

  if (rawContent) {
    return (
      <div className="ad-item" style={{ maxWidth: `min(${maxWidth}px, 100%)` }}>
        <span className="ad-label">Reklam</span>
        <div
          className="ad-content-raw"
          dangerouslySetInnerHTML={{ __html: rawContent }}
          style={{ width: '100%', overflow: 'hidden' }}
        />
      </div>
    );
  }

  return null;
}

export default function AdBanner({ slots = ['home_top_primary'], layout = 'stack', maxWidth = 1000 }: AdBannerProps) {
  const [adPosts, setAdPosts] = useState<AdPost[]>([]);

  useEffect(() => {
    fetchAds()
      .then((posts) => {
        setAdPosts(posts);
        console.info('Ad slots fetched:', posts.map((post) => ({ id: post.id, title: post.title.rendered, slot: getSlotValue(post) })));
      })
      .catch((error) => console.error(error));
  }, []);

  const filteredAds = useMemo(() => {
    return slots
      .map((slot) => adPosts.find((post) => getSlotValue(post) === normalizeSlot(slot)))
      .filter(Boolean) as AdPost[];
  }, [adPosts, slots]);

  if (!filteredAds.length) return null;

  return (
    <div className="ad-banner-wrapper">
      <div className={layout === 'grid' ? 'ad-grid' : 'ad-stack'}>
        {filteredAds.map((post) => (
          <AdItem key={post.id} post={post} maxWidth={maxWidth} />
        ))}
      </div>

      <style jsx global>{`
        .ad-banner-wrapper {
          text-align: center;
          margin: 40px auto 20px auto;
          width: 100%;
          max-width: 1200px;
          overflow: visible;
          box-sizing: border-box;
          padding: 0 20px;
          contain: layout;
        }

        .ad-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          align-items: start;
        }

        .ad-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .ad-item {
          display: block;
          position: relative;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          margin: 0 auto;
        }

        .ad-label {
          position: absolute;
          top: -15px;
          right: 0;
          background: var(--card-bg);
          padding: 2px 8px;
          font-size: 10px;
          color: var(--text-muted);
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }

        .ad-link {
          display: block;
          width: 100%;
          line-height: 0;
          overflow: visible;
        }

        .ad-image {
          display: block;
          width: auto;
          max-width: 100%;
          height: auto;
          margin: 0 auto;
          object-fit: contain;
          object-position: center;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          box-sizing: border-box;
        }

        .ad-tracking {
          width: 0;
          height: 0;
          overflow: hidden;
          position: absolute;
        }

        @media (max-width: 768px) {
          .ad-banner-wrapper {
            margin: 8px auto 18px auto;
            width: 100% !important;
            max-width: 100vw !important;
            padding: 0 10px !important;
            display: block !important;
            overflow: visible !important;
            box-sizing: border-box !important;
          }

          .ad-stack,
          .ad-grid {
            width: 100% !important;
            max-width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .ad-item {
            width: 100% !important;
            max-width: min(728px, calc(100vw - 20px)) !important;
            margin-left: auto !important;
            margin-right: auto !important;
            display: block !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: visible !important;
          }

          .ad-link {
            width: 100% !important;
            max-width: 100% !important;
            display: block !important;
            overflow: visible !important;
          }

          .ad-image,
          .ad-content-raw img {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            object-fit: contain !important;
            object-position: center !important;
          }

          .ad-content-raw {
            width: 100% !important;
            max-width: min(728px, calc(100vw - 20px)) !important;
            margin-left: auto !important;
            margin-right: auto !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
