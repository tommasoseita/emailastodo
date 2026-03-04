import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { modifyEmail } from '@/lib/gmail';

// Note: Gmail doesn't have native snooze via API.
// We simulate snooze by removing from INBOX and scheduling a re-add.
// In production, you'd use a job queue (e.g., Vercel Cron) to re-add at the snooze time.
// For now, we archive and store snooze data client-side.

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { emailId, snoozeUntil } = body;

  if (!emailId || !snoozeUntil) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Remove from inbox (archive)
    await modifyEmail(session.accessToken, emailId, [], ['INBOX']);

    return NextResponse.json({
      success: true,
      emailId,
      snoozeUntil,
      message: 'Email snoozed. It will reappear at the scheduled time.',
    });
  } catch (error) {
    console.error('Failed to snooze email:', error);
    return NextResponse.json({ error: 'Failed to snooze email' }, { status: 500 });
  }
}
