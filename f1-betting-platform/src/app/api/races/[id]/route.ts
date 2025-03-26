import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { getRaceById, getRaceResults } from '@/lib/race-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raceId = parseInt(params.id);
    
    if (isNaN(raceId)) {
      return NextResponse.json(
        { message: 'Invalid race ID' },
        { status: 400 }
      );
    }

    // Get D1 database from environment
    const db = env.DB;
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 500 }
      );
    }

    const race = await getRaceById(db, raceId);
    
    if (!race) {
      return NextResponse.json(
        { message: 'Race not found' },
        { status: 404 }
      );
    }

    // Get race results if the race is completed
    let results = [];
    if (race.status === 'completed') {
      results = await getRaceResults(db, raceId);
    }
    
    return NextResponse.json({ race, results }, { status: 200 });
  } catch (error) {
    console.error('Error fetching race details:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching race details' },
      { status: 500 }
    );
  }
}
