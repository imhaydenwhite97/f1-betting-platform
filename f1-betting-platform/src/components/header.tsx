'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { UserNav } from '@/components/user-nav';
import { usePathname } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/f1-logo.png" 
              alt="F1 Logo" 
              width={60} 
              height={24} 
              className="h-auto"
            />
            <span className="font-bold text-xl hidden sm:inline-block">F1 Betting</span>
          </Link>
          
          {!isLoading && user && !isAuthPage && (
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Dashboard
              </Link>
              <Link href="/races" className={`text-sm font-medium ${pathname?.startsWith('/races') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Races
              </Link>
              <Link href="/wager-groups" className={`text-sm font-medium ${pathname?.startsWith('/wager-groups') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary`}>
                Wager Groups
              </Link>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <UserNav user={user} />
          ) : !isAuthPage ? (
            <div className="flex gap-2">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
