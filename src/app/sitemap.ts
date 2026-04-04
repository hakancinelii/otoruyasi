import { MetadataRoute } from 'next';
import { SITEMAP_CATEGORY_IDS } from '../lib/categoryConfig';

const BASE_URL = 'https://otoruyasi.com';
const LANGS = ['', '/en', '/de', '/ru'];
const POSTS_PER_PAGE = 100;
const MAX_POSTS = 300;
const TOTAL_PAGES = Math.ceil(MAX_POSTS / POSTS_PER_PAGE);

type SitemapPost = {
  id: number;
  modified: string;
};

async function fetchLatestPosts(): Promise<SitemapPost[]> {
  try {
    const responses = await Promise.all(
      Array.from({ length: TOTAL_PAGES }, (_, index) =>
        fetch(
          `https://cms.otoruyasi.com/wp-json/wp/v2/posts?per_page=${POSTS_PER_PAGE}&page=${index + 1}&_fields=id,modified`,
          { next: { revalidate: 3600 } }
        )
      )
    );

    const successfulResponses = responses.filter((response) => response.ok);

    if (successfulResponses.length === 0) {
      return [];
    }

    const pages = await Promise.all(
      successfulResponses.map((response) => response.json() as Promise<SitemapPost[]>)
    );

    return pages.flat().slice(0, MAX_POSTS);
  } catch (error) {
    console.error('Sitemap: Failed to fetch posts', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/karsilastirma', '/videolar', '/instagram',
    '/is-birligi', '/abonelik', '/giris', '/arama',
    '/iletisim', '/gizlilik-politikasi'
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    LANGS.map((lang) => ({
      url: `${BASE_URL}${lang}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  const posts = await fetchLatestPosts();
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) =>
    LANGS.map((lang) => ({
      url: `${BASE_URL}${lang}/haber/${post.id}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  const categoryEntries: MetadataRoute.Sitemap = SITEMAP_CATEGORY_IDS.flatMap((id) =>
    LANGS.map((lang) => ({
      url: `${BASE_URL}${lang}/kategori/${id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...postEntries, ...categoryEntries];
}
