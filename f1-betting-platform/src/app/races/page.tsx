'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Race {
  id: number;
  name: string;
  location: string;
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
}

export default function RaceCalendarPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/races');
        
        if (!response.ok) {
          throw new Error('Failed to fetch races');
        }
        
        const data = await response.json();
        setRaces(data.races);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching races');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaces();
  }, []);

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
        <p className="text-lg">Loading race calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">F1 Race Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {races.map((race) => (
          <Card key={race.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{race.name}</CardTitle>
                {getStatusBadge(race.status)}
              </div>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {race.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
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
              <Link href={`/races/${race.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  {race.status === 'completed' ? 'View Results' : 'View Details'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {races.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No races found in the calendar.</p>
        </div>
      )}
    </div>
  );
}
