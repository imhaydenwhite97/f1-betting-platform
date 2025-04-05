'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setUser(profile);
      setLoading(false);
    };
    
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/images/f1-logo.svg" 
              alt="F1 Logo" 
              width={60} 
              height={30} 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">F1 Betting</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">Welcome, {user?.username || 'User'}</span>
            <button 
              onClick={handleSignOut}
              className="bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 mb-8 md:mb-0 md:mr-8">
          <nav className="bg-white shadow-md rounded-lg overflow-hidden">
            <ul>
              <li>
                <Link href="/protected/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-gray-100 border-l-4 border-red-600">
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/protected/races" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-red-600">
                  <span>Races</span>
                </Link>
              </li>
              <li>
                <Link href="/protected/groups" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-red-600">
                  <span>Betting Groups</span>
                </Link>
              </li>
              <li>
                <Link href="/protected/bets" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-red-600">
                  <span>My Bets</span>
                </Link>
              </li>
              <li>
                <Link href="/protected/profile" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-red-600">
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Upcoming Races</h2>
              <p className="text-gray-500">No upcoming races at the moment.</p>
              <Link href="/protected/races" className="text-red-600 hover:underline text-sm mt-2 inline-block">
                View All Races
              </Link>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-2">My Betting Groups</h2>
              <p className="text-gray-500">You are not part of any betting groups yet.</p>
              <Link href="/protected/groups" className="text-red-600 hover:underline text-sm mt-2 inline-block">
                Create a Group
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">My Recent Bets</h2>
            <p className="text-gray-500">You have not placed any bets yet.</p>
            <Link href="/protected/bets" className="text-red-600 hover:underline text-sm mt-2 inline-block">
              Place a Bet
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} F1 Betting Platform. All rights reserved.</p>
          <p className="text-sm mt-2 text-gray-400">
            This is a fan-made application and is not affiliated with Formula 1 or FIA.
          </p>
        </div>
      </footer>
    </div>
  );
}
