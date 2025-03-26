import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Invitation token is required' },
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

    // Verify the invitation token
    const invitation = await db.prepare(
      `SELECT i.id, i.group_id, i.email, i.status, i.expires_at, g.name as group_name
       FROM invitations i
       JOIN wager_groups g ON i.group_id = g.id
       WHERE i.token = ? AND i.status = 'pending'`
    )
    .bind(token)
    .first<{
      id: number;
      group_id: number;
      email: string;
      status: string;
      expires_at: string;
      group_name: string;
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

    return NextResponse.json({
      group: {
        id: invitation.group_id,
        name: invitation.group_name
      },
      email: invitation.email
    }, { status: 200 });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { message: 'An error occurred while verifying the invitation' },
      { status: 500 }
    );
  }
}
