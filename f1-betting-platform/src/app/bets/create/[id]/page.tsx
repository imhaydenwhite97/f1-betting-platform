'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect } from 'react';

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

// List of F1 drivers for the 2025 season
const F1_DRIVERS = [
  { name: 'Max Verstappen', team: 'Red Bull Racing' },
  { name: 'Sergio Perez', team: 'Red Bull Racing' },
  { name: 'Lewis Hamilton', team: 'Mercedes' },
  { name: 'George Russell', team: 'Mercedes' },
  { name: 'Charles Leclerc', team: 'Ferrari' },
  { name: 'Carlos Sainz', team: 'Ferrari' },
  { name: 'Lando Norris', team: 'McLaren' },
  { name: 'Oscar Piastri', team: 'McLaren' },
  { name: 'Fernando Alonso', team: 'Aston Martin' },
  { name: 'Lance Stroll', team: 'Aston Martin' },
  { name: 'Pierre Gasly', team: 'Alpine' },
  { name: 'Esteban Ocon', team: 'Alpine' },
  { name: 'Nico Hulkenberg', team: 'Haas F1 Team' },
  { name: 'Kevin Magnussen', team: 'Haas F1 Team' },
  { name: 'Yuki Tsunoda', team: 'RB' },
  { name: 'Daniel Ricciardo', team: 'RB' },
  { name: 'Valtteri Bottas', team: 'Sauber' },
  { name: 'Zhou Guanyu', team: 'Sauber' },
  { name: 'Alex Albon', team: 'Williams' },
  { name: 'Logan Sargeant', team: 'Williams' },
];

export default function CreateBetPage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params.id as string;
  
  const [race, setRace] = useState<Race | null>(null);
  const [groups, setGroups] = useState<WagerGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [driverPredictions, setDriverPredictions] = useState<string[]>(Array(10).fill(''));
  const [fastestLap, setFastestLap] = useState<string>('');
  const [dnfPredictions, setDnfPredictions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRaceDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/races/${raceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch race details');
        }
        
        const data = await response.json();
        setRace(data.race);
        
        // Fetch user's wager groups
        const groupsResponse = await fetch('/api/wager-groups');
        
        if (!groupsResponse.ok) {
          throw new Error('Failed to fetch wager groups');
        }
        
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.groups);
        
        if (groupsData.groups.length > 0) {
          setSelectedGroup(groupsData.groups[0].id.toString());
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    if (raceId) {
      fetchRaceDetails();
    }
  }, [raceId]);

  const handleDriverChange = (index: number, value: string) => {
    const newPredictions = [...driverPredictions];
    newPredictions[index] = value;
    setDriverPredictions(newPredictions);
  };

  const handleDNFToggle = (driverName: string) => {
    setDnfPredictions((prev) => {
      if (prev.includes(driverName)) {
        return prev.filter((name) => name !== driverName);
      } else {
        return [...prev, driverName];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!selectedGroup) {
      setError('Please select a wager group');
      return;
    }

    // Check for duplicate drivers in top 10
    const filledPredictions = driverPredictions.filter(Boolean);
    if (new Set(filledPredictions).size !== filledPredictions.length) {
      setError('You cannot select the same driver multiple times in your top 10');
      return;
    }

    // Ensure at least top 3 are filled
    if (!driverPredictions[0] || !driverPredictions[1] || !driverPredictions[2]) {
      setError('Please fill at least the top 3 positions');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          race_id: parseInt(raceId),
          group_id: parseInt(selectedGroup),
          prediction: JSON.stringify(driverPredictions),
          fastest_lap: fastestLap,
          dnf_prediction: JSON.stringify(dnfPredictions),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save bet');
      }

      setSuccess('Your bet has been placed successfully!');
      
      // Redirect to race details page after a short delay
      setTimeout(() => {
        router.push(`/races/${raceId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your bet');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">Race not found</p>
      </div>
    );
  }

  if (race.status !== 'upcoming') {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <p className="text-lg text-red-500 mb-4">Betting is only available for upcoming races</p>
        <Link href={`/races/${raceId}`}>
          <Button variant="outline">Back to Race Details</Button>
        </Link>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <p className="text-lg text-amber-500 mb-4">You need to join or create a wager group before placing bets</p>
        <Link href="/wager-groups">
          <Button>Manage Wager Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/races/${raceId}`}>
          <Button variant="outline" size="sm">
            &larr; Back to Race Details
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Place Your Bet</h1>
      <p className="text-xl mb-6">{race.name}</p>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Wager Group</CardTitle>
            <CardDescription>Choose which group you're betting with</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a wager group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Predict Race Finishing Order</CardTitle>
            <CardDescription>Select drivers for each position (at least top 3 required)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 font-bold text-center">{index + 1}</div>
                  <Select value={driverPredictions[index]} onValueChange={(value) => handleDriverChange(index, value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={`Select driver for P${index + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {F1_DRIVERS.map((driver) => (
                        <SelectItem key={driver.name} value={driver.name}>
                          {driver.name} ({driver.team})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fastest Lap Prediction</CardTitle>
            <CardDescription>Select the driver you think will set the fastest lap</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={fastestLap} onValueChange={setFastestLap}>
              <SelectTrigger>
                <SelectValue placeholder="Select driver for fastest lap" />
              </SelectTrigger>
              <SelectContent>
                {F1_DRIVERS.map((driver) => (
                  <SelectItem key={driver.name} value={driver.name}>
                    {driver.name} ({driver.team})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>DNF Predictions</CardTitle>
            <CardDescription>Select drivers you think will not finish the race</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {F1_DRIVERS.map((driver) => (
                <div key={driver.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dnf-${driver.name}`}
                    checked={dnfPredictions.includes(driver.name)}
                    onCheckedChange={() => handleDNFToggle(driver.name)}
                  />
                  <Label htmlFor={`dnf-${driver.name}`} className="cursor-pointer">
                    {driver.name} ({driver.team})
                  </Label>
                </div>
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
        
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? 'Saving...' : 'Place Bet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
