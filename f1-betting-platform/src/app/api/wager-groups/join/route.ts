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

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Verify the invitation token
    const invitation = await db.prepare(
      `SELECT id, group_id, email, status, expires_at
       FROM invitations
       WHERE token = ? AND status = 'pending'`
    )
    .bind(token)
    .first<{
      id: number;
      group_id: number;
      email: string;
      status: string;
      expires_at: string;
    }>();

    if (!invitation) {
      return NextResponse.json(
        { message: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if the invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return NextResponse.json(
        { message: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Check if the invitation email matches the current user's email
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { message: 'This invitation was sent to a different email address' },
        { status: 403 }
      );
    }

    // Check if the user is already a member of the group
    const existingMembership = await db.prepare(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?'
    )
    .bind(invitation.group_id, user.id)
    .first();

    if (existingMembership) {
      // Update invitation status to accepted
      await db.prepare(
        'UPDATE invitations SET status = "accepted" WHERE id = ?'
      )
      .bind(invitation.id)
      .run();

      return NextResponse.json(
        { message: 'You are already a member of this group', group_id: invitation.group_id },
        { status: 200 }
      );
    }

    // Add the user to the group
    await db.prepare(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)'
    )
    .bind(invitation.group_id, user.id)
    .run();

    // Update invitation status to accepted
    await db.prepare(
      'UPDATE invitations SET status = "accepted" WHERE id = ?'
    )
    .bind(invitation.id)
    .run();

    return NextResponse.json(
      { message: 'You have successfully joined the group', group_id: invitation.group_id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { message: 'An error occurred while joining the group' },
      { status: 500 }
    );
  }
}
