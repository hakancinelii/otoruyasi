import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGS = ['en', 'de', 'ru'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find if path starts with a language code
  const lang = SUPPORTED_LANGS.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);

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
