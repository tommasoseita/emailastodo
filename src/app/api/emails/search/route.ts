import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchEmails } from '@/lib/gmail';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  try {
    const emails = await searchEmails(session.accessToken, query);
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Failed to search emails:', error);
    return NextResponse.json({ error: 'Failed to search emails' }, { status: 500 });
  }
}
