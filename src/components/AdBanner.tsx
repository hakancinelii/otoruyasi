'use client';
import { useState, useEffect } from 'react';

export default function AdBanner() {
  const [adPost, setAdPost] = useState<any>(null);

  useEffect(() => {
    // 20723 is the ID for the "Reklamlar" category
    fetch('https://cms.otoruyasi.com/wp-json/wp/v2/posts?categories=20723&per_page=1&_embed')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setAdPost(data[0]);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  if (!adPost) return null;

  const contentStr = adPost.content.rendered;
  const imageUrl = adPost._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  // Decode potential HTML entities if they pasted HTML in the visual editor
  const decodeHtml = (html: string) => {
    return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  };

  const rawContent = decodeHtml(contentStr);

  // If there's a featured image uploaded
  if (imageUrl) {
    // Try to extract just text link from content string if they pasted a pure URL
    let link = contentStr.replace(/<[^>]+>/g, '').trim();
    if (!link.startsWith('http')) link = '#';
    
    return (
      <div className="container ad-banner-wrapper" style={{ textAlign: 'center', margin: '40px auto 20px auto' }}>
        <div style={{ display: 'inline-block', position: 'relative', width: '100%', maxWidth: '1000px' }}>
          <span style={{ position: 'absolute', top: '-15px', right: '0', background: 'var(--card-bg)', padding: '2px 8px', fontSize: '10px', color: 'var(--text-muted)', borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>Reklam</span>
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
            <img src={imageUrl} alt={adPost.title.rendered} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
          </a>
          {/* Render content anyway, but hidden, just in case there are 1x1 tracking pixels inside it */}
          <div dangerouslySetInnerHTML={{ __html: rawContent }} style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }} />
        </div>
      </div>
    );
  }

  // If they only pasted HTML (like google adsense or doubleclick full ad tag)
  if (contentStr) {
    return (
      <div className="container ad-banner-wrapper" style={{ textAlign: 'center', margin: '40px auto 20px auto' }}>
        <div style={{ display: 'inline-block', position: 'relative', width: '100%', maxWidth: '1000px' }}>
          <span style={{ position: 'absolute', top: '-15px', right: '0', background: 'var(--card-bg)', padding: '2px 8px', fontSize: '10px', color: 'var(--text-muted)', borderTopLeftRadius: '5px', borderTopRightRadius: '5px' }}>Reklam</span>
          <div dangerouslySetInnerHTML={{ __html: rawContent }} />
        </div>
      </div>
    );
  }

  return null;
}
