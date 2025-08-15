import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function normalizeLocale(locale: string) {
  return locale.split('-')[0].toLowerCase();
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });

  const locale = normalizeLocale(req.cookies.get('locale')?.value || 'en');
  // 传给下游（Route Handler / 页面）用于渲染
  res.headers.set('x-locale', locale);
  // 告诉 CDN：缓存需按 x-locale 变体区分
  res.headers.append('Vary', 'x-locale');

  return res;
}
