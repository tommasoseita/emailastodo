import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEmail, getThread, modifyEmail, trashEmail, untrashEmail } from '@/lib/gmail';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const thread = searchParams.get('thread') === 'true';

  try {
    if (thread) {
      const messages = await getThread(session.accessToken, id);
      return NextResponse.json({ messages });
    }
    const email = await getEmail(session.accessToken, id);
    return NextResponse.json(email);
  } catch (error) {
    console.error('Failed to fetch email:', error);
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, addLabelIds, removeLabelIds } = body;

  try {
    if (action === 'trash') {
      await trashEmail(session.accessToken, id);
    } else if (action === 'untrash') {
      await untrashEmail(session.accessToken, id);
    } else {
      await modifyEmail(session.accessToken, id, addLabelIds || [], removeLabelIds || []);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to modify email:', error);
    return NextResponse.json({ error: 'Failed to modify email' }, { status: 500 });
  }
}
