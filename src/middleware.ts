import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // For now, we'll just pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*', '/auth'],
};
