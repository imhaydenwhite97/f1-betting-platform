'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function JoinWagerGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/wager-groups/verify-invite?token=${token}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Invalid invitation');
        }
        
        const data = await response.json();
        setGroupName(data.group.name);
      } catch (err: any) {
        setError(err.message || 'An error occurred while verifying the invitation');
      } finally {
        setIsLoading(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const handleJoin = async () => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/wager-groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join group');
      }

      setSuccess('You have successfully joined the group!');
      
      // Redirect to the group page after a short delay
      setTimeout(() => {
        router.push(`/wager-groups/${data.group_id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while joining the group');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Verifying invitation...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Join Wager Group</CardTitle>
            {groupName && (
              <CardDescription>
                You've been invited to join <strong>{groupName}</strong>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {!error && !success && (
              <div className="text-center py-4">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p className="mb-4">
                  Join this private wager group to bet on F1 races with friends and compete for the top spot on the leaderboard.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            {!error && !success && (
              <Button onClick={handleJoin} disabled={isJoining}>
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
