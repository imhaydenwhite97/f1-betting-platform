import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth status for protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/protected');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  if (isProtectedRoute && !session) {
    // Redirect unauthenticated users to login page
    const redirectUrl = new URL('/auth', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && session) {
    // Redirect authenticated users to dashboard
    const redirectUrl = new URL('/protected/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/protected/:path*', '/auth'],
};
