import { MetadataRoute } from 'next';

const BASE_URL = 'https://otoruyasi.com';
const LANGS = ['', '/en', '/de', '/ru'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with all language variants
  const staticPages = [
    '', '/karsilastirma', '/videolar', '/instagram', 
    '/is-birligi', '/abonelik', '/giris', '/arama'
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    LANGS.map((lang) => ({
      url: `${BASE_URL}${lang}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' as const : 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // Dynamic pages: fetch recent WordPress posts
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      'https://cms.otoruyasi.com/wp-json/wp/v2/posts?per_page=100&_fields=id,modified',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (res.ok) {
      const posts: { id: number; modified: string }[] = await res.json();
      
      postEntries = posts.flatMap((post) =>
        LANGS.map((lang) => ({
          url: `${BASE_URL}${lang}/haber/${post.id}`,
          lastModified: new Date(post.modified),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      );
    }
  } catch (error) {
    console.error('Sitemap: Failed to fetch posts', error);
  }

  // Dynamic pages: fetch categories
  const categoryIds = ['5', '5802', '7368', '12', '16714', '4'];
  const categoryEntries: MetadataRoute.Sitemap = categoryIds.flatMap((id) =>
    LANGS.map((lang) => ({
      url: `${BASE_URL}${lang}/kategori/${id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...postEntries, ...categoryEntries];
}
