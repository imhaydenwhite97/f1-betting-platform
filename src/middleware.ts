import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // For now, we'll just return the next response
  // We'll implement proper auth checks once the basic deployment is working
  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*', '/auth'],
};
