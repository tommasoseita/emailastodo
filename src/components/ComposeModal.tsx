'use client';

import { useState, useRef, useEffect } from 'react';
import { useEmailStore } from '@/store/emailStore';

export default function ComposeModal() {
  const { isComposing, setComposing, replyTo, replyMode, showToast } = useEmailStore();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isComposing && replyTo && replyMode) {
      if (replyMode === 'reply') {
        setTo(replyTo.fromEmail);
        setSubject(`Re: ${replyTo.subject.replace(/^Re:\s*/i, '')}`);
      } else if (replyMode === 'replyAll') {
        setTo(replyTo.fromEmail);
        setSubject(`Re: ${replyTo.subject.replace(/^Re:\s*/i, '')}`);
      } else if (replyMode === 'forward') {
        setTo('');
        setSubject(`Fwd: ${replyTo.subject.replace(/^Fwd:\s*/i, '')}`);
      }
    } else if (isComposing) {
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
    }
  }, [isComposing, replyTo, replyMode]);

  useEffect(() => {
    if (isComposing) {
      setTimeout(() => {
        if (replyMode === 'forward' || !replyMode) {
          toRef.current?.focus();
        } else {
          bodyRef.current?.focus();
        }
      }, 100);
    }
  }, [isComposing, replyMode]);

  if (!isComposing) return null;

  async function handleSend() {
    if (!to.trim()) {
      showToast('Please add a recipient');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          content: bodyRef.current?.innerHTML || '',
          threadId: replyTo?.threadId,
          inReplyTo: replyTo?.id,
        }),
      });
      if (res.ok) {
        showToast('Email sent!');
        setComposing(false);
      } else {
        showToast('Failed to send email');
      }
    } catch {
      showToast('Failed to send email');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  const modeLabel = replyMode === 'reply' ? 'Reply' : replyMode === 'replyAll' ? 'Reply All' : replyMode === 'forward' ? 'Forward' : 'New Email';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-4" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={() => setComposing(false)} />

      {/* Compose Window */}
      <div className="relative w-full max-w-[600px] bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e3a]">
          <span className="text-sm font-medium text-white">{modeLabel}</span>
          <button
            onClick={() => setComposing(false)}
            className="text-[#666688] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div className="px-4 py-2 space-y-1 border-b border-[#1e1e3a]">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#555577] w-8">To</label>
            <input
              ref={toRef}
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#333355]"
              placeholder="recipient@example.com"
            />
            <button
              onClick={() => setShowCc(!showCc)}
              className="text-xs text-[#555577] hover:text-white"
            >
              Cc/Bcc
            </button>
          </div>

          {showCc && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#555577] w-8">Cc</label>
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#333355]"
                  placeholder="cc@example.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#555577] w-8">Bcc</label>
                <input
                  type="email"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#333355]"
                  placeholder="bcc@example.com"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs text-[#555577] w-8">Sub</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder-[#333355]"
              placeholder="Subject"
            />
          </div>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          contentEditable
          className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-[#ccccee] outline-none"
          data-placeholder="Write your email..."
          suppressContentEditableWarning
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e3a]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (bodyRef.current) {
                  document.execCommand('bold');
                  bodyRef.current.focus();
                }
              }}
              className="p-1.5 text-[#666688] hover:text-white hover:bg-[#1a1a35] rounded transition-colors"
              title="Bold (Cmd+B)"
            >
              <strong className="text-xs">B</strong>
            </button>
            <button
              onClick={() => {
                if (bodyRef.current) {
                  document.execCommand('italic');
                  bodyRef.current.focus();
                }
              }}
              className="p-1.5 text-[#666688] hover:text-white hover:bg-[#1a1a35] rounded transition-colors"
              title="Italic (Cmd+I)"
            >
              <em className="text-xs">I</em>
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url && bodyRef.current) {
                  document.execCommand('createLink', false, url);
                  bodyRef.current.focus();
                }
              }}
              className="p-1.5 text-[#666688] hover:text-white hover:bg-[#1a1a35] rounded transition-colors"
              title="Link (Cmd+K)"
            >
              <span className="text-xs">🔗</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#333355]">⌘+Enter to send</span>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-4 py-1.5 bg-[#6366f1] hover:bg-[#5558e6] text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
