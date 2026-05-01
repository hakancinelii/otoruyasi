'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BreakingPost {
  id: number;
  slug?: string;
  title: { rendered: string };
}

export default function BreakingNews({ language, t }: { language: string, t: any }) {
  const [posts, setPosts] = useState<BreakingPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const res = await fetch('https://cms.otoruyasi.com/wp-json/wp/v2/posts?per_page=10');
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBreaking();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [posts]);

  if (posts.length === 0) return null;

  return (
    <div className="breaking-news-wrapper">
      <div className="breaking-badge">
        <span className="breaking-icon">⚡</span>
        {language === 'tr' ? 'SON DAKİKA' : 'BREAKING NEWS'}
      </div>
      <div className="breaking-content">
        <Link 
          key={posts[currentIndex].id}
          href={`/haber/${posts[currentIndex].slug || posts[currentIndex].id}`}
          className="breaking-link animate-flip-up"
          dangerouslySetInnerHTML={{ __html: posts[currentIndex].title.rendered }}
        />
      </div>
      <div className="breaking-nav">
        <button onClick={() => setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)}>❮</button>
        <button onClick={() => setCurrentIndex((prev) => (prev + 1) % posts.length)}>❯</button>
      </div>
    </div>
  );
}
