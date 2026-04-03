'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SidebarPost {
  id: number;
  title: { rendered: string };
  date: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
  };
}

interface SidebarCategorySectionProps {
  categoryId: string;
  title: string;
  language: string;
  t: any;
}

export default function SidebarCategorySection({ categoryId, title, language, t }: SidebarCategorySectionProps) {
  const [posts, setPosts] = useState<SidebarPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts?categories=${categoryId}&_embed&per_page=4`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  if (loading || posts.length === 0) return null;

  const firstPost = posts[0];
  const otherPosts = posts.slice(1);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getImageUrl = (post: SidebarPost) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200';
  };

  return (
    <div className="sidebar-section" style={{ marginBottom: '40px' }}>
      <div style={{ 
        backgroundColor: '#2b65ec', 
        color: '#fff', 
        padding: '10px 15px', 
        fontWeight: 800, 
        fontSize: '14px', 
        marginBottom: '10px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderRadius: '4px 4px 0 0'
      }}>
        <span>{title}</span>
        <Link href={`/kategori/${categoryId}`} style={{ fontSize: '10px', color: '#fff', opacity: 0.8 }}>ALL</Link>
      </div>
      
      {/* Big Card - First Post */}
      <Link href={`/haber/${firstPost.id}`} style={{ display: 'block', position: 'relative', height: '180px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        <img 
          src={getImageUrl(firstPost)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt={firstPost.title.rendered}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '15px' }}>
          <h4 style={{ color: '#fff', margin: 0, fontSize: '13px', fontWeight: 700, lineHeight: '1.3' }} dangerouslySetInnerHTML={{ __html: firstPost.title.rendered }}></h4>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '6px' }}>🕒 {formatDate(firstPost.date)}</div>
        </div>
      </Link>

      {/* Small Items - Rest of Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {otherPosts.map(post => (
          <Link key={post.id} href={`/haber/${post.id}`} className="sidebar-item-link" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '85px', height: '65px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <img 
                src={getImageUrl(post)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt={post.title.rendered}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h5 style={{ margin: 0, fontSize: '12px', fontWeight: 700, lineHeight: '1.4', color: 'var(--text-color)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: post.title.rendered }}></h5>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>{formatDate(post.date)}</div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .sidebar-item-link:hover h5 {
          color: var(--accent-color) !important;
        }
      `}</style>
    </div>
  );
}
