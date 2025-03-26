import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { registerUser } from '@/lib/auth/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password length validation
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
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

    // Check if user already exists
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    )
    .bind(email, username)
    .first();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Register the user
    const user = await registerUser(db, username, email, password);

    if (!user) {
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User registered successfully', user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
