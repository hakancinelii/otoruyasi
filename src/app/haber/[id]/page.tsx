import { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';
import HaberContent from '../../../components/HaberContent';

// Helper to check for recent news
const isRecentNews = (dateStr: string) => {
  const postDate = new Date(dateStr);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 28;
};

async function fetchPost(id: string) {
  try {
    const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts/${id}?_embed`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchPost(params.id);
  
  if (!post || !post.title) return { title: 'Oto Rüyası' };

  const title = post.title.rendered;
  const description = post.excerpt?.rendered?.replace(/<[^>]+>/g, '').substring(0, 160) || '';
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

  return {
    title: `${title} | Oto Rüyası`,
    description: description,
    alternates: {
      canonical: `https://otoruyasi.com/haber/${params.id}`,
      languages: {
        'tr-TR': `https://otoruyasi.com/haber/${params.id}`,
        'en-US': `https://otoruyasi.com/en/haber/${params.id}`,
        'de-DE': `https://otoruyasi.com/de/haber/${params.id}`,
        'ru-RU': `https://otoruyasi.com/ru/haber/${params.id}`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `https://otoruyasi.com/haber/${params.id}`,
      siteName: 'Oto Rüyası',
      images: imageUrl ? [{ url: imageUrl }] : [],
      locale: 'tr_TR',
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    }
  };
}

export default async function HaberDetayPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  
  return (
    <main>
      <HaberContent id={params.id} initialPost={post} />
    </main>
  );
}
