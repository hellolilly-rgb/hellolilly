import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AGE_GATE_COOKIE = 'hl_age_verified';
const PUBLIC_PATHS = ['/legal', '/auth', '/api'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p));
  const isAgeGate = path === '/age-gate';
  const ageVerified = request.cookies.get(AGE_GATE_COOKIE)?.value === 'true';

  if (!ageVerified && !isAgeGate && !isPublicPath && !path.startsWith('/admin')) {
    const redirectUrl = new URL('/age-gate', request.url);
    redirectUrl.searchParams.set('next', path);
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith('/dashboard') && !user) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('next', path);
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith('/admin')) {
    const isAdminLogin = path === '/admin/login';
    if (!isAdminLogin && !user) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('next', path);
      return NextResponse.redirect(redirectUrl);
    }
    if (isAdminLogin && user) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (path.startsWith('/auth/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
