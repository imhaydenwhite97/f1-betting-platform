'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Trophy, Flag, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Race {
  id: number;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

interface RaceResult {
  race_id: number;
  position: number;
  driver_name: string;
  team: string;
  fastest_lap: boolean;
  dnf: boolean;
}

export default function RaceDetailsPage() {
  const params = useParams();
  const raceId = params.id as string;
  
  const [race, setRace] = useState<Race | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        setResults(data.results || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching race details');
      } finally {
        setIsLoading(false);
      }
    };

    if (raceId) {
      fetchRaceDetails();
    }
  }, [raceId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading race details...</p>
      </div>
    );
  }

  if (error || !race) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">{error || 'Race not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/races">
          <Button variant="outline" size="sm">
            &larr; Back to Calendar
          </Button>
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{race.name}</CardTitle>
            {getStatusBadge(race.status)}
          </div>
          <CardDescription className="flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {race.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(race.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{formatTime(race.date)}</span>
          </div>
        </CardContent>
        <CardFooter>
          {race.status === 'upcoming' && (
            <Link href={`/bets/create/${race.id}`} className="w-full">
              <Button className="w-full">Place Bet</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
      
      {race.status === 'completed' && results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Race Results</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Pos</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={`${result.race_id}-${result.position}`}>
                      <TableCell className="font-medium">{result.position}</TableCell>
                      <TableCell>
                        {result.driver_name}
                        {result.fastest_lap && (
                          <Badge variant="purple" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                            <Flag className="h-3 w-3 mr-1" />
                            Fastest Lap
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{result.team}</TableCell>
                      <TableCell className="text-right">
                        {result.dnf ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            DNF
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Finished
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      
      {race.status === 'completed' && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500">No results available for this race.</p>
        </div>
      )}
    </div>
  );
}
