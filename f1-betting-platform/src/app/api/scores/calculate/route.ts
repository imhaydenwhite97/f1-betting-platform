import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { getRaceResults } from '@/lib/race-data';
import { calculateScore } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    // Get D1 database from environment
    const db = env.DB;
    if (!db) {
      return NextResponse.json(
        { message: 'Database connection error' },
        { status: 500 }
      );
    }

    const { race_id } = await request.json();

    // Validate input
    if (!race_id) {
      return NextResponse.json(
        { message: 'Race ID is required' },
        { status: 400 }
      );
    }

    // Check if race exists and is completed
    const race = await db.prepare(
      'SELECT id, status FROM races WHERE id = ?'
    )
    .bind(race_id)
    .first();

    if (!race) {
      return NextResponse.json(
        { message: 'Race not found' },
        { status: 404 }
      );
    }

    if (race.status !== 'completed') {
      return NextResponse.json(
        { message: 'Cannot calculate scores for races that are not completed' },
        { status: 400 }
      );
    }

    // Get race results
    const raceResults = await getRaceResults(db, race_id);
    
    if (raceResults.length === 0) {
      return NextResponse.json(
        { message: 'No results found for this race' },
        { status: 404 }
      );
    }

    // Get all bets for this race
    const bets = await db.prepare(
      'SELECT id, user_id, group_id, prediction, fastest_lap, dnf_prediction FROM bets WHERE race_id = ?'
    )
    .bind(race_id)
    .all();

    // Calculate scores for each bet
    let updatedCount = 0;
    for (const bet of bets.results) {
      const score = calculateScore(
        bet.prediction,
        bet.fastest_lap,
        bet.dnf_prediction,
        raceResults
      );

      // Update bet with calculated score
      await db.prepare(
        'UPDATE bets SET score = ? WHERE id = ?'
      )
      .bind(score.totalScore, bet.id)
      .run();

      updatedCount++;
    }

    return NextResponse.json(
      { message: `Scores calculated and updated for ${updatedCount} bets` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating scores:', error);
    return NextResponse.json(
      { message: 'An error occurred while calculating scores' },
      { status: 500 }
    );
  }
}
