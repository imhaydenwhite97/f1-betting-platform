'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Copy, Mail, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface WagerGroup {
  id: number;
  name: string;
  owner_id: number;
}

interface Member {
  id: number;
  username: string;
  email: string;
  joined_at: string;
}

interface Invitation {
  id: number;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
}

export default function WagerGroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<WagerGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/wager-groups/${groupId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch group details');
        }
        
        const data = await response.json();
        setGroup(data.group);
        setMembers(data.members);
        setInvitations(data.invitations);
        setIsOwner(data.isOwner);
        
        if (data.inviteToken) {
          const baseUrl = window.location.origin;
          setInviteLink(`${baseUrl}/wager-groups/join?token=${data.inviteToken}`);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching group details');
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    if (!inviteEmail) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setError('Invalid email format');
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch('/api/wager-groups/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: parseInt(groupId),
          email: inviteEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send invitation');
      }

      setSuccess('Invitation sent successfully!');
      setInviteEmail('');
      
      // Update invitations list
      setInvitations([...invitations, data.invitation]);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the invitation');
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSuccess('Invite link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">Wager group not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Badge variant="outline" className="text-sm">
          <Users className="h-3 w-3 mr-1" />
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </Badge>
      </div>
      
      <Tabs defaultValue="members" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>
                People who can place bets in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.username}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{formatDate(member.joined_at)}</TableCell>
                      <TableCell>
                        {member.id === group.owner_id ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Owner
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Member
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invitations</CardTitle>
              <CardDescription>
                Invite friends to join your wager group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isOwner && (
                <>
                  <form onSubmit={handleInvite} className="space-y-4">
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
                    
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label htmlFor="email" className="sr-only">Email</Label>
                        <Input
                          id="email"
                          placeholder="friend@example.com"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isSending}>
                        <Mail className="h-4 w-4 mr-2" />
                        {isSending ? 'Sending...' : 'Send Invite'}
                      </Button>
                    </div>
                  </form>
                  
                  {inviteLink && (
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Invite Link</Label>
                        <Button variant="ghost" size="sm" onClick={copyInviteLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input value={inviteLink} readOnly onClick={(e) => e.currentTarget.select()} />
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this link with friends to invite them to your group
                      </p>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
                {invitations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>{formatDate(invitation.created_at)}</TableCell>
                          <TableCell>{formatDate(invitation.expires_at)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={invitation.status === 'pending' ? 'outline' : 
                                     invitation.status === 'accepted' ? 'success' : 'destructive'}
                              className={invitation.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                        invitation.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                                        'bg-red-50 text-red-700 border-red-200'}
                            >
                              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending invitations</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
