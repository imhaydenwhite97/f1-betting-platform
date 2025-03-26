import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { getCurrentUser } from '@/lib/auth/auth-utils';
import crypto from 'crypto';

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

    const { group_id, email } = await request.json();

    // Validate input
    if (!group_id || !email) {
      return NextResponse.json(
        { message: 'Group ID and email are required' },
        { status: 400 }
      );
    }

    // Check if user is the owner of the group
    const group = await db.prepare(
      'SELECT id, owner_id FROM wager_groups WHERE id = ?'
    )
    .bind(group_id)
    .first();

    if (!group) {
      return NextResponse.json(
        { message: 'Wager group not found' },
        { status: 404 }
      );
    }

    if (group.owner_id !== user.id) {
      return NextResponse.json(
        { message: 'Only the group owner can send invitations' },
        { status: 403 }
      );
    }

    // Check if the email is already a member
    const existingMember = await db.prepare(
      `SELECT u.id FROM users u
       JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = ? AND u.email = ?`
    )
    .bind(group_id, email)
    .first();

    if (existingMember) {
      return NextResponse.json(
        { message: 'This user is already a member of the group' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await db.prepare(
      'SELECT id FROM invitations WHERE group_id = ? AND email = ? AND status = "pending"'
    )
    .bind(group_id, email)
    .first();

    if (existingInvitation) {
      return NextResponse.json(
        { message: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Generate a unique token for the invitation
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation
    const result = await db.prepare(
      `INSERT INTO invitations (group_id, email, token, expires_at) 
       VALUES (?, ?, ?, ?) RETURNING id, email, status, created_at, expires_at`
    )
    .bind(group_id, email, token, expiresAt.toISOString())
    .first<{
      id: number;
      email: string;
      status: string;
      created_at: string;
      expires_at: string;
    }>();

    if (!result) {
      return NextResponse.json(
        { message: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // In a real application, you would send an email here
    // For this example, we'll just return the invitation details

    return NextResponse.json(
      { 
        message: 'Invitation sent successfully', 
        invitation: result 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending the invitation' },
      { status: 500 }
    );
  }
}
