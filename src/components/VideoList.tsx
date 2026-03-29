'use client';

import { useState } from 'react';

type Video = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
};

export default function VideoList({ videos }: { videos: Video[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const closeModal = () => setActiveVideoId(null);

  return (
    <>
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="card" 
            onClick={() => setActiveVideoId(video.id)}
            style={{ display: 'block', cursor: 'pointer', background: '#161b22', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, background 0.2s' }}
          >
            <div className="card-img-wrapper" style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <img 
                className="card-img" 
                src={video.thumbnail} 
                alt={video.title} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,0,0,0.8)', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <div className="card-content" style={{ padding: '20px' }}>
              <h3 className="card-title" style={{ fontSize: '18px', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '44px' }}>{video.title}</h3>
              <div className="card-footer" style={{ borderTop: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{new Date(video.pubDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span style={{ color: '#ff2d2d', fontWeight: 600, fontSize: '14px' }}>Hemen İzle &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Video İzleme Modalı */}
      {activeVideoId && (
        <div 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '32px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              &times;
            </button>
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
