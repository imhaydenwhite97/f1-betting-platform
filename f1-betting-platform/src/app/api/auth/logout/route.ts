import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Remove the authentication cookie
    removeAuthCookie();

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
