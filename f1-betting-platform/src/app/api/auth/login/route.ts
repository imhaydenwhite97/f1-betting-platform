import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { loginUser, setAuthCookie } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get D1 database from environment
    const db = env.DB;
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 500 }
      );
    }

    // Attempt to login the user
    const result = await loginUser(db, email, password);

    if (!result) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set authentication cookie
    setAuthCookie(result.token);

    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: { 
          id: result.user.id, 
          username: result.user.username, 
          email: result.user.email 
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
