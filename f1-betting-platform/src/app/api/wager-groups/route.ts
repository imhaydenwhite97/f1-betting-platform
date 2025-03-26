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

    const { name } = await request.json();

    // Validate input
    if (!name) {
      return NextResponse.json(
        { message: 'Group name is required' },
        { status: 400 }
      );
    }

    // Create the wager group
    const result = await db.prepare(
      'INSERT INTO wager_groups (name, owner_id) VALUES (?, ?) RETURNING id, name, owner_id'
    )
    .bind(name, user.id)
    .first<{ id: number; name: string; owner_id: number }>();

    if (!result) {
      return NextResponse.json(
        { message: 'Failed to create wager group' },
        { status: 500 }
      );
    }

    // Add the creator as a member of the group
    await db.prepare(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)'
    )
    .bind(result.id, user.id)
    .run();

    return NextResponse.json(
      { message: 'Wager group created successfully', group: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating wager group:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the wager group' },
      { status: 500 }
    );
  }
}
