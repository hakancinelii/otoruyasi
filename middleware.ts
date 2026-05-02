import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGS = ['en', 'de', 'ru'];

function getArticleIdFromPath(pathname: string) {
  const match = pathname.match(/^\/(?:en\/|de\/|ru\/)?haber\/(\d+)\/?$/);
  return match?.[1] || null;
}

function buildArticleRedirectPath(pathname: string, slug: string) {
  const langMatch = pathname.match(/^\/(en|de|ru)\/haber\//);
  return `${langMatch ? `/${langMatch[1]}` : ''}/haber/${slug}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find if path starts with a language code
  const lang = SUPPORTED_LANGS.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);
  const articleId = getArticleIdFromPath(pathname);

  if (articleId) {
    try {
      const res = await fetch(`https://cms.otoruyasi.com/wp-json/wp/v2/posts/${articleId}?_fields=slug`);
      if (res.ok) {
        const post = await res.json();
        if (post?.slug) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = buildArticleRedirectPath(pathname, post.slug);
          const response = NextResponse.redirect(redirectUrl, 301);
          if (lang) {
            response.cookies.set('NEXT_LOCALE', lang, {
              path: '/',
              maxAge: 31536000,
            });
          }
          return response;
        }
      }
    } catch {
      // Continue to the page fallback if WordPress is temporarily unavailable.
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (lang) {
    response.cookies.set('NEXT_LOCALE', lang, {
      path: '/',
      maxAge: 31536000,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|logo\\.png|.*\\..*).*)'],
};
