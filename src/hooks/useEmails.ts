'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useEmailStore } from '@/store/emailStore';
import { Email } from '@/types/email';

export function useEmails() {
  const { data: session } = useSession();
  const {
    setEmails,
    setLoading,
    currentFolder,
    removeEmail,
    updateEmail,
    pushUndo,
    popUndo,
    showToast,
    selectedEmailId,
  } = useEmailStore();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEmails = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const labelMap: Record<string, string[]> = {
        inbox: ['INBOX'],
        starred: ['STARRED'],
        sent: ['SENT'],
        drafts: ['DRAFT'],
        trash: ['TRASH'],
        all: [],
      };
      const labelIds = labelMap[currentFolder] || ['INBOX'];
      const params = new URLSearchParams();
      labelIds.forEach((id) => params.append('labelIds', id));

      const res = await fetch(`/api/emails?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentFolder, setEmails, setLoading]);

  const archiveEmail = useCallback(async (email: Email) => {
    removeEmail(email.id);
    pushUndo({
      type: 'archive',
      emailId: email.id,
      previousLabels: email.labels,
      description: 'Email archived',
    });
    showToast('Archived - Press Z to undo');

    try {
      await fetch(`/api/emails/${email.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeLabelIds: ['INBOX'] }),
      });
    } catch {
      showToast('Failed to archive');
    }
  }, [removeEmail, pushUndo, showToast]);

  const starEmail = useCallback(async (email: Email) => {
    const isStarred = email.isStarred;
    updateEmail(email.id, { isStarred: !isStarred });
    pushUndo({
      type: isStarred ? 'unstar' : 'star',
      emailId: email.id,
      description: isStarred ? 'Star removed' : 'Email starred',
    });

    try {
      await fetch(`/api/emails/${email.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isStarred
            ? { removeLabelIds: ['STARRED'] }
            : { addLabelIds: ['STARRED'] }
        ),
      });
    } catch {
      updateEmail(email.id, { isStarred });
      showToast('Failed to update star');
    }
  }, [updateEmail, pushUndo, showToast]);

  const trashEmail = useCallback(async (email: Email) => {
    removeEmail(email.id);
    pushUndo({
      type: 'trash',
      emailId: email.id,
      previousLabels: email.labels,
      description: 'Email trashed',
    });
    showToast('Trashed - Press Z to undo');

    try {
      await fetch(`/api/emails/${email.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trash' }),
      });
    } catch {
      showToast('Failed to trash');
    }
  }, [removeEmail, pushUndo, showToast]);

  const markAsRead = useCallback(async (emailId: string) => {
    updateEmail(emailId, { isRead: true });
    try {
      await fetch(`/api/emails/${emailId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
      });
    } catch {
      // Silently fail
    }
  }, [updateEmail]);

  const snoozeEmail = useCallback(async (email: Email, snoozeUntil: Date) => {
    removeEmail(email.id);
    pushUndo({
      type: 'snooze',
      emailId: email.id,
      previousLabels: email.labels,
      description: `Snoozed until ${snoozeUntil.toLocaleDateString()}`,
    });
    showToast(`Snoozed until ${snoozeUntil.toLocaleDateString()}`);

    try {
      await fetch('/api/emails/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId: email.id, snoozeUntil: snoozeUntil.toISOString() }),
      });
    } catch {
      showToast('Failed to snooze');
    }
  }, [removeEmail, pushUndo, showToast]);

  const undoLastAction = useCallback(async () => {
    const action = popUndo();
    if (!action) {
      showToast('Nothing to undo');
      return;
    }

    try {
      if (action.type === 'archive') {
        await fetch(`/api/emails/${action.emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addLabelIds: ['INBOX'] }),
        });
      } else if (action.type === 'trash') {
        await fetch(`/api/emails/${action.emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'untrash' }),
        });
      } else if (action.type === 'star') {
        await fetch(`/api/emails/${action.emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ removeLabelIds: ['STARRED'] }),
        });
      } else if (action.type === 'unstar') {
        await fetch(`/api/emails/${action.emailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addLabelIds: ['STARRED'] }),
        });
      }
      showToast('Undone');
      fetchEmails();
    } catch {
      showToast('Failed to undo');
    }
  }, [popUndo, showToast, fetchEmails]);

  const searchEmails = useCallback(async (query: string) => {
    if (!query) {
      fetchEmails();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/emails/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchEmails, setEmails, setLoading]);

  // Initial fetch and polling
  useEffect(() => {
    fetchEmails();

    pollingRef.current = setInterval(fetchEmails, 60000); // Poll every 60 seconds
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchEmails]);

  return {
    fetchEmails,
    archiveEmail,
    starEmail,
    trashEmail,
    markAsRead,
    snoozeEmail,
    undoLastAction,
    searchEmails,
    selectedEmailId,
  };
}
