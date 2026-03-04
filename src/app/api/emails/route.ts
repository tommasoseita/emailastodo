import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listEmails } from '@/lib/gmail';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const maxResults = parseInt(searchParams.get('maxResults') || '50');
  const labelIds = searchParams.getAll('labelIds');

  try {
    const result = await listEmails(
      session.accessToken,
      query,
      maxResults,
      labelIds.length > 0 ? labelIds : ['INBOX']
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}
