import { D1Database } from '@cloudflare/workers-types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'f1-betting-platform-secret-key';
const TOKEN_EXPIRY = '7d';

export interface User {
  id: number;
  username: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
}

export async function registerUser(
  db: D1Database,
  username: string,
  email: string,
  password: string
): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);
    
    const result = await db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?) RETURNING id, username, email'
    )
    .bind(username, email, hashedPassword)
    .first<User>();
    
    return result || null;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

export async function loginUser(
  db: D1Database,
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  try {
    const user = await db.prepare(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?'
    )
    .bind(email)
    .first<User & { password_hash: string }>();
    
    if (!user) return null;
    
    const isPasswordValid = await comparePasswords(password, user.password_hash);
    if (!isPasswordValid) return null;
    
    const { password_hash, ...userData } = user;
    const token = generateToken(userData);
    
    return { user: userData, token };
  } catch (error) {
    console.error('Error logging in user:', error);
    return null;
  }
}

export function setAuthCookie(token: string): void {
  cookies().set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function getAuthCookie(): string | undefined {
  return cookies().get('auth_token')?.value;
}

export function removeAuthCookie(): void {
  cookies().set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
}

export async function getCurrentUser(db: D1Database): Promise<User | null> {
  const token = getAuthCookie();
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  try {
    const user = await db.prepare(
      'SELECT id, username, email FROM users WHERE id = ?'
    )
    .bind(decoded.id)
    .first<User>();
    
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function requireAuth(user: User | null): void {
  if (!user) {
    redirect('/auth/login');
  }
}

export function requireGuest(user: User | null): void {
  if (user) {
    redirect('/dashboard');
  }
}
