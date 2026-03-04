'use client';

import { Email } from '@/types/email';

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

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
  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#2563eb',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export default function EmailRow({ email, isSelected, onClick }: EmailRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-100 border-l-2 ${
        isSelected
          ? 'bg-[#1a1a35] border-l-[#6366f1]'
          : 'border-l-transparent hover:bg-[#12122a]'
      } ${!email.isRead ? 'font-medium' : ''}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 min-w-[32px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
        style={{ backgroundColor: getAvatarColor(email.from) }}
      >
        {getInitials(email.from)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${!email.isRead ? 'text-white' : 'text-[#aaaacc]'}`}>
            {email.from}
          </span>
          <span className="text-[11px] text-[#555577] whitespace-nowrap">
            {formatDate(email.date)}
          </span>
        </div>
        <div className={`text-sm truncate ${!email.isRead ? 'text-[#ccccee]' : 'text-[#666688]'}`}>
          {email.subject}
        </div>
        <div className="text-xs text-[#444466] truncate mt-0.5">
          {email.snippet}
        </div>
      </div>

      {/* Star indicator */}
      {email.isStarred && (
        <span className="text-yellow-500 text-sm">★</span>
      )}
      {email.hasAttachments && (
        <span className="text-[#555577] text-xs">📎</span>
      )}
    </button>
  );
}
