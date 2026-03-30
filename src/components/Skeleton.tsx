import React from 'react';

export const PostSkeleton = () => (
  <div className="card" style={{ height: '400px', opacity: 0.5 }}>
    <div style={{ width: '100%', height: '200px', background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }}></div>
    <div style={{ padding: '20px' }}>
      <div style={{ width: '80%', height: '24px', background: 'var(--border-color)', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}></div>
      <div style={{ width: '100%', height: '40px', background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }}></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid">
    {[...Array(count)].map((_, i) => (
      <PostSkeleton key={i} />
    ))}
    <style jsx global>{`
      @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 0.6; }
        100% { opacity: 0.3; }
      }
    `}</style>
  </div>
);

export const HeroSkeleton = () => (
  <div style={{ width: '100%', height: '500px', background: 'var(--border-color)', borderRadius: '24px', marginBottom: '60px', animation: 'pulse 1.5s infinite' }}>
    <style jsx global>{`
      @keyframes pulse {
        0% { opacity: 0.3; }
        50% { opacity: 0.6; }
        100% { opacity: 0.3; }
      }
    `}</style>
  </div>
);
