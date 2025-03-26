import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';

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

    const { searchParams } = request.nextUrl;
    const groupId = searchParams.get('group_id');
    const raceId = searchParams.get('race_id');

    // Validate input
    if (!groupId) {
      return NextResponse.json(
        { message: 'Group ID is required' },
        { status: 400 }
      );
    }

    let leaderboard;

    if (raceId) {
      // Leaderboard for a specific race
      leaderboard = await db.prepare(`
        SELECT 
          b.user_id,
          u.username,
          b.score,
          RANK() OVER (ORDER BY b.score DESC) as position
        FROM bets b
        JOIN users u ON b.user_id = u.id
        WHERE b.group_id = ? AND b.race_id = ? AND b.score IS NOT NULL
        ORDER BY position ASC
      `)
      .bind(groupId, raceId)
      .all();
    } else {
      // Overall leaderboard across all races
      leaderboard = await db.prepare(`
        SELECT 
          b.user_id,
          u.username,
          SUM(b.score) as score,
          RANK() OVER (ORDER BY SUM(b.score) DESC) as position
        FROM bets b
        JOIN users u ON b.user_id = u.id
        WHERE b.group_id = ? AND b.score IS NOT NULL
        GROUP BY b.user_id, u.username
        ORDER BY position ASC
      `)
      .bind(groupId)
      .all();
    }

    return NextResponse.json(
      { leaderboard: leaderboard.results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the leaderboard' },
      { status: 500 }
    );
  }
}
