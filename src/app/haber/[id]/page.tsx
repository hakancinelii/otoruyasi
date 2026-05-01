import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import AdBanner from '../../../components/AdBanner';
import HaberContent from '../../../components/HaberContent';

function isNumericIdentifier(value: string) {
  return /^\d+$/.test(value);
}

async function fetchPost(identifier: string) {
  try {
    if (isNumericIdentifier(identifier)) {
      const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts/${identifier}?_embed`, { next: { revalidate: 3600 } });
      if (!res.ok) return null;
      return await res.json();
    }

    const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts?slug=${encodeURIComponent(identifier)}&_embed`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] || null : null;
  } catch {
    return null;
  }
}

function getPostSlug(post: any, fallback: string) {
  return typeof post?.slug === 'string' && post.slug ? post.slug : fallback;
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const post = await fetchPost(params.id);
  
  if (!post || !post.title) return { title: 'Oto Rüyası' };

  const title = post.title.rendered;
  const description = post.excerpt?.rendered?.replace(/<[^>]+>/g, '').substring(0, 160) || '';
  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  const slug = getPostSlug(post, params.id);

  return {
    title: `${title} | Oto Rüyası`,
    description: description,
    alternates: {
      canonical: `https://otoruyasi.com/haber/${slug}`,
      languages: {
        'tr-TR': `https://otoruyasi.com/haber/${slug}`,
        'en-US': `https://otoruyasi.com/en/haber/${slug}`,
        'de-DE': `https://otoruyasi.com/de/haber/${slug}`,
        'ru-RU': `https://otoruyasi.com/ru/haber/${slug}`,
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `https://otoruyasi.com/haber/${slug}`,
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

  if (post && isNumericIdentifier(params.id)) {
    permanentRedirect(`/haber/${getPostSlug(post, params.id)}`);
  }

  return (
    <main>
      <AdBanner slots={['home_top_primary']} maxWidth={1000} />
      <HaberContent id={post?.id ? String(post.id) : params.id} initialPost={post} />
    </main>
  );
}
