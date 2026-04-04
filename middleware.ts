import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGS = ['en', 'de', 'ru'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Find if the path starts with a language code
  const lang = SUPPORTED_LANGS.find(l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`);

  if (lang) {
    // Determine the rewrite target path
    let targetPath = pathname.replace(`/${lang}`, '') || '/';
    
    // Ensure the target path is clean
    if (targetPath === '') targetPath = '/';

    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    
    // Create the response and set the language cookie
    const response = NextResponse.rewrite(url);
    response.cookies.set('NEXT_LOCALE', lang, {
      path: '/',
      maxAge: 31536000,
    });
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Only match paths that are pages (not static assets, api, etc)
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|logo\\.png|.*\\..*).*)'],
};
