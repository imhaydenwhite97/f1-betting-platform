import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { getCurrentUser } from '@/lib/auth/auth-utils';

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

    // Get current user
    const user = await getCurrentUser(db);
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { race_id, group_id, prediction, fastest_lap, dnf_prediction } = await request.json();

    // Validate input
    if (!race_id || !group_id || !prediction) {
      return NextResponse.json(
        { message: 'Race ID, group ID, and prediction are required' },
        { status: 400 }
      );
    }

    // Check if race exists and is upcoming
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

    if (race.status !== 'upcoming') {
      return NextResponse.json(
        { message: 'Betting is only available for upcoming races' },
        { status: 400 }
      );
    }

    // Check if user is a member of the group
    const membership = await db.prepare(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
    )
    .bind(group_id, user.id)
    .first();

    if (!membership) {
      return NextResponse.json(
        { message: 'You are not a member of this wager group' },
        { status: 403 }
      );
    }

    // Check if user already has a bet for this race and group
    const existingBet = await db.prepare(
      'SELECT id FROM bets WHERE user_id = ? AND race_id = ? AND group_id = ?'
    )
    .bind(user.id, race_id, group_id)
    .first();

    if (existingBet) {
      // Update existing bet
      await db.prepare(
        `UPDATE bets 
         SET prediction = ?, fastest_lap = ?, dnf_prediction = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
      )
      .bind(prediction, fastest_lap || null, dnf_prediction || null, existingBet.id)
      .run();

      return NextResponse.json(
        { message: 'Bet updated successfully' },
        { status: 200 }
      );
    } else {
      // Create new bet
      await db.prepare(
        `INSERT INTO bets (user_id, race_id, group_id, prediction, fastest_lap, dnf_prediction) 
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(user.id, race_id, group_id, prediction, fastest_lap || null, dnf_prediction || null)
      .run();

      return NextResponse.json(
        { message: 'Bet placed successfully' },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { message: 'An error occurred while placing your bet' },
      { status: 500 }
    );
  }
}
