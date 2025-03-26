'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, Users, Flag } from 'lucide-react';

interface Race {
  id: number;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

interface WagerGroup {
  id: number;
  name: string;
}

interface Bet {
  id: number;
  race_id: number;
  race_name: string;
  group_id: number;
  group_name: string;
  prediction: string;
  score: number | null;
}

export default function DashboardPage() {
  const [upcomingRaces, setUpcomingRaces] = useState<Race[]>([]);
  const [wagerGroups, setWagerGroups] = useState<WagerGroup[]>([]);
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch upcoming races
        const racesResponse = await fetch('/api/races?status=upcoming');
        if (!racesResponse.ok) {
          throw new Error('Failed to fetch upcoming races');
        }
        const racesData = await racesResponse.json();
        setUpcomingRaces(racesData.races.slice(0, 3)); // Show only next 3 races
        
        // Fetch user's wager groups
        const groupsResponse = await fetch('/api/wager-groups');
        if (!groupsResponse.ok) {
          throw new Error('Failed to fetch wager groups');
        }
        const groupsData = await groupsResponse.json();
        setWagerGroups(groupsData.groups);
        
        // Fetch user's bets
        const betsResponse = await fetch('/api/bets/user');
        if (!betsResponse.ok) {
          throw new Error('Failed to fetch user bets');
        }
        const betsData = await betsResponse.json();
        setUserBets(betsData.bets);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">F1 Betting Dashboard</h1>
        <div className="flex space-x-2">
          <Link href="/wager-groups/create">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Create Wager Group
            </Button>
          </Link>
          <Link href="/races">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Race Calendar
            </Button>
          </Link>
        </div>
      </header>
      
      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming Races</TabsTrigger>
          <TabsTrigger value="groups">My Wager Groups</TabsTrigger>
          <TabsTrigger value="bets">My Bets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {upcomingRaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRaces.map((race) => (
                <Card key={race.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{race.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      {formatDate(race.date)} • {race.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      Place your bets before the race starts to compete with your friends!
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-2 w-full">
                      <Link href={`/races/${race.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">View Details</Button>
                      </Link>
                      <Link href={`/bets/create/${race.id}`} className="flex-1">
                        <Button className="w-full">Place Bet</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No upcoming races found.</p>
              <Link href="/races" className="mt-4 inline-block">
                <Button variant="outline">View Full Calendar</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="groups" className="mt-6">
          {wagerGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wagerGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>Private wager group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Compete with friends and track your betting performance.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/wager-groups/${group.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Group</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">You haven't joined any wager groups yet.</p>
              <Link href="/wager-groups/create" className="mt-4 inline-block">
                <Button>Create Wager Group</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bets" className="mt-6">
          {userBets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBets.map((bet) => (
                <Card key={bet.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{bet.race_name}</CardTitle>
                    <CardDescription>{bet.group_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bet.score !== null ? (
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="font-bold text-lg">{bet.score} points</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Results pending
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/bets/${bet.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Bet</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">You haven't placed any bets yet.</p>
              <Link href="/races" className="mt-4 inline-block">
                <Button>View Race Calendar</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Flag className="h-6 w-6 mr-2 text-primary" />
          <h2 className="text-xl font-bold">Betting Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2">Base Scoring</h3>
            <ul className="space-y-1 text-sm">
              <li>• Correct Position: +25 points</li>
              <li>• One Position Off: +15 points</li>
              <li>• Two Positions Off: +10 points</li>
              <li>• Three Positions Off: +5 points</li>
              <li>• Driver in Top 10 but Wrong Spot: +2 points</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-2">Bonus Points</h3>
            <ul className="space-y-1 text-sm">
              <li>• Perfect Podium (Top 3 in exact order): +30 points</li>
              <li>• Perfect Top 5 (Exact Order): +50 points</li>
              <li>• Perfect Top 10 (Exact Order): +100 points</li>
              <li>• Correct Winner: +20 points</li>
              <li>• Fastest Lap Prediction: +10 points</li>
              <li>• Correct DNF Prediction: +15 points</li>
              <li>• Driver Not in Top 10 at All: -5 points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
