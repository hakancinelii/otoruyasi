import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGS = ['en', 'de', 'ru'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname starts with a supported language prefix
  const langPrefix = SUPPORTED_LANGS.find(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  if (langPrefix) {
    // Strip the language prefix and rewrite to the base route
    const strippedPath = pathname.replace(`/${langPrefix}`, '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = strippedPath;

    const response = NextResponse.rewrite(url);
    // Set cookie so LanguageContext knows the language
    response.cookies.set('NEXT_LOCALE', langPrefix, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  }

  // All other paths (Turkish = default) pass through untouched
  return NextResponse.next();
}

export const config = {
  // Only run middleware on page routes, skip API/static/assets
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|logo\\.png|.*\\..*).*)',],
};
