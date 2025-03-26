'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // We don't automatically log out to give the user a chance to confirm
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to home even if there's an error
      router.push('/');
    }
  };

  const handleCancel = () => {
    // Go back to previous page
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign Out</CardTitle>
          <CardDescription>
            Are you sure you want to sign out of your account?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You will need to sign in again to access your account and betting data.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
