export interface Email {
  id: string;
  threadId: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  bodyHtml: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  hasAttachments: boolean;
}

export interface Thread {
  id: string;
  messages: Email[];
  snippet: string;
  historyId: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  messagesTotal: number;
  messagesUnread: number;
}

export type SplitCategory = 'important' | 'notifications' | 'newsletters' | 'other';
export type Folder = 'inbox' | 'starred' | 'snoozed' | 'sent' | 'drafts' | 'trash' | 'all';

export interface SnoozeOption {
  label: string;
  getDate: () => Date;
}

export interface UndoAction {
  type: 'archive' | 'trash' | 'star' | 'unstar' | 'read' | 'unread' | 'label' | 'snooze';
  emailId: string;
  previousLabels?: string[];
  description: string;
}
