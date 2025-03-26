'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateWagerGroupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name) {
      setError('Group name is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/wager-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create wager group');
      }

      setSuccess('Wager group created successfully!');
      
      // Redirect to the new group page after a short delay
      setTimeout(() => {
        router.push(`/wager-groups/${data.group.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the wager group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Create Wager Group</h1>
      
      <div className="max-w-md mx-auto">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>New Wager Group</CardTitle>
              <CardDescription>
                Create a private group to bet on F1 races with your friends
              </CardDescription>
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
              
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., F1 Friends League"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
