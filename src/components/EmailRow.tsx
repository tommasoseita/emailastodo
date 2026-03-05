'use client';

import { Email } from '@/types/email';

interface EmailRowProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  onArchive?: (email: Email) => void;
  onSnooze?: (email: Email) => void;
  onStar?: (email: Email) => void;
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

export function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const emailDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function EmailRow({ email, isSelected, onClick, onArchive, onSnooze, onStar }: EmailRowProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-2 text-left transition-all duration-75 border-l-2 ${
        isSelected
          ? 'bg-[#1a1a35] border-l-[#6366f1]'
          : 'border-l-transparent hover:bg-[#111128]'
      }`}
    >
      {/* Unread dot */}
      <div className="w-2 flex-shrink-0">
        {!email.isRead && (
          <div className="w-[6px] h-[6px] rounded-full bg-[#6366f1]" />
        )}
      </div>

      {/* Sender */}
      <span className={`w-[160px] min-w-[160px] text-sm truncate ${
        !email.isRead ? 'text-white font-medium' : 'text-[#8888aa]'
      }`}>
        {email.from}
      </span>

      {/* Subject + Preview */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className={`text-sm truncate flex-shrink-0 max-w-[50%] ${
          !email.isRead ? 'text-[#e0e0ee]' : 'text-[#777799]'
        }`}>
          {email.subject}
        </span>
        <span className="text-sm text-[#444466] truncate">
          {email.snippet}
        </span>
      </div>

      {/* Hover actions */}
      <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
        {onArchive && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onArchive(email); }}
            className="p-1 text-[#555577] hover:text-white rounded transition-colors cursor-pointer"
            title="Done (E)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
        {onSnooze && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onSnooze(email); }}
            className="p-1 text-[#555577] hover:text-white rounded transition-colors cursor-pointer"
            title="Snooze (H)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        )}
        {onStar && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onStar(email); }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              email.isStarred ? 'text-yellow-500' : 'text-[#555577] hover:text-white'
            }`}
            title="Star (S)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={email.isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        )}
      </div>

      {/* Date + indicators (hidden on hover, replaced by actions) */}
      <div className="flex group-hover:hidden items-center gap-2 flex-shrink-0">
        {email.hasAttachments && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555577" strokeWidth="2" className="flex-shrink-0">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        )}
        {email.isStarred && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" strokeWidth="2" className="flex-shrink-0">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}
        <span className="text-xs text-[#555577] whitespace-nowrap">
          {formatDate(email.date)}
        </span>
      </div>
    </button>
  );
}
