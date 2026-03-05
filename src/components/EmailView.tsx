'use client';

import { useEffect, useState, useRef } from 'react';
import { useEmailStore } from '@/store/emailStore';
import { useEmails } from '@/hooks/useEmails';
import { Email } from '@/types/email';
import DOMPurify from 'dompurify';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return time;
  if (diffDays === 1) return `Yesterday ${time}`;
  if (diffDays < 7) return `${date.toLocaleDateString([], { weekday: 'short' })} ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

export default function EmailView() {
  const { selectedEmailId } = useEmailStore();
  const { archiveEmail, starEmail, trashEmail, markAsRead } = useEmails();
  const [thread, setThread] = useState<Email[]>([]);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedEmailId) {
      setThread([]);
      return;
    }

    async function fetchThread() {
      setLoading(true);
      try {
        const res = await fetch(`/api/emails/${selectedEmailId}?thread=true`);
        if (res.ok) {
          const data = await res.json();
          const messages = data.messages || [data];
          setThread(messages);
          // Expand all messages for short threads, last message for long threads
          if (messages.length <= 3) {
            setExpandedMessages(new Set(messages.map((m: Email) => m.id)));
          } else {
            setExpandedMessages(new Set([messages[messages.length - 1].id]));
          }
          markAsRead(selectedEmailId!);
        }
      } catch (error) {
        console.error('Failed to fetch thread:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchThread();
  }, [selectedEmailId, markAsRead]);

  if (!selectedEmailId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a15]">
        <div className="text-center">
          <div className="text-sm text-[#444466]">Select an email to read</div>
          <div className="text-xs text-[#333355] mt-1">Use J/K to navigate, Enter to open</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a15]">
        <div className="text-sm text-[#555577]">Loading...</div>
      </div>
    );
  }

  const lastMessage = thread[thread.length - 1];
  if (!lastMessage) return null;

  function toggleExpanded(id: string) {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div ref={viewRef} className="flex-1 bg-[#0a0a15] overflow-y-auto">
      {/* Subject header */}
      <div className="sticky top-0 bg-[#0a0a15]/95 backdrop-blur-sm border-b border-[#1e1e3a] px-6 py-3 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold text-white truncate pr-4">{lastMessage.subject}</h1>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => archiveEmail(lastMessage)}
              className="p-2 text-[#666688] hover:text-white hover:bg-[#1a1a35] rounded transition-colors"
              title="Done (E)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              onClick={() => starEmail(lastMessage)}
              className={`p-2 rounded transition-colors ${lastMessage.isStarred ? 'text-yellow-500' : 'text-[#666688] hover:text-white'} hover:bg-[#1a1a35]`}
              title="Star (S)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={lastMessage.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
            <button
              onClick={() => trashEmail(lastMessage)}
              className="p-2 text-[#666688] hover:text-red-400 hover:bg-[#1a1a35] rounded transition-colors"
              title="Trash (#)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Thread Messages */}
      <div className="px-6 py-4 space-y-3">
        {thread.map((msg, idx) => {
          const isExpanded = expandedMessages.has(msg.id);

          return (
            <div key={msg.id}>
              {/* Message Header */}
              <button
                onClick={() => toggleExpanded(msg.id)}
                className="w-full flex items-center gap-3 py-2 text-left"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: getAvatarColor(msg.from) }}
                >
                  {getInitials(msg.from)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{msg.from}</span>
                    <span className="text-xs text-[#555577]">{formatFullDate(msg.date)}</span>
                  </div>
                  {!isExpanded && (
                    <div className="text-xs text-[#444466] truncate">{msg.snippet}</div>
                  )}
                </div>
              </button>

              {/* Message Body */}
              {isExpanded && (
                <div className="pl-11 pb-4">
                  <div className="text-xs text-[#555577] mb-3">
                    To: {msg.to}
                  </div>
                  {msg.bodyHtml ? (
                    <div
                      className="email-body text-sm text-[#ccccee] leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(msg.bodyHtml, {
                          ALLOWED_TAGS: [
                            'p', 'br', 'div', 'span', 'a', 'b', 'strong', 'i', 'em', 'u',
                            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
                            'table', 'thead', 'tbody', 'tr', 'td', 'th',
                            'img', 'blockquote', 'pre', 'code', 'hr',
                          ],
                          ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class', 'target'],
                        }),
                      }}
                    />
                  ) : msg.body ? (
                    <div className="text-sm text-[#ccccee] leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </div>
                  ) : (
                    <div className="text-sm text-[#444466] italic">No content</div>
                  )}
                </div>
              )}

              {/* Divider */}
              {idx < thread.length - 1 && (
                <div className="border-b border-[#1a1a30] ml-11" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
