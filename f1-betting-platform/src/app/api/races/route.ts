import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { getAllRaces } from '@/lib/race-data';

export async function GET(request: NextRequest) {
  try {
    // Get D1 database from environment
    const db = env.DB;
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 500 }
      );
    }

    const races = await getAllRaces(db);
    
    return NextResponse.json({ races }, { status: 200 });
  } catch (error) {
    console.error('Error fetching races:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching races' },
      { status: 500 }
    );
  }
}
