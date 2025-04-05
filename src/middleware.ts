import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Check auth status for protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/protected');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  if (isProtectedRoute && !session) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (isAuthRoute && session) {
    // Redirect authenticated users to dashboard
    return NextResponse.redirect(new URL('/protected/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/protected/:path*', '/auth'],
};
