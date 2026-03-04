import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/gmail';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { to, subject, content, cc, bcc, inReplyTo, references, threadId } = body;

  if (!to || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await sendEmail(session.accessToken, to, subject, content, cc, bcc, inReplyTo, references, threadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
