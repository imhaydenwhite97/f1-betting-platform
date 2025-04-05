'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      
      if (profile) {
        setUser(profile);
        setUsername(profile.username || '');
        setFullName(profile.full_name || '');
      }
      
      setLoading(false);
    };
    
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUpdating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setSuccess('Profile updated successfully!');
      
      // Refresh user data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        setUser(profile);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(err);
    } finally {
      setUpdating(false);
    }
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
                <Link href="/protected/dashboard" className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 border-l-4 border-transparent hover:border-red-600">
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
                <Link href="/protected/profile" className="flex items-center space-x-3 px-4 py-3 bg-gray-100 border-l-4 border-red-600">
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                required
              />
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
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
