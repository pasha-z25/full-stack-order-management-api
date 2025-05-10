import { NextRequest, NextResponse } from 'next/server';
import { authRoutes } from './utils/constants';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0];

  const isAuthRoute = segments.length > 1 && authRoutes.includes(segments[1]);
  const isProtectedRoute = !isAuthRoute;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/:lng*'],
};
