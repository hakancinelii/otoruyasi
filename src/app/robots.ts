import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/giris'],
      },
    ],
    sitemap: 'https://otoruyasi-web.vercel.app/sitemap.xml',
  };
}
