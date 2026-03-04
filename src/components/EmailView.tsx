'use client';

import { useEffect, useState, useRef } from 'react';
import { useEmailStore } from '@/store/emailStore';
import { useEmails } from '@/hooks/useEmails';
import { Email } from '@/types/email';
import DOMPurify from 'dompurify';

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
          // Expand last message by default
          if (messages.length > 0) {
            setExpandedMessages(new Set([messages[messages.length - 1].id]));
          }
          // Mark as read
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
          <div className="text-[#333355] text-4xl mb-3">📬</div>
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

  function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div ref={viewRef} className="flex-1 bg-[#0a0a15] overflow-y-auto">
      {/* Email Header */}
      <div className="sticky top-0 bg-[#0a0a15]/95 backdrop-blur-sm border-b border-[#1e1e3a] px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-white truncate pr-4">{lastMessage.subject}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => archiveEmail(lastMessage)}
              className="p-2 text-[#666688] hover:text-white hover:bg-[#1a1a35] rounded transition-colors"
              title="Archive (E)"
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
              ★
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
      <div className="px-6 py-4 space-y-4">
        {thread.map((msg) => {
          const isExpanded = expandedMessages.has(msg.id);

          return (
            <div key={msg.id} className="border border-[#1e1e3a] rounded-lg overflow-hidden">
              {/* Message Header */}
              <button
                onClick={() => toggleExpanded(msg.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#12122a] transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                  style={{
                    backgroundColor: (() => {
                      const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#3b82f6'];
                      let hash = 0;
                      for (let i = 0; i < msg.from.length; i++) hash = msg.from.charCodeAt(i) + ((hash << 5) - hash);
                      return colors[Math.abs(hash) % colors.length];
                    })(),
                  }}
                >
                  {msg.from.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{msg.from}</span>
                    <span className="text-[11px] text-[#555577]">{formatFullDate(msg.date)}</span>
                  </div>
                  {!isExpanded && (
                    <div className="text-xs text-[#444466] truncate">{msg.snippet}</div>
                  )}
                </div>
              </button>

              {/* Message Body */}
              {isExpanded && (
                <div className="px-4 pb-4">
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
                  ) : (
                    <div className="text-sm text-[#ccccee] leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
