'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Race {
  id: number;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

interface LeaderboardEntry {
  user_id: number;
  username: string;
  score: number;
  position: number;
}

export default function LeaderboardPage() {
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<{ id: number; name: string } | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch group details
        const groupResponse = await fetch(`/api/wager-groups/${groupId}`);
        if (!groupResponse.ok) {
          throw new Error('Failed to fetch group details');
        }
        const groupData = await groupResponse.json();
        setGroup({ id: groupData.group.id, name: groupData.group.name });
        
        // Fetch completed races
        const racesResponse = await fetch('/api/races?status=completed');
        if (!racesResponse.ok) {
          throw new Error('Failed to fetch races');
        }
        const racesData = await racesResponse.json();
        setRaces(racesData.races);
        
        // Fetch overall leaderboard by default
        await fetchLeaderboard('all');
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      fetchLeaderboardData();
    }
  }, [groupId]);

  const fetchLeaderboard = async (raceId: string) => {
    try {
      setIsLoading(true);
      
      const url = raceId === 'all' 
        ? `/api/scores/leaderboard?group_id=${groupId}` 
        : `/api/scores/leaderboard?group_id=${groupId}&race_id=${raceId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);
      setSelectedRace(raceId);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRaceChange = (raceId: string) => {
    fetchLeaderboard(raceId);
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="font-bold">{position}</span>;
    }
  };

  if (isLoading && !leaderboard.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading leaderboard...</p>
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
        <Link href={`/wager-groups/${groupId}`}>
          <Button variant="outline" size="sm">
            &larr; Back to Group
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <h2 className="text-xl">{group.name}</h2>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Race Filter</CardTitle>
          <CardDescription>
            View scores for all races or filter by a specific race
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedRace === 'all' ? 'default' : 'outline'}
              onClick={() => handleRaceChange('all')}
            >
              All Races
            </Button>
            
            {races.map((race) => (
              <Button
                key={race.id}
                variant={selectedRace === race.id.toString() ? 'default' : 'outline'}
                onClick={() => handleRaceChange(race.id.toString())}
              >
                {race.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedRace === 'all' ? 'Overall Standings' : `Standings for ${races.find(r => r.id.toString() === selectedRace)?.name}`}
          </CardTitle>
          <CardDescription>
            {selectedRace === 'all' ? 'Total points across all races' : 'Points for this race only'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Position</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.user_id} className={entry.position <= 3 ? 'font-medium' : ''}>
                    <TableCell className="flex items-center justify-center">
                      {getPositionIcon(entry.position)}
                    </TableCell>
                    <TableCell>{entry.username}</TableCell>
                    <TableCell className="text-right font-bold">{entry.score} pts</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No scores available for this selection</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
