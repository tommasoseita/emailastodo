import { Email } from '@/types/email';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function gmailFetch(accessToken: string, path: string, options?: RequestInit) {
  const res = await fetch(`${GMAIL_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(base64);
  }
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractBody(payload: Record<string, unknown>): { text: string; html: string } {
  let text = '';
  let html = '';

  const mimeType = payload.mimeType as string;
  const body = payload.body as { data?: string; size?: number } | undefined;
  const parts = payload.parts as Array<Record<string, unknown>> | undefined;

  if (mimeType === 'text/plain' && body?.data) {
    text = decodeBase64Url(body.data);
  } else if (mimeType === 'text/html' && body?.data) {
    html = decodeBase64Url(body.data);
  } else if (parts) {
    for (const part of parts) {
      const partResult = extractBody(part);
      if (partResult.text) text = partResult.text;
      if (partResult.html) html = partResult.html;
    }
  }

  return { text, html };
}

function parseEmail(msg: Record<string, unknown>): Email {
  const payload = msg.payload as Record<string, unknown>;
  const headers = (payload?.headers || []) as Array<{ name: string; value: string }>;
  const labelIds = (msg.labelIds || []) as string[];

  const fromRaw = getHeader(headers, 'From');
  const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/);
  const fromName = fromMatch ? fromMatch[1].replace(/"/g, '').trim() : fromRaw;
  const fromEmail = fromMatch ? fromMatch[2] : fromRaw;

  const { text, html } = payload ? extractBody(payload) : { text: '', html: '' };

  const parts = (payload?.parts || []) as Array<{ filename?: string }>;
  const hasAttachments = parts.some((p) => p.filename && p.filename.length > 0);

  return {
    id: msg.id as string,
    threadId: msg.threadId as string,
    from: fromName,
    fromEmail,
    to: getHeader(headers, 'To'),
    subject: getHeader(headers, 'Subject'),
    snippet: msg.snippet as string,
    body: text,
    bodyHtml: html,
    date: getHeader(headers, 'Date'),
    isRead: !labelIds.includes('UNREAD'),
    isStarred: labelIds.includes('STARRED'),
    labels: labelIds,
    hasAttachments,
  };
}

export async function listEmails(
  accessToken: string,
  query: string = '',
  maxResults: number = 50,
  labelIds: string[] = ['INBOX']
): Promise<{ emails: Email[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
  });
  if (query) params.set('q', query);
  if (labelIds.length > 0) {
    labelIds.forEach((id) => params.append('labelIds', id));
  }

  const listData = await gmailFetch(accessToken, `/messages?${params}`);
  const messages = (listData.messages || []) as Array<{ id: string }>;

  if (messages.length === 0) {
    return { emails: [], nextPageToken: listData.nextPageToken };
  }

  // Fetch full message data in parallel (batch of up to 20)
  const emails = await Promise.all(
    messages.slice(0, 20).map(async (msg) => {
      const fullMsg = await gmailFetch(accessToken, `/messages/${msg.id}?format=full`);
      return parseEmail(fullMsg);
    })
  );

  return { emails, nextPageToken: listData.nextPageToken };
}

export async function getEmail(accessToken: string, id: string): Promise<Email> {
  const msg = await gmailFetch(accessToken, `/messages/${id}?format=full`);
  return parseEmail(msg);
}

export async function getThread(accessToken: string, threadId: string): Promise<Email[]> {
  const thread = await gmailFetch(accessToken, `/threads/${threadId}?format=full`);
  const messages = (thread.messages || []) as Array<Record<string, unknown>>;
  return messages.map(parseEmail);
}

export async function modifyEmail(
  accessToken: string,
  id: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = []
): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({ addLabelIds, removeLabelIds }),
  });
}

export async function trashEmail(accessToken: string, id: string): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/trash`, { method: 'POST' });
}

export async function untrashEmail(accessToken: string, id: string): Promise<void> {
  await gmailFetch(accessToken, `/messages/${id}/untrash`, { method: 'POST' });
}

export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  cc?: string,
  bcc?: string,
  inReplyTo?: string,
  references?: string,
  threadId?: string
): Promise<void> {
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
  ];
  if (cc) messageParts.splice(1, 0, `Cc: ${cc}`);
  if (bcc) messageParts.splice(1, 0, `Bcc: ${bcc}`);
  if (inReplyTo) messageParts.push(`In-Reply-To: ${inReplyTo}`);
  if (references) messageParts.push(`References: ${references}`);

  const raw = messageParts.join('\r\n') + '\r\n\r\n' + body;
  const encoded = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const payload: Record<string, string> = { raw: encoded };
  if (threadId) payload.threadId = threadId;

  await gmailFetch(accessToken, '/messages/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function searchEmails(
  accessToken: string,
  query: string,
  maxResults: number = 20
): Promise<Email[]> {
  const { emails } = await listEmails(accessToken, query, maxResults, []);
  return emails;
}

export async function getLabels(accessToken: string) {
  const data = await gmailFetch(accessToken, '/labels');
  return data.labels as Array<{ id: string; name: string; messagesTotal?: number; messagesUnread?: number }>;
}
