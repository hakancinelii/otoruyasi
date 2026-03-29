import Parser from 'rss-parser';

export const revalidate = 3600; // Her 1 saatte bir arka planda feed'i yeniden çek

type Video = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnail: string;
};

async function getVideos() {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:group', 'mediaGroup']
      ]
    }
  });

  try {
    const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?channel_id=UCKt63d3Iw3Zj5m6zjMcByfQ');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return feed.items.map((item: any) => {
      const videoId = item.id.replace('yt:video:', '');
      return {
        id: videoId,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }) as Video[];
  } catch (error) {
    console.error('RSS parse error:', error);
    return [];
  }
}

export default async function VideolarPage() {
  const videos = await getVideos();

  if (!videos || videos.length === 0) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '150px 20px', color: '#ff5722' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Videolar Yüklenemedi</div>
          <p>Şu an YouTube sisteminden videolar çekilemiyor, lütfen daha sonra tekrar deneyin.</p>
        </div>
      </main>
    );
  }

  // En son yayınlanandan eskiye sıralama işlemi
  const sortedVideos = videos.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return (
    <main className="container">
      <div style={{ marginBottom: '40px', marginTop: '40px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '36px', margin: 0, fontWeight: 800 }}>Oto Rüyası Test Videoları</h1>
        <a href="https://www.youtube.com/@hakkgunerkan9576" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#ff0000', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          Kanalımıza Abone Olun
        </a>
      </div>

      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {sortedVideos.map((video) => (
          <a href={video.link} key={video.id} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: '#161b22', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s, background 0.2s' }}>
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
                <span style={{ color: '#ff2d2d', fontWeight: 600, fontSize: '14px' }}>YouTube'da İzle &rarr;</span>
              </div>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
